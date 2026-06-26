import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_password_hash, verify_password
from app.models.email_otps import EmailOtp
from app.models.pending_student_registrations import PendingStudentRegistration
from app.models.pending_tutor_registrations import PendingTutorRegistration
from app.models.students import Student
from app.models.tutors import Tutor
from app.schemas.enums import AuthUserRoleEnum, OtpPurposeEnum
from app.services.email_service import EmailDeliveryError, send_otp_email


class OtpError(Exception):
    def __init__(self, message: str, code: str = "otp_error"):
        self.message = message
        self.code = code
        super().__init__(message)


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _as_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _generate_otp_code() -> str:
    length = settings.OTP_LENGTH
    return "".join(str(secrets.randbelow(10)) for _ in range(length))


def _purpose_label(purpose: OtpPurposeEnum) -> str:
    if purpose == OtpPurposeEnum.REGISTRATION:
        return "registration"
    return "password reset"


def _email_exists_for_role(db: Session, email: str, role: AuthUserRoleEnum) -> bool:
    normalized = _normalize_email(email)
    if role == AuthUserRoleEnum.STUDENT:
        return db.scalar(select(Student.student_id).where(Student.email == normalized)) is not None
    return db.scalar(select(Tutor.tutor_id).where(Tutor.email == normalized)) is not None


def _pending_tutor_email_taken(
    db: Session, email: str, exclude_pending_id: int | None = None
) -> bool:
    normalized = _normalize_email(email)
    stmt = select(PendingTutorRegistration.pending_id).where(
        PendingTutorRegistration.email == normalized
    )
    if exclude_pending_id is not None:
        stmt = stmt.where(PendingTutorRegistration.pending_id != exclude_pending_id)
    return db.scalar(stmt) is not None


def _check_otp_lockout(
    db: Session, email: str, purpose: OtpPurposeEnum, role: AuthUserRoleEnum
) -> None:
    now = _now()
    locked_until = db.scalar(
        select(EmailOtp.locked_until)
        .where(
            EmailOtp.email == email,
            EmailOtp.purpose == purpose,
            EmailOtp.role == role,
            EmailOtp.locked_until.is_not(None),
        )
        .order_by(EmailOtp.locked_until.desc())
    )
    if locked_until is not None and _as_utc(locked_until) > now:
        raise OtpError(
            "Too many failed attempts. Try again later or request a new code.",
            "otp_locked",
        )


def _check_send_cooldown(
    db: Session, email: str, purpose: OtpPurposeEnum, role: AuthUserRoleEnum
) -> None:
    latest_created_at = db.scalar(
        select(EmailOtp.created_at)
        .where(
            EmailOtp.email == email,
            EmailOtp.purpose == purpose,
            EmailOtp.role == role,
        )
        .order_by(EmailOtp.created_at.desc())
    )
    if latest_created_at is None:
        return
    elapsed = (_now() - _as_utc(latest_created_at)).total_seconds()
    if elapsed < settings.OTP_SEND_COOLDOWN_SECONDS:
        wait_seconds = int(settings.OTP_SEND_COOLDOWN_SECONDS - elapsed)
        raise OtpError(
            f"Please wait {wait_seconds} seconds before requesting another code.",
            "otp_rate_limited",
        )


def send_registration_otp(db: Session, email: str, role: AuthUserRoleEnum) -> None:
    normalized = _normalize_email(email)
    if _email_exists_for_role(db, normalized, role):
        raise OtpError("Email already registered", "email_taken")
    if role == AuthUserRoleEnum.TUTOR and _pending_tutor_email_taken(db, normalized):
        raise OtpError("Email already registered", "email_taken")

    _create_and_send_otp(db, normalized, OtpPurposeEnum.REGISTRATION, role)


def send_pending_tutor_registration_otp(
    db: Session, pending: PendingTutorRegistration
) -> None:
    if _email_exists_for_role(db, pending.email, AuthUserRoleEnum.TUTOR):
        raise OtpError("Email already registered", "email_taken")
    _create_and_send_otp(
        db, pending.email, OtpPurposeEnum.REGISTRATION, AuthUserRoleEnum.TUTOR
    )


def send_pending_student_registration_otp(
    db: Session, pending: PendingStudentRegistration
) -> None:
    if _email_exists_for_role(db, pending.email, AuthUserRoleEnum.STUDENT):
        raise OtpError("Email already registered", "email_taken")
    _create_and_send_otp(
        db, pending.email, OtpPurposeEnum.REGISTRATION, AuthUserRoleEnum.STUDENT
    )


def send_registration_completion_otp(db: Session, email: str, role: AuthUserRoleEnum) -> None:
    normalized = _normalize_email(email)
    if not _email_exists_for_role(db, normalized, role):
        raise OtpError("Account not found", "account_not_found")

    _create_and_send_otp(db, normalized, OtpPurposeEnum.REGISTRATION, role)


def send_password_reset_otp(db: Session, email: str, role: AuthUserRoleEnum) -> None:
    normalized = _normalize_email(email)
    if not _email_exists_for_role(db, normalized, role):
        return

    _create_and_send_otp(db, normalized, OtpPurposeEnum.PASSWORD_RESET, role)


def verify_otp(
    db: Session,
    email: str,
    code: str,
    purpose: OtpPurposeEnum,
    role: AuthUserRoleEnum,
) -> None:
    normalized = _normalize_email(email)
    now = _now()

    _check_otp_lockout(db, normalized, purpose, role)

    otp = db.scalar(
        select(EmailOtp)
        .where(
            EmailOtp.email == normalized,
            EmailOtp.purpose == purpose,
            EmailOtp.role == role,
            EmailOtp.used_at.is_(None),
        )
        .order_by(EmailOtp.created_at.desc())
    )
    if otp is None:
        raise OtpError("Invalid or expired verification code", "otp_invalid")

    if _as_utc(otp.expires_at) < now:
        raise OtpError("Verification code has expired", "otp_expired")

    if not verify_password(code, otp.code_hash):
        otp.attempt_count += 1
        if otp.attempt_count >= settings.OTP_MAX_ATTEMPTS:
            otp.used_at = now
            otp.locked_until = now + timedelta(minutes=settings.OTP_VERIFY_LOCKOUT_MINUTES)
            db.commit()
            raise OtpError(
                "Too many failed attempts. Request a new verification code.",
                "otp_locked",
            )
        db.commit()
        raise OtpError("Invalid or expired verification code", "otp_invalid")

    otp.used_at = now
    otp.locked_until = None
    db.commit()


def _create_and_send_otp(
    db: Session,
    email: str,
    purpose: OtpPurposeEnum,
    role: AuthUserRoleEnum,
) -> None:
    _check_otp_lockout(db, email, purpose, role)
    _check_send_cooldown(db, email, purpose, role)

    now = _now()
    code = _generate_otp_code()

    db.execute(
        delete(EmailOtp).where(
            EmailOtp.email == email,
            EmailOtp.purpose == purpose,
            EmailOtp.role == role,
            EmailOtp.used_at.is_(None),
        )
    )

    otp = EmailOtp(
        email=email,
        code_hash=get_password_hash(code),
        purpose=purpose,
        role=role,
        expires_at=now + timedelta(minutes=settings.OTP_EXPIRE_MINUTES),
        attempt_count=0,
        locked_until=None,
        created_at=now,
    )
    db.add(otp)
    db.commit()

    try:
        send_otp_email(email, code, _purpose_label(purpose))
    except EmailDeliveryError as exc:
        db.execute(delete(EmailOtp).where(EmailOtp.otp_id == otp.otp_id))
        db.commit()
        raise OtpError(str(exc), "email_delivery_failed") from exc

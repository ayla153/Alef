import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_password_hash, verify_password
from app.models.email_otps import EmailOtp
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


def send_registration_otp(db: Session, email: str, role: AuthUserRoleEnum) -> None:
    normalized = _normalize_email(email)
    if _email_exists_for_role(db, normalized, role):
        raise OtpError("Email already registered", "email_taken")

    _create_and_send_otp(db, normalized, OtpPurposeEnum.REGISTRATION, role)


def send_registration_completion_otp(db: Session, email: str, role: AuthUserRoleEnum) -> None:
    """Send registration OTP for an account that already exists (e.g. tutor step-4 completion)."""
    normalized = _normalize_email(email)
    if not _email_exists_for_role(db, normalized, role):
        raise OtpError("Account not found", "account_not_found")

    _create_and_send_otp(db, normalized, OtpPurposeEnum.REGISTRATION, role)


def send_password_reset_otp(db: Session, email: str, role: AuthUserRoleEnum) -> None:
    normalized = _normalize_email(email)
    if not _email_exists_for_role(db, normalized, role):
        # Avoid account enumeration — same response whether or not the email exists.
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
    now = datetime.now(timezone.utc)

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

    expires_at = otp.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < now:
        raise OtpError("Verification code has expired", "otp_expired")

    if not verify_password(code, otp.code_hash):
        raise OtpError("Invalid or expired verification code", "otp_invalid")

    otp.used_at = now
    db.commit()


def _create_and_send_otp(
    db: Session,
    email: str,
    purpose: OtpPurposeEnum,
    role: AuthUserRoleEnum,
) -> None:
    now = datetime.now(timezone.utc)
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
        created_at=now,
    )
    db.add(otp)
    db.commit()

    try:
        send_otp_email(email, code, _purpose_label(purpose))
    except EmailDeliveryError as exc:
        db.execute(
            delete(EmailOtp).where(EmailOtp.otp_id == otp.otp_id)
        )
        db.commit()
        raise OtpError(str(exc), "email_delivery_failed") from exc

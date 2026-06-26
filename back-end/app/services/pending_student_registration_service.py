from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.pending_student_registrations import PendingStudentRegistration
from app.models.students import Student
from app.schemas.auth import StudentRegister
from app.services.auth_service import AuthError, _is_unique_violation


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _expires_at() -> datetime:
    return _now() + timedelta(hours=settings.PENDING_REGISTRATION_EXPIRE_HOURS)


def _ensure_not_expired(pending: PendingStudentRegistration) -> None:
    expires_at = pending.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < _now():
        raise AuthError("Registration session expired", "registration_expired")


def _email_taken(db: Session, email: str, exclude_pending_id: int | None = None) -> bool:
    normalized = _normalize_email(email)
    if db.scalar(select(Student.student_id).where(Student.email == normalized)) is not None:
        return True
    stmt = select(PendingStudentRegistration.pending_id).where(
        PendingStudentRegistration.email == normalized
    )
    if exclude_pending_id is not None:
        stmt = stmt.where(PendingStudentRegistration.pending_id != exclude_pending_id)
    return db.scalar(stmt) is not None


def create_pending(db: Session, data: StudentRegister) -> PendingStudentRegistration:
    normalized = _normalize_email(str(data.email))
    if _email_taken(db, normalized):
        raise AuthError("Email already registered", "email_taken")

    now = _now()
    pending = PendingStudentRegistration(
        email=normalized,
        password_hash=get_password_hash(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        date_birth=data.date_birth,
        phone_number=data.phone_number,
        grade_level=data.grade_level,
        expires_at=_expires_at(),
        created_at=now,
    )
    db.add(pending)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        if _is_unique_violation(e):
            raise AuthError("Email already registered", "email_taken") from None
        raise
    db.refresh(pending)
    return pending


def cancel_pending(db: Session, pending: PendingStudentRegistration) -> None:
    db.delete(pending)
    db.commit()


def promote_pending_to_student(db: Session, pending: PendingStudentRegistration) -> Student:
    _ensure_not_expired(pending)

    now = _now()
    student = Student(
        first_name=pending.first_name,
        last_name=pending.last_name,
        email=pending.email,
        password=pending.password_hash,
        date_birth=pending.date_birth,
        phone_number=pending.phone_number,
        registered_at=now,
        grade_level=pending.grade_level,
    )
    db.add(student)
    try:
        db.flush()
    except IntegrityError as e:
        db.rollback()
        if _is_unique_violation(e):
            raise AuthError("Email already registered", "email_taken") from None
        raise

    db.delete(pending)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        if _is_unique_violation(e):
            raise AuthError("Email already registered", "email_taken") from None
        raise
    db.refresh(student)
    return student


def get_pending_or_404(db: Session, pending_id: int) -> PendingStudentRegistration:
    pending = db.get(PendingStudentRegistration, pending_id)
    if not pending:
        raise AuthError("Registration session not found", "registration_not_found")
    _ensure_not_expired(pending)
    return pending

from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.levels import Level
from app.models.pending_tutor_registrations import PendingTutorRegistration
from app.models.subjects import Subject
from app.models.tutor_subjects import TutorSubject
from app.models.tutors import Tutor
from app.schemas.auth import (
    TutorRegisterStep1,
    TutorRegisterStep2,
    TutorRegisterStep3,
    TutorRegisterStep4,
)
from app.schemas.enums import TuitionTypeEnum
from app.services.auth_service import AuthError, _is_unique_violation


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _expires_at() -> datetime:
    return _now() + timedelta(hours=settings.PENDING_REGISTRATION_EXPIRE_HOURS)


def _ensure_not_expired(pending: PendingTutorRegistration) -> None:
    expires_at = pending.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < _now():
        raise AuthError("Registration session expired", "registration_expired")


def _email_taken(db: Session, email: str, exclude_pending_id: int | None = None) -> bool:
    normalized = _normalize_email(email)
    if db.scalar(select(Tutor.tutor_id).where(Tutor.email == normalized)) is not None:
        return True
    stmt = select(PendingTutorRegistration.pending_id).where(
        PendingTutorRegistration.email == normalized
    )
    if exclude_pending_id is not None:
        stmt = stmt.where(PendingTutorRegistration.pending_id != exclude_pending_id)
    return db.scalar(stmt) is not None


def create_pending_step1(db: Session, data: TutorRegisterStep1) -> PendingTutorRegistration:
    normalized = _normalize_email(str(data.email))
    if _email_taken(db, normalized):
        raise AuthError("Email already registered", "email_taken")

    now = _now()
    pending = PendingTutorRegistration(
        email=normalized,
        password_hash=get_password_hash(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        date_birth=data.date_birth,
        phone_number=data.phone_number,
        gender=data.gender,
        current_step=1,
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


def apply_pending_step2(
    db: Session, pending: PendingTutorRegistration, data: TutorRegisterStep2
) -> None:
    _ensure_not_expired(pending)
    for sel in data.subjects:
        if db.get(Subject, sel.subject_id) is None:
            raise AuthError("Unknown subject_id", "invalid_subject")
        if db.get(Level, sel.level_id) is None:
            raise AuthError("Unknown level_id", "invalid_level")
    pending.step2_data = data.model_dump(mode="json")
    pending.current_step = max(pending.current_step, 2)
    pending.expires_at = _expires_at()
    db.commit()
    db.refresh(pending)


def apply_pending_step3(
    db: Session, pending: PendingTutorRegistration, data: TutorRegisterStep3
) -> None:
    _ensure_not_expired(pending)
    if pending.step2_data is None:
        raise AuthError("Complete step 2 before step 3", "invalid_step")
    pending.step3_data = data.model_dump(mode="json")
    pending.current_step = max(pending.current_step, 3)
    pending.expires_at = _expires_at()
    db.commit()
    db.refresh(pending)


def apply_pending_step4(
    db: Session, pending: PendingTutorRegistration, data: TutorRegisterStep4
) -> None:
    _ensure_not_expired(pending)
    if pending.step3_data is None:
        raise AuthError("Complete step 3 before step 4", "invalid_step")
    pending.step4_data = data.model_dump(mode="json")
    pending.current_step = max(pending.current_step, 4)
    pending.expires_at = _expires_at()
    db.commit()
    db.refresh(pending)


def cancel_pending(db: Session, pending: PendingTutorRegistration) -> None:
    db.delete(pending)
    db.commit()


def promote_pending_to_tutor(db: Session, pending: PendingTutorRegistration) -> Tutor:
    _ensure_not_expired(pending)
    if pending.step2_data is None or pending.step3_data is None or pending.step4_data is None:
        raise AuthError("Registration incomplete", "registration_incomplete")

    step3 = TutorRegisterStep3.model_validate(pending.step3_data)
    step2 = TutorRegisterStep2.model_validate(pending.step2_data)
    step4 = TutorRegisterStep4.model_validate(pending.step4_data)

    now = _now()
    tutor = Tutor(
        first_name=pending.first_name,
        last_name=pending.last_name,
        email=pending.email,
        password=pending.password_hash,
        date_birth=pending.date_birth,
        phone_number=pending.phone_number,
        gender=pending.gender,
        tution_type=step3.tution_type,
        bio=step4.bio,
        tutor_photo=step4.tutor_photo_url,
        tutor_video=step4.tutor_video_url,
        total_experience_years=step3.total_experience_years,
        registered_at=now,
        email_verified=True,
        verified=False,
    )
    db.add(tutor)
    try:
        db.flush()
    except IntegrityError as e:
        db.rollback()
        if _is_unique_violation(e):
            raise AuthError("Email already registered", "email_taken") from None
        raise

    for sel in step2.subjects:
        db.add(
            TutorSubject(
                tutor_id=tutor.tutor_id,
                subject_id=sel.subject_id,
                level_id=sel.level_id,
                foundation=sel.foundation,
                elementory_stage=sel.primary_stage,
                middle_stage=sel.elementary_stage,
                high_stage=sel.high_school_stage,
                experience_years=sel.experience_years or 0,
                price_per_hour=sel.price_per_hour,
            )
        )

    db.delete(pending)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        if _is_unique_violation(e):
            raise AuthError("Email already registered", "email_taken") from None
        raise
    db.refresh(tutor)
    return tutor


def get_pending_or_404(db: Session, pending_id: int) -> PendingTutorRegistration:
    pending = db.get(PendingTutorRegistration, pending_id)
    if not pending:
        raise AuthError("Registration session not found", "registration_not_found")
    _ensure_not_expired(pending)
    return pending

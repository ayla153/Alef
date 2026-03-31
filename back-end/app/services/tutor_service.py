from datetime import datetime

from fastapi import HTTPException, status
from passlib.context import CryptContext
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models.tutors import Tutor
from app.models.tutor_subjects import TutorSubject
from app.api.routers.Tutors.Tutor_create import CreateTutor

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_tutor_by_email(db: Session, email: str) -> Tutor | None:
    return db.query(Tutor).filter(Tutor.email == email).first()


def get_tutor_by_id(db: Session, tutor_id: int) -> Tutor | None:
    return (
        db.query(Tutor)
        .options(
            joinedload(Tutor.reviews),
            joinedload(Tutor.address),
            joinedload(Tutor.tutor_subjects).joinedload(TutorSubject.subject),
        )
        .filter(Tutor.tutor_id == tutor_id)
        .first()
    )


def _tutor_to_out(tutor: Tutor):
    from app.api.routers.Tutors.Tutor_out import TutorOut

    tutor_subjects = tutor.tutor_subjects or []
    if isinstance(tutor_subjects, TutorSubject):
        tutor_subjects = [tutor_subjects]

    date_birth = tutor.date_birth
    if isinstance(date_birth, datetime):
        date_birth = date_birth.date()

    subjects = sorted(
        {
            ts.subject.subject_title
            for ts in tutor_subjects
            if ts.subject and ts.subject.subject_title
        }
    )
    reviews = tutor.reviews or []
    reviews_count = len(reviews)
    reviews_avg = (
        round(sum(review.number_of_stars for review in reviews) / reviews_count, 2)
        if reviews_count > 0
        else 0.0
    )

    payload = {
        "tutor_id": tutor.tutor_id,
        "first_name": tutor.first_name,
        "last_name": tutor.last_name,
        "email": tutor.email,
        "date_birth": date_birth,
        "phone_number": tutor.phone_number,
        "tutor_photo": tutor.tutor_photo,
        "tutor_video": tutor.tutor_video,
        "bio": tutor.bio,
        "total_experience_years": tutor.total_experience_years,
        "registered_at": tutor.registered_at,
        "tuition_type": tutor.tution_type,
        "verified": tutor.verified,
        "reviews": reviews,
        "reviews_avg": reviews_avg,
        "reviews_count": reviews_count,
        "Address": tutor.address,
        "subjects": subjects,
    }
    return TutorOut.model_validate(payload)


def get_tutor_by_id_out(db: Session, tutor_id: int):
    tutor = get_tutor_by_id(db, tutor_id)
    if not tutor:
        return None
    return _tutor_to_out(tutor)

def create_tutor(db: Session, tutor_data: CreateTutor):
    # 1) email uniqueness check in service layer (business logic)
    existing = get_tutor_by_email(db, tutor_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Tutor with email '{tutor_data.email}' already exists",
        )

    # 2) hash password before saving to DB
    hashed_password = hash_password(tutor_data.password)

    # 3) set registered_at explicitly (or use db default if configured)
    tutor_obj = Tutor(
        first_name=tutor_data.first_name.strip(),
        last_name=tutor_data.last_name.strip(),
        email=tutor_data.email.lower(),
        password=hashed_password,
        date_birth=tutor_data.date_birth,
        phone_number=tutor_data.phone_number,
        bio=tutor_data.bio,
        total_experience_years=tutor_data.total_experience_years,
        registered_at=datetime.utcnow(),
        tution_type=tutor_data.tution_type,
        verified=False,
    )

    db.add(tutor_obj)
    db.commit()
    db.refresh(tutor_obj)
    return _tutor_to_out(tutor_obj)


def get_all_tutors(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    subject_ids: list[int] | None = None,
    stages: list[str] | None = None,
):
    valid_stages = {"foundation", "elementory_stage", "middle_stage", "high_stage"}
    normalized_stages = [stage.strip().lower() for stage in (stages or []) if stage.strip()]
    invalid_stages = [stage for stage in normalized_stages if stage not in valid_stages]
    if invalid_stages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid stages: {', '.join(invalid_stages)}",
        )

    query = (
        db.query(Tutor)
        .options(
            selectinload(Tutor.reviews),
            selectinload(Tutor.address),
            selectinload(Tutor.tutor_subjects).selectinload(TutorSubject.subject),
        )
    )

    if subject_ids:
        query = query.join(Tutor.tutor_subjects).filter(TutorSubject.subject_id.in_(subject_ids))

    if normalized_stages:
        stage_filters = []
        if "foundation" in normalized_stages:
            stage_filters.append(TutorSubject.foundation.is_(True))
        if "elementory_stage" in normalized_stages:
            stage_filters.append(TutorSubject.elementory_stage.is_(True))
        if "middle_stage" in normalized_stages:
            stage_filters.append(TutorSubject.middle_stage.is_(True))
        if "high_stage" in normalized_stages:
            stage_filters.append(TutorSubject.high_stage.is_(True))

        query = query.join(Tutor.tutor_subjects).filter(or_(*stage_filters))

    offset = (page - 1) * page_size
    tutors = (
        query.distinct(Tutor.tutor_id)
        .order_by(Tutor.tutor_id.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )
    return [_tutor_to_out(tutor) for tutor in tutors]

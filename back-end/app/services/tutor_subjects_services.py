from typing import List

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.tutor_subjects import TutorSubject
from app.models.tutors import Tutor
from app.models.subjects import Subject
from app.models.levels import Level
from app.api.routers.Tutor_Subjects.Tutor_Subjects_out import TutorSubjectsOut
from app.schemas.tutor_subjects import CreateTutorSubject, UpdateTutorSubjectRequest


def get_tutor_subject_by_id(db: Session, tutor_subject_id: int) -> TutorSubject | None:
    return db.get(TutorSubject, tutor_subject_id)


def get_tutor_subjects_by_tutor(db: Session, tutor_id: int) -> List[TutorSubject]:
    return db.scalars(
        select(TutorSubject).where(TutorSubject.tutor_id == tutor_id)
    ).all()


def _tutor_subject_to_out(tutor_subject: TutorSubject) -> TutorSubjectsOut:
    return TutorSubjectsOut.model_validate(tutor_subject)


def get_my_tutor_subjects_out(db: Session, tutor_id: int) -> List[TutorSubjectsOut]:
    tutor_subjects = get_tutor_subjects_by_tutor(db, tutor_id)
    return [_tutor_subject_to_out(ts) for ts in tutor_subjects]


def get_tutor_subject_by_id_out(db: Session, tutor_subject_id: int) -> TutorSubjectsOut | None:
    tutor_subject = get_tutor_subject_by_id(db, tutor_subject_id)
    if not tutor_subject:
        return None
    return _tutor_subject_to_out(tutor_subject)


def create_tutor_subject(
    db: Session, tutor: Tutor, data: CreateTutorSubject
) -> TutorSubjectsOut:
    # Check if subject exists
    subject = db.get(Subject, data.subject_id)
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found",
        )

    # Check if level exists
    level = db.get(Level, data.level_id)
    if not level:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Level not found",
        )

    # Check if tutor already teaches this subject at this level
    existing = db.scalar(
        select(TutorSubject).where(
            TutorSubject.tutor_id == tutor.tutor_id,
            TutorSubject.subject_id == data.subject_id,
            TutorSubject.level_id == data.level_id,
        )
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already added this subject at this level",
        )

    tutor_subject = TutorSubject(
        tutor_id=tutor.tutor_id,
        subject_id=data.subject_id,
        level_id=data.level_id,
        foundation=data.foundation,
        elementory_stage=data.elementory_stage,
        middle_stage=data.middle_stage,
        high_stage=data.high_stage,
        experience_years=data.experience_years,
        price_per_hour=data.price_per_hour,
    )

    db.add(tutor_subject)
    try:
        db.commit()
        db.refresh(tutor_subject)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Failed to add subject",
        )

    return _tutor_subject_to_out(tutor_subject)


def update_tutor_subject(
    db: Session,
    tutor_subject_id: int,
    tutor: Tutor,
    data: UpdateTutorSubjectRequest,
) -> TutorSubjectsOut:
    tutor_subject = get_tutor_subject_by_id(db, tutor_subject_id)
    if not tutor_subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor subject not found")

    # Check ownership
    if tutor_subject.tutor_id != tutor.tutor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own subjects",
        )

    if data.subject_id is not None:
        subject = db.get(Subject, data.subject_id)
        if not subject:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
        tutor_subject.subject_id = data.subject_id

    if data.level_id is not None:
        level = db.get(Level, data.level_id)
        if not level:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Level not found")
        tutor_subject.level_id = data.level_id

    if data.foundation is not None:
        tutor_subject.foundation = data.foundation
    if data.elementory_stage is not None:
        tutor_subject.elementory_stage = data.elementory_stage
    if data.middle_stage is not None:
        tutor_subject.middle_stage = data.middle_stage
    if data.high_stage is not None:
        tutor_subject.high_stage = data.high_stage
    if data.experience_years is not None:
        tutor_subject.experience_years = data.experience_years
    if data.price_per_hour is not None:
        tutor_subject.price_per_hour = data.price_per_hour

    try:
        db.commit()
        db.refresh(tutor_subject)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already added this subject at this level",
        )

    return _tutor_subject_to_out(tutor_subject)


def delete_tutor_subject(db: Session, tutor_subject_id: int, tutor: Tutor) -> None:
    tutor_subject = get_tutor_subject_by_id(db, tutor_subject_id)
    if not tutor_subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor subject not found")

    # Check ownership
    if tutor_subject.tutor_id != tutor.tutor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own subjects",
        )

    db.delete(tutor_subject)
    db.commit()
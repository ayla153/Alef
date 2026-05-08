from typing import List

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.subjects import Subject
from app.schemas.subjects import SubjectOut, CreateSubject, UpdateSubjectRequest


def get_subject_by_id(db: Session, subject_id: int) -> Subject | None:
    return db.get(Subject, subject_id)


def get_subject_by_title(db: Session, title: str) -> Subject | None:
    return db.scalar(select(Subject).where(Subject.subject_title == title))


def _subject_to_out(subject: Subject) -> SubjectOut:
    return SubjectOut.model_validate(subject)


def get_all_subjects_out(db: Session) -> List[SubjectOut]:
    subjects = db.scalars(select(Subject)).all()
    return [_subject_to_out(subject) for subject in subjects]


def get_subject_by_id_out(db: Session, subject_id: int) -> SubjectOut | None:
    subject = get_subject_by_id(db, subject_id)
    if not subject:
        return None
    return _subject_to_out(subject)


def create_subject(db: Session, subject_data: CreateSubject) -> SubjectOut:
    existing = get_subject_by_title(db, subject_data.subject_title)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Subject with title '{subject_data.subject_title}' already exists",
        )

    subject = Subject(
        subject_title=subject_data.subject_title.strip(),
        subject_description=subject_data.subject_description,
    )

    db.add(subject)
    try:
        db.commit()
        db.refresh(subject)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Subject with this title already exists",
        )

    return _subject_to_out(subject)


def update_subject(db: Session, subject_id: int, subject_data: UpdateSubjectRequest) -> SubjectOut:
    subject = get_subject_by_id(db, subject_id)
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")

    if subject_data.subject_title is not None and subject_data.subject_title != subject.subject_title:
        existing = get_subject_by_title(db, subject_data.subject_title)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Subject with title '{subject_data.subject_title}' already exists",
            )

    if subject_data.subject_title is not None:
        subject.subject_title = subject_data.subject_title.strip()
    if subject_data.subject_description is not None:
        subject.subject_description = subject_data.subject_description

    db.commit()
    db.refresh(subject)
    return _subject_to_out(subject)


def delete_subject(db: Session, subject_id: int) -> None:
    subject = get_subject_by_id(db, subject_id)
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    db.delete(subject)
    db.commit()
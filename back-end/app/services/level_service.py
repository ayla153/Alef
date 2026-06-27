from typing import List

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.levels import Level
from app.models.post_requirements import PostRequirement
from app.models.tutor_subjects import TutorSubject
from app.schemas.levels import LevelOut, CreateLevel, UpdateLevelRequest


def get_level_by_id(db: Session, level_id: int) -> Level | None:
    return db.get(Level, level_id)


def get_level_by_title(db: Session, title: str) -> Level | None:
    return db.scalar(select(Level).where(Level.level_title == title))


def _level_to_out(level: Level) -> LevelOut:
    return LevelOut.model_validate(level)


def get_all_levels_out(db: Session) -> List[LevelOut]:
    levels = db.scalars(select(Level)).all()
    return [_level_to_out(level) for level in levels]


def get_level_by_id_out(db: Session, level_id: int) -> LevelOut | None:
    level = get_level_by_id(db, level_id)
    if not level:
        return None
    return _level_to_out(level)


def create_level(db: Session, level_data: CreateLevel) -> LevelOut:
    existing = get_level_by_title(db, level_data.level_title)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Level with title '{level_data.level_title}' already exists",
        )

    level = Level(
        level_title=level_data.level_title.strip(),
    )

    db.add(level)
    try:
        db.commit()
        db.refresh(level)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Level with this title already exists",
        )

    return _level_to_out(level)


def update_level(db: Session, level_id: int, level_data: UpdateLevelRequest) -> LevelOut:
    level = get_level_by_id(db, level_id)
    if not level:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Level not found")

    if level_data.level_title is not None and level_data.level_title != level.level_title:
        existing = get_level_by_title(db, level_data.level_title)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Level with title '{level_data.level_title}' already exists",
            )

    if level_data.level_title is not None:
        level.level_title = level_data.level_title.strip()

    db.commit()
    db.refresh(level)
    return _level_to_out(level)


def delete_level(db: Session, level_id: int) -> None:
    level = get_level_by_id(db, level_id)
    if not level:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Level not found")

    lead_count = db.scalar(
        select(func.count())
        .select_from(PostRequirement)
        .where(PostRequirement.level_id == level_id)
    )
    if lead_count:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="لا يمكن حذف المرحلة: مرتبطة بطلبات (leads).",
        )

    tutor_subject_count = db.scalar(
        select(func.count())
        .select_from(TutorSubject)
        .where(TutorSubject.level_id == level_id)
    )
    if tutor_subject_count:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="لا يمكن حذف المرحلة: معلّمون مرتبطون بها.",
        )

    db.delete(level)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="لا يمكن حذف المرحلة: ما زالت مستخدمة في النظام.",
        ) from exc
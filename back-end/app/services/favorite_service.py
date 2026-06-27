from typing import List
from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.favorites import Favorite
from app.models.students import Student
from app.models.tutors import Tutor
from app.schemas.favorites import CreateFavorite, UpdateFavoriteRequest, FavoriteOut
from app.services.tutor_service import assert_tutor_marketplace_visible


def get_favorite_by_id(db: Session, favorite_id: int) -> Favorite | None:
    return db.get(Favorite, favorite_id)


def get_favorites_by_student(db: Session, student_id: int) -> List[Favorite]:
    return db.scalars(select(Favorite).where(Favorite.student_id == student_id)).all()


def get_favorites_by_tutor(db: Session, tutor_id: int) -> List[Favorite]:
    return db.scalars(select(Favorite).where(Favorite.tutor_id == tutor_id)).all()


def _favorite_to_out(favorite: Favorite) -> FavoriteOut:
    return FavoriteOut.model_validate(favorite)


def get_all_favorites_out(db: Session) -> List[FavoriteOut]:
    favorites = db.scalars(select(Favorite)).all()
    return [_favorite_to_out(favorite) for favorite in favorites]


def get_favorite_by_id_out(db: Session, favorite_id: int) -> FavoriteOut | None:
    favorite = get_favorite_by_id(db, favorite_id)
    if not favorite:
        return None
    return _favorite_to_out(favorite)


def get_favorites_by_student_out(db: Session, student_id: int) -> List[FavoriteOut]:
    favorites = get_favorites_by_student(db, student_id)
    return [_favorite_to_out(favorite) for favorite in favorites]


def get_favorites_by_tutor_out(db: Session, tutor_id: int) -> List[FavoriteOut]:
    favorites = get_favorites_by_tutor(db, tutor_id)
    return [_favorite_to_out(favorite) for favorite in favorites]


def create_favorite(db: Session, student: Student, favorite_data: CreateFavorite) -> FavoriteOut:
    # Check if tutor exists
    tutor = db.get(Tutor, favorite_data.tutor_id)
    if not tutor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tutor not found",
        )
    assert_tutor_marketplace_visible(tutor)

    # Check if student already favorited this tutor
    existing_favorite = db.scalar(
        select(Favorite).where(
            Favorite.student_id == student.student_id,
            Favorite.tutor_id == favorite_data.tutor_id
        )
    )
    if existing_favorite:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already favorited this tutor",
        )

    favorite = Favorite(
        student_id=student.student_id,
        tutor_id=favorite_data.tutor_id,
        created_at=datetime.utcnow(),
    )

    db.add(favorite)
    try:
        db.commit()
        db.refresh(favorite)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Failed to create favorite",
        )

    return _favorite_to_out(favorite)


def update_favorite(db: Session, favorite_id: int, student: Student, favorite_data: UpdateFavoriteRequest) -> FavoriteOut:
    favorite = get_favorite_by_id(db, favorite_id)
    if not favorite:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Favorite not found")

    # Check if the favorite belongs to the current student
    if favorite.student_id != student.student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own favorites",
        )

    if favorite_data.tutor_id is not None:
        # Check if tutor exists
        tutor = db.get(Tutor, favorite_data.tutor_id)
        if not tutor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tutor not found",
            )
        favorite.tutor_id = favorite_data.tutor_id

    db.commit()
    db.refresh(favorite)
    return _favorite_to_out(favorite)


def delete_favorite(db: Session, favorite_id: int, student: Student) -> None:
    favorite = get_favorite_by_id(db, favorite_id)
    if not favorite:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Favorite not found")

    # Check if the favorite belongs to the current student
    if favorite.student_id != student.student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own favorites",
        )

    db.delete(favorite)
    db.commit()
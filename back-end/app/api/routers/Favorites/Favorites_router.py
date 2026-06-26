from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_student
from app.database import get_db
from app.models.students import Student
from app.schemas.favorites import CreateFavorite, UpdateFavoriteRequest, FavoriteOut
from app.services import favorite_service

router = APIRouter(
    prefix="/favorites",
    tags=["Favorites"],
)

@router.get("/", response_model=list[FavoriteOut])
def list_favorites(
    db: Session = Depends(get_db),
):
    return favorite_service.get_all_favorites_out(db)


@router.post("/", response_model=FavoriteOut, status_code=status.HTTP_201_CREATED)
def create_favorite_endpoint(
    favorite: CreateFavorite,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    return favorite_service.create_favorite(db, current_student, favorite)


@router.get("/my-favorites", response_model=list[FavoriteOut])
def get_my_favorites(
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    return favorite_service.get_favorites_by_student_out(db, current_student.student_id)


@router.get("/tutor/{tutor_id}", response_model=list[FavoriteOut])
def get_favorites_by_tutor(
    tutor_id: int,
    db: Session = Depends(get_db),
):
    return favorite_service.get_favorites_by_tutor_out(db, tutor_id)


@router.get("/{favorite_id}", response_model=FavoriteOut)
def get_favorite_by_id(
    favorite_id: int,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    favorite = favorite_service.get_favorite_by_id_out(db, favorite_id)
    if not favorite:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Favorite not found")
    # Check if the favorite belongs to the current student
    if favorite.student_id != current_student.student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own favorites",
        )
    return favorite


@router.patch("/{favorite_id}", response_model=FavoriteOut)
def update_favorite(
    favorite_id: int,
    favorite: UpdateFavoriteRequest,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    return favorite_service.update_favorite(db, favorite_id, current_student, favorite)


@router.delete("/{favorite_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_favorite(
    favorite_id: int,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    favorite_service.delete_favorite(db, favorite_id, current_student)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.database import get_db
from app.models.admins import Admin
from app.schemas.levels import LevelOut, CreateLevel, UpdateLevelRequest
from app.services import level_service

router = APIRouter(
    prefix="/levels",
    tags=["Levels"],
)

@router.get("/", response_model=list[LevelOut])
def list_levels(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return level_service.get_all_levels_out(db)


@router.post("/", response_model=LevelOut, status_code=status.HTTP_201_CREATED)
def create_level_endpoint(
    level: CreateLevel,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    return level_service.create_level(db, level)


@router.get("/{level_id}", response_model=LevelOut)
def get_level_by_id(
    level_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    level = level_service.get_level_by_id_out(db, level_id)
    if not level:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Level not found")
    return level


@router.patch("/{level_id}", response_model=LevelOut)
def update_level(
    level_id: int,
    level: UpdateLevelRequest,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    return level_service.update_level(db, level_id, level)


@router.delete("/{level_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_level(
    level_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    level_service.delete_level(db, level_id)
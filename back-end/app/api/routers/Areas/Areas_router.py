from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.database import get_db
from app.models.admins import Admin
from app.schemas.areas import AreaOut, CreateArea, UpdateArea
from app.services import area_service

router = APIRouter(
    prefix="/areas",
    tags=["Areas"],
)


@router.get("/", response_model=list[AreaOut])
def list_areas(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return area_service.get_all_areas_out(db)


@router.post("/", response_model=AreaOut, status_code=status.HTTP_201_CREATED)
def create_area_endpoint(
    area: CreateArea,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    return area_service.create_area(db, area)


@router.get("/{area_id}", response_model=AreaOut)
def get_area_by_id(
    area_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    area = area_service.get_area_by_id_out(db, area_id)
    if not area:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Area not found")
    return area


@router.patch("/{area_id}", response_model=AreaOut)
def update_area_endpoint(
    area_id: int,
    area: UpdateArea,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    return area_service.update_area(db, area_id, area)


@router.delete("/{area_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_area_endpoint(
    area_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    area_service.delete_area(db, area_id)

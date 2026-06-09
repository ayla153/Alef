from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.database import get_db
from app.models.admins import Admin
from app.schemas.cities import CityOut, CreateCity, UpdateCity
from app.services import city_service

router = APIRouter(
    prefix="/cities",
    tags=["Cities"],
)


@router.get("/", response_model=list[CityOut])
def list_cities(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return city_service.get_all_cities_out(db)


@router.post("/", response_model=CityOut, status_code=status.HTTP_201_CREATED)
def create_city_endpoint(
    city: CreateCity,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    return city_service.create_city(db, city)


@router.get("/{city_id}", response_model=CityOut)
def get_city_by_id(
    city_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    city = city_service.get_city_by_id_out(db, city_id)
    if not city:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="City not found")
    return city


@router.patch("/{city_id}", response_model=CityOut)
def update_city_endpoint(
    city_id: int,
    city: UpdateCity,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    return city_service.update_city(db, city_id, city)


@router.delete("/{city_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_city_endpoint(
    city_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    city_service.delete_city(db, city_id)

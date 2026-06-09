from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.areas import Area
from app.models.cities import City
from app.schemas.areas import CreateArea, AreaOut, UpdateArea


def get_area_by_id(db: Session, area_id: int) -> Area | None:
    return db.get(Area, area_id)


def get_area_by_title_and_city(db: Session, title: str, city_id: int) -> Area | None:
    return db.scalar(
        select(Area).where(Area.title == title.strip(), Area.city_id == city_id)
    )


def _area_to_out(area: Area) -> AreaOut:
    return AreaOut.model_validate(area)


def get_all_areas_out(db: Session) -> list[AreaOut]:
    areas = db.scalars(select(Area).order_by(Area.area_id.asc())).all()
    return [_area_to_out(area) for area in areas]


def get_area_by_id_out(db: Session, area_id: int) -> AreaOut | None:
    area = get_area_by_id(db, area_id)
    if not area:
        return None
    return _area_to_out(area)


def create_area(db: Session, area_data: CreateArea) -> AreaOut:
    # Validate title format
    import re
    if not re.match(r'^[\u0600-\u06FFA-Za-z\s]+$', area_data.title):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Area title must contain only Arabic or English characters",
        )

    # Check if city exists
    city = db.get(City, area_data.city_id)
    if not city:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="City not found",
        )

    # Check if area with same title already exists in this city
    existing = get_area_by_title_and_city(db, area_data.title, area_data.city_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Area with title '{area_data.title}' already exists in this city",
        )

    area = Area(
        title=area_data.title.strip(),
        city_id=area_data.city_id,
    )

    db.add(area)
    try:
        db.commit()
        db.refresh(area)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Area with this title already exists in this city",
        )

    return _area_to_out(area)


def update_area(db: Session, area_id: int, area_data: UpdateArea) -> AreaOut:
    area = get_area_by_id(db, area_id)
    if not area:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Area not found")

    if area_data.title is not None:
        # Validate title format
        import re
        if not re.match(r'^[\u0600-\u06FFA-Za-z\s]+$', area_data.title):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Area title must contain only Arabic or English characters",
            )

        # Check if area with same title exists in this city
        if area_data.title.strip() != area.title:
            existing = get_area_by_title_and_city(db, area_data.title, area.city_id)
            if existing and existing.area_id != area.area_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Area with title '{area_data.title}' already exists in this city",
                )
        area.title = area_data.title.strip()

    db.commit()
    db.refresh(area)
    return _area_to_out(area)


def delete_area(db: Session, area_id: int) -> None:
    area = get_area_by_id(db, area_id)
    if not area:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Area not found")
    db.delete(area)
    db.commit()

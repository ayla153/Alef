from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.cities import City
from app.schemas.cities import CreateCity, CityOut, UpdateCity


def get_city_by_id(db: Session, city_id: int) -> City | None:
    return db.get(City, city_id)


def get_city_by_title(db: Session, title: str) -> City | None:
    return db.scalar(select(City).where(City.title == title.strip()))


def _city_to_out(city: City) -> CityOut:
    return CityOut.model_validate(city)


def get_all_cities_out(db: Session) -> list[CityOut]:
    cities = db.scalars(select(City).order_by(City.city_id.asc())).all()
    return [_city_to_out(city) for city in cities]


def get_city_by_id_out(db: Session, city_id: int) -> CityOut | None:
    city = get_city_by_id(db, city_id)
    if not city:
        return None
    return _city_to_out(city)


def create_city(db: Session, city_data: CreateCity) -> CityOut:
    # Validate title format
    import re
    if not re.match(r'^[\u0600-\u06FFA-Za-z\s]+$', city_data.title):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="City title must contain only Arabic or English characters",
        )

    existing = get_city_by_title(db, city_data.title)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"City with title '{city_data.title}' already exists",
        )

    city = City(
        title=city_data.title.strip(),
    )

    db.add(city)
    try:
        db.commit()
        db.refresh(city)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="City with this title already exists",
        )

    return _city_to_out(city)


def update_city(db: Session, city_id: int, city_data: UpdateCity) -> CityOut:
    city = get_city_by_id(db, city_id)
    if not city:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="City not found")

    if city_data.title is not None:
        # Validate title format
        import re
        if not re.match(r'^[\u0600-\u06FFA-Za-z\s]+$', city_data.title):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="City title must contain only Arabic or English characters",
            )

        if city_data.title.strip() != city.title:
            existing = get_city_by_title(db, city_data.title)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"City with title '{city_data.title}' already exists",
                )
            city.title = city_data.title.strip()

    db.commit()
    db.refresh(city)
    return _city_to_out(city)


def delete_city(db: Session, city_id: int) -> None:
    city = get_city_by_id(db, city_id)
    if not city:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="City not found")
    db.delete(city)
    db.commit()

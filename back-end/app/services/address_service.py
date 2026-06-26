from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.addresses import Address
from app.models.areas import Area
from app.models.cities import City
from app.models.students import Student
from app.models.tutors import Tutor
from app.schemas.addresses import CreateAddress, AddressOut, UpdateAddress, UpdateAddressAdmin


def get_address_by_id(db: Session, address_id: int) -> Address | None:
    return db.get(Address, address_id)


def _address_to_out(address: Address) -> AddressOut:
    return AddressOut(
        address_id=address.address_id,
        student_id=address.student_id,
        tutor_id=address.tutor_id,
        city_id=address.city_id,
        area_id=address.area_id,
        city_title=address.city.title,
        area_title=address.area.title,
    )


def get_all_addresses_out(db: Session) -> list[AddressOut]:
    addresses = db.scalars(
        select(Address)
        .join(Address.city)
        .join(Address.area)
        .order_by(Address.address_id.asc())
    ).all()
    return [_address_to_out(address) for address in addresses]


def get_address_by_id_out(db: Session, address_id: int) -> AddressOut | None:
    address = db.scalar(
        select(Address)
        .join(Address.city)
        .join(Address.area)
        .where(Address.address_id == address_id)
    )
    if not address:
        return None
    return _address_to_out(address)


def get_address_by_student_id(db: Session, student_id: int) -> Address | None:
    return db.scalar(select(Address).where(Address.student_id == student_id))


def get_address_by_student_id_out(db: Session, student_id: int) -> AddressOut | None:
    address = db.scalar(
        select(Address)
        .join(Address.city)
        .join(Address.area)
        .where(Address.student_id == student_id)
    )
    if not address:
        return None
    return _address_to_out(address)


def get_address_by_tutor_id(db: Session, tutor_id: int) -> Address | None:
    return db.scalar(select(Address).where(Address.tutor_id == tutor_id))


def get_address_by_tutor_id_out(db: Session, tutor_id: int) -> AddressOut | None:
    address = db.scalar(
        select(Address)
        .join(Address.city)
        .join(Address.area)
        .where(Address.tutor_id == tutor_id)
    )
    if not address:
        return None
    return _address_to_out(address)


def create_address(db: Session, address_data: CreateAddress) -> AddressOut:
    # Validate that city exists
    city = db.get(City, address_data.city_id)
    if not city:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="City not found",
        )

    # Validate that area exists and belongs to the city
    area = db.get(Area, address_data.area_id)
    if not area:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Area not found",
        )
    if area.city_id != address_data.city_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Area does not belong to the specified city",
        )

    # Validate student_id and tutor_id - exactly one must be provided
    if address_data.student_id is None and address_data.tutor_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either student_id or tutor_id must be provided",
        )
    if address_data.student_id is not None and address_data.tutor_id is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot have both student_id and tutor_id",
        )

    # Validate that student or tutor exists
    if address_data.student_id is not None:
        student = db.get(Student, address_data.student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found",
            )
        # Check if student already has an address
        existing_address = get_address_by_student_id(db, address_data.student_id)
        if existing_address:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Student already has an address",
            )

    if address_data.tutor_id is not None:
        tutor = db.get(Tutor, address_data.tutor_id)
        if not tutor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tutor not found",
            )
        # Check if tutor already has an address
        existing_address = get_address_by_tutor_id(db, address_data.tutor_id)
        if existing_address:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Tutor already has an address",
            )

    address = Address(
        student_id=address_data.student_id,
        tutor_id=address_data.tutor_id,
        city_id=address_data.city_id,
        area_id=address_data.area_id,
    )

    db.add(address)
    try:
        db.commit()
        # Refresh with joined relationships to get city and area titles
        db.refresh(address, ['city', 'area'])
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to create address - constraint violation",
        )

    return _address_to_out(address)


def update_address(db: Session, address_id: int, address_data: UpdateAddress, tutor_id: int | None = None, student_id: int | None = None) -> AddressOut:
    """
    Update address with optional filtering by tutor_id or student_id for permission checks.
    If tutor_id is provided, only allow update if address belongs to that tutor.
    If student_id is provided, only allow update if address belongs to that student.
    """
    address = get_address_by_id(db, address_id)
    if not address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")

    # Permission check
    if tutor_id is not None and address.tutor_id != tutor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own address",
        )
    if student_id is not None and address.student_id != student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own address",
        )

    if address_data.city_id is not None:
        # Validate that city exists
        city = db.get(City, address_data.city_id)
        if not city:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="City not found",
            )
        address.city_id = address_data.city_id

    if address_data.area_id is not None:
        # Validate that area exists and belongs to the city
        area = db.get(Area, address_data.area_id)
        if not area:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Area not found",
            )
        if area.city_id != address.city_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Area does not belong to the specified city",
            )
        address.area_id = address_data.area_id

    db.commit()
    db.refresh(address, ['city', 'area'])
    return _address_to_out(address)


def update_address_admin(db: Session, address_id: int, address_data: UpdateAddressAdmin) -> AddressOut:
    """
    Admin-only update that can change student_id and tutor_id.
    """
    address = get_address_by_id(db, address_id)
    if not address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")

    # Validate student_id and tutor_id logic
    if address_data.student_id is not None and address_data.tutor_id is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot have both student_id and tutor_id",
        )

    # If both are provided as None, keep existing values
    new_student_id = address_data.student_id if address_data.student_id is not None else address.student_id
    new_tutor_id = address_data.tutor_id if address_data.tutor_id is not None else address.tutor_id

    # Validate that at least one is not None
    if new_student_id is None and new_tutor_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either student_id or tutor_id must be set",
        )

    # Validate new student_id if provided
    if address_data.student_id is not None:
        student = db.get(Student, address_data.student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found",
            )
        # Check if student already has an address (but not this one)
        existing_address = get_address_by_student_id(db, address_data.student_id)
        if existing_address and existing_address.address_id != address_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Student already has an address",
            )

    # Validate new tutor_id if provided
    if address_data.tutor_id is not None:
        tutor = db.get(Tutor, address_data.tutor_id)
        if not tutor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tutor not found",
            )
        # Check if tutor already has an address (but not this one)
        existing_address = get_address_by_tutor_id(db, address_data.tutor_id)
        if existing_address and existing_address.address_id != address_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Tutor already has an address",
            )

    if address_data.city_id is not None:
        # Validate that city exists
        city = db.get(City, address_data.city_id)
        if not city:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="City not found",
            )
        address.city_id = address_data.city_id

    if address_data.area_id is not None:
        # Validate that area exists and belongs to the city
        area = db.get(Area, address_data.area_id)
        if not area:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Area not found",
            )
        if area.city_id != address.city_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Area does not belong to the specified city",
            )
        address.area_id = address_data.area_id

    # Update student_id and tutor_id
    if address_data.student_id is not None:
        address.student_id = address_data.student_id
        address.tutor_id = None
    if address_data.tutor_id is not None:
        address.tutor_id = address_data.tutor_id
        address.student_id = None

    db.commit()
    db.refresh(address, ['city', 'area'])
    return _address_to_out(address)


def delete_address(db: Session, address_id: int, tutor_id: int | None = None, student_id: int | None = None) -> None:
    """
    Delete address with optional filtering by tutor_id or student_id for permission checks.
    """
    address = get_address_by_id(db, address_id)
    if not address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")

    # Permission check
    if tutor_id is not None and address.tutor_id != tutor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own address",
        )
    if student_id is not None and address.student_id != student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own address",
        )

    db.delete(address)
    db.commit()

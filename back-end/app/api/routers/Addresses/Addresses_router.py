from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_current_tutor, get_current_student
from app.database import get_db
from app.models.admins import Admin
from app.models.tutors import Tutor
from app.models.students import Student
from app.schemas.addresses import AddressOut, CreateAddress, UpdateAddress, UpdateAddressAdmin
from app.services import address_service

router = APIRouter(
    prefix="/addresses",
    tags=["Addresses"],
)


@router.get("/", response_model=list[AddressOut])
def list_addresses(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Admin only - get all addresses"""
    return address_service.get_all_addresses_out(db)


@router.post("/", response_model=AddressOut, status_code=status.HTTP_201_CREATED)
def create_address_endpoint(
    address: CreateAddress,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    """Admin only - create address"""
    return address_service.create_address(db, address)


@router.get("/{address_id}", response_model=AddressOut)
def get_address_by_id(
    address_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    """Admin only - get address by id"""
    address = address_service.get_address_by_id_out(db, address_id)
    if not address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
    return address


@router.patch("/{address_id}", response_model=AddressOut)
def update_address_endpoint(
    address_id: int,
    address: UpdateAddressAdmin,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    """Admin only - update address"""
    return address_service.update_address_admin(db, address_id, address)


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address_endpoint(
    address_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    """Admin only - delete address"""
    address_service.delete_address(db, address_id)


# Tutor specific endpoints
@router.get("/tutor/me", response_model=AddressOut)
def get_tutor_address(
    current_tutor: Tutor = Depends(get_current_tutor),
    db: Session = Depends(get_db),
):
    """Get tutor's own address"""
    address = address_service.get_address_by_tutor_id_out(db, current_tutor.tutor_id)
    if not address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
    return address


@router.post("/tutor/", response_model=AddressOut, status_code=status.HTTP_201_CREATED)
def create_tutor_address(
    address_data: UpdateAddress,
    db: Session = Depends(get_db),
    current_tutor: Tutor = Depends(get_current_tutor),
):
    """
    Create address for current tutor.
    Tutor ID is automatically set from the token.
    """
    # Create address with tutor_id from token
    create_address_data = CreateAddress(
        tutor_id=current_tutor.tutor_id,
        student_id=None,
        city_id=address_data.city_id,
        area_id=address_data.area_id,
    )
    return address_service.create_address(db, create_address_data)


@router.patch("/tutor/me", response_model=AddressOut)
def update_tutor_address(
    address_data: UpdateAddress,
    db: Session = Depends(get_db),
    current_tutor: Tutor = Depends(get_current_tutor),
):
    """Update tutor's own address. Cannot edit tutor_id."""
    address = address_service.get_address_by_tutor_id(db, current_tutor.tutor_id)
    if not address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
    return address_service.update_address(
        db, address.address_id, address_data, tutor_id=current_tutor.tutor_id
    )


@router.delete("/tutor/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_tutor_address(
    db: Session = Depends(get_db),
    current_tutor: Tutor = Depends(get_current_tutor),
):
    """Delete tutor's own address"""
    address = address_service.get_address_by_tutor_id(db, current_tutor.tutor_id)
    if not address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
    address_service.delete_address(db, address.address_id, tutor_id=current_tutor.tutor_id)


# Student specific endpoints
@router.get("/student/me", response_model=AddressOut)
def get_student_address(
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """Get student's own address"""
    address = address_service.get_address_by_student_id_out(db, current_student.student_id)
    if not address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
    return address


@router.post("/student/", response_model=AddressOut, status_code=status.HTTP_201_CREATED)
def create_student_address(
    address_data: UpdateAddress,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    """
    Create address for current student.
    Student ID is automatically set from the token.
    """
    # Create address with student_id from token
    create_address_data = CreateAddress(
        student_id=current_student.student_id,
        tutor_id=None,
        city_id=address_data.city_id,
        area_id=address_data.area_id,
    )
    return address_service.create_address(db, create_address_data)


@router.patch("/student/me", response_model=AddressOut)
def update_student_address(
    address_data: UpdateAddress,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    """Update student's own address. Cannot edit student_id."""
    address = address_service.get_address_by_student_id(db, current_student.student_id)
    if not address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
    return address_service.update_address(
        db, address.address_id, address_data, student_id=current_student.student_id
    )


@router.delete("/student/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_student_address(
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    """Delete student's own address"""
    address = address_service.get_address_by_student_id(db, current_student.student_id)
    if not address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
    address_service.delete_address(db, address.address_id, student_id=current_student.student_id)

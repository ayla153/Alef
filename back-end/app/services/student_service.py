from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.students import Student
from app.schemas.addresses import AddressOut
from app.schemas.students import CreateStudent, StudentOut, UpdateStudentRequest
from app.services.tutor_service import hash_password


def get_student_by_id(db: Session, student_id: int) -> Student | None:
    return db.get(Student, student_id)


def get_student_by_email(db: Session, email: str) -> Student | None:
    return db.scalar(select(Student).where(Student.email == email.lower()))


def _address_to_out(address) -> AddressOut | None:
    if not address:
        return None

    return AddressOut(
        address_id=address.address_id,
        student_id=address.student_id,
        tutor_id=address.tutor_id,
        city_id=address.city_id,
        area_id=address.area_id,
        city_title=address.city.title if getattr(address, 'city', None) else None,
        area_title=address.area.title if getattr(address, 'area', None) else None,
    )


def _student_to_out(student: Student) -> StudentOut:
    data = {key: value for key, value in student.__dict__.items() if not key.startswith('_')}
    if getattr(student, 'address', None) is not None:
        data['address'] = _address_to_out(student.address)
    return StudentOut.model_validate(data)


def get_all_students_out(db: Session) -> list[StudentOut]:
    students = db.scalars(select(Student).order_by(Student.student_id.asc())).all()
    return [_student_to_out(student) for student in students]


def get_student_by_id_out(db: Session, student_id: int) -> StudentOut | None:
    student = get_student_by_id(db, student_id)
    if not student:
        return None
    return _student_to_out(student)


def create_student(db: Session, student_data: CreateStudent) -> StudentOut:
    existing = get_student_by_email(db, student_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Student with email '{student_data.email}' already exists",
        )

    student = Student(
        first_name=student_data.first_name.strip(),
        last_name=student_data.last_name.strip(),
        email=student_data.email.lower(),
        password=hash_password(student_data.password),
        date_birth=student_data.date_birth,
        phone_number=student_data.phone_number.strip(),
        registered_at=datetime.now(timezone.utc),
        grade_level=student_data.grade_level,
    )

    db.add(student)
    try:
        db.commit()
        db.refresh(student)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Student with this email already exists",
        ) from None

    return _student_to_out(student)


def update_student(db: Session, student_id: int, student_data: UpdateStudentRequest) -> StudentOut:
    student = get_student_by_id(db, student_id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    if student_data.email is not None and student_data.email.lower() != student.email.lower():
        existing = get_student_by_email(db, student_data.email)
        if existing and existing.student_id != student.student_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Student with email '{student_data.email}' already exists",
            )

    if student_data.first_name is not None:
        student.first_name = student_data.first_name.strip()
    if student_data.last_name is not None:
        student.last_name = student_data.last_name.strip()
    if student_data.email is not None:
        student.email = student_data.email.lower()
    if student_data.password is not None:
        student.password = hash_password(student_data.password)
    if student_data.date_birth is not None:
        student.date_birth = student_data.date_birth
    if student_data.phone_number is not None:
        student.phone_number = student_data.phone_number.strip()
    if student_data.student_photo is not None:
        student.student_photo = student_data.student_photo
    if student_data.grade_level is not None:
        student.grade_level = student_data.grade_level

    db.commit()
    db.refresh(student)
    return _student_to_out(student)


def delete_student(db: Session, student_id: int) -> None:
    student = get_student_by_id(db, student_id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    db.delete(student)
    db.commit()

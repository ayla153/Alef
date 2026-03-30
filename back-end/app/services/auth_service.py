from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.admins import Admin
from app.models.students import Student
from app.models.tutors import Tutor
from app.schemas.auth import StudentRegister, TutorRegister


class AuthError(Exception):
    def __init__(self, message: str, code: str = "auth_error"):
        self.message = message
        self.code = code
        super().__init__(message)


def authenticate_student(db: Session, email: str, password: str) -> Student | None:
    student = db.scalar(select(Student).where(Student.email == email))
    if not student or not verify_password(password, student.password):
        return None
    return student


def authenticate_tutor(db: Session, email: str, password: str) -> Tutor | None:
    tutor = db.scalar(select(Tutor).where(Tutor.email == email))
    if not tutor or not verify_password(password, tutor.password):
        return None
    return tutor


def authenticate_admin(db: Session, email: str, password: str) -> Admin | None:
    admin = db.scalar(select(Admin).where(Admin.email == email))
    if not admin or not verify_password(password, admin.password):
        return None
    return admin

#TODO add all info that is required for student registration

def register_student(db: Session, data: StudentRegister) -> Student:
    hashed = get_password_hash(data.password)
    student = Student(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        password=hashed,
        date_birth=data.date_birth,
        phone_number=data.phone_number,
    )
    db.add(student)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise AuthError("Email already registered", "email_taken") from None
    db.refresh(student)
    return student


#TODO add all info that is required for tutor registration

def register_tutor(db: Session, data: TutorRegister) -> Tutor:
    hashed = get_password_hash(data.password)
    now = datetime.now(timezone.utc)
    tutor = Tutor(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        password=hashed,
        date_birth=data.date_birth,
        phone_number=data.phone_number,
        tution_type=data.tution_type,
        bio=data.bio,
        experience_years=data.experience_years,
        registered_at=now,
    )
    db.add(tutor)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise AuthError("Email already registered", "email_taken") from None
    db.refresh(tutor)
    return tutor


def token_for_student(student: Student) -> str:
    return create_access_token(str(student.student_id), "student")


def token_for_tutor(tutor: Tutor) -> str:
    return create_access_token(str(tutor.tutor_id), "tutor")


def token_for_admin(admin: Admin) -> str:
    return create_access_token(str(admin.admin_id), "admin")

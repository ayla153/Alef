from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.admins import Admin
from app.models.levels import Level
from app.models.students import Student
from app.models.subjects import Subject
from app.models.tutor_subjects import TutorSubject
from app.models.tutors import Tutor
from app.schemas.auth import (
    StudentRegister,
    TutorRegister,
    TutorRegisterStep1,
    TutorRegisterStep2,
    TutorRegisterStep3,
    TutorRegisterStep4,
)
from app.schemas.enums import TuitionTypeEnum


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


def is_tutor_email_available(db: Session, email: str) -> bool:
    return db.scalar(select(Tutor.tutor_id).where(Tutor.email == email)) is None


def authenticate_admin(db: Session, email: str, password: str) -> Admin | None:
    admin = db.scalar(select(Admin).where(Admin.email == email))
    if not admin or not verify_password(password, admin.password):
        return None
    return admin


# TODO add all info that is required for student registration

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


TUTOR_REGISTRATION_ROLE = "tutor_registration"


def registration_token_for_tutor(tutor_id: int) -> str:
    return create_access_token(
        str(tutor_id),
        TUTOR_REGISTRATION_ROLE,
        expires_delta=timedelta(minutes=settings.REGISTRATION_TOKEN_EXPIRE_MINUTES),
    )


def register_tutor_step1(db: Session, data: TutorRegisterStep1) -> Tutor:
    """Creates tutor account; tution_type is provisional until step 3."""
    hashed = get_password_hash(data.password)
    now = datetime.now(timezone.utc)
    tutor = Tutor(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        password=hashed,
        date_birth=data.date_birth,
        phone_number=data.phone_number,
        tution_type=TuitionTypeEnum.BOTH,
        bio=None,
        experience_years=None,
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


def apply_tutor_registration_step2(db: Session, tutor: Tutor, data: TutorRegisterStep2) -> None:
    for sel in data.subjects:
        if db.get(Subject, sel.subject_id) is None:
            raise AuthError("Unknown subject_id", "invalid_subject")
        if db.get(Level, sel.level_id) is None:
            raise AuthError("Unknown level_id", "invalid_level")
    db.execute(delete(TutorSubject).where(TutorSubject.tutor_id == tutor.tutor_id))
    for sel in data.subjects:
        db.add(
            TutorSubject(
                tutor_id=tutor.tutor_id,
                subject_id=sel.subject_id,
                level_id=sel.level_id,
                foundation=sel.foundation,
            )
        )
    db.commit()


def apply_tutor_registration_step3(db: Session, tutor: Tutor, data: TutorRegisterStep3) -> None:
    tutor.tution_type = data.tution_type
    tutor.experience_years = data.experience_years
    db.commit()
    db.refresh(tutor)


def apply_tutor_registration_step4(db: Session, tutor: Tutor, data: TutorRegisterStep4) -> None:
    tutor.bio = data.bio
    db.commit()
    db.refresh(tutor)

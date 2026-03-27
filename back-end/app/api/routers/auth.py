from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict

from app.api.deps import DbSession
from app.models.admins import Admin
from app.models.students import Student
from app.models.tutors import Tutor
from app.schemas.auth import LoginRequest, StudentRegister, Token, TutorRegister
from app.services import auth_service
from app.services.auth_service import AuthError

router = APIRouter(prefix="/auth", tags=["auth"])


class StudentMe(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: int
    email: str
    first_name: str
    last_name: str


class TutorMe(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    tutor_id: int
    email: str
    first_name: str
    last_name: str
    verified: bool


class AdminMe(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    admin_id: int
    email: str
    first_name: str
    last_name: str


@router.post("/student/login", response_model=Token)
def login_student(db: DbSession, body: LoginRequest) -> Token:
    student = auth_service.authenticate_student(db, body.email, body.password)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return Token(access_token=auth_service.token_for_student(student))


@router.post("/tutor/login", response_model=Token)
def login_tutor(db: DbSession, body: LoginRequest) -> Token:
    tutor = auth_service.authenticate_tutor(db, body.email, body.password)
    if not tutor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return Token(access_token=auth_service.token_for_tutor(tutor))


@router.post("/admin/login", response_model=Token)
def login_admin(db: DbSession, body: LoginRequest) -> Token:
    admin = auth_service.authenticate_admin(db, body.email, body.password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return Token(access_token=auth_service.token_for_admin(admin))
#TODO add all info that is required for student registration

@router.post("/student/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_student_endpoint(db: DbSession, body: StudentRegister) -> Token:
    try:
        student = auth_service.register_student(db, body)
    except AuthError as e:
        if e.code == "email_taken":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=e.message) from e
        raise
    return Token(access_token=auth_service.token_for_student(student))

#TODO add all info that is required for tutor registration
@router.post("/tutor/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_tutor_endpoint(db: DbSession, body: TutorRegister) -> Token:
    try:
        tutor = auth_service.register_tutor(db, body)
    except AuthError as e:
        if e.code == "email_taken":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=e.message) from e
        raise
    return Token(access_token=auth_service.token_for_tutor(tutor))




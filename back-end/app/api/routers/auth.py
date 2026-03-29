from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, EmailStr

from app.api.deps import DbSession, get_current_tutor_registration
from app.models.tutors import Tutor
from app.schemas.auth import (
    LoginRequest,
    StudentRegister,
    Token,
    TutorRegister,
    TutorRegisterStep1,
    TutorRegisterStep2,
    TutorRegisterStep3,
    TutorRegisterStep4,
    TutorRegistrationProgress,
)
from app.services import auth_service
from app.services.auth_service import AuthError


def _http_for_auth_error(e: AuthError) -> HTTPException:
    code = status.HTTP_400_BAD_REQUEST
    if e.code == "email_taken":
        code = status.HTTP_409_CONFLICT
    return HTTPException(status_code=code, detail=e.message)

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
        raise _http_for_auth_error(e) from e
    return Token(access_token=auth_service.token_for_student(student))

#TODO add all info that is required for tutor registration
@router.post("/tutor/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_tutor_endpoint(db: DbSession, body: TutorRegister) -> Token:
    try:
        tutor = auth_service.register_tutor(db, body)
    except AuthError as e:
        raise _http_for_auth_error(e) from e
    return Token(access_token=auth_service.token_for_tutor(tutor))


@router.post(
    "/tutor/register/step-1",
    response_model=TutorRegistrationProgress,
    status_code=status.HTTP_201_CREATED,
)
def tutor_register_step_1(db: DbSession, body: TutorRegisterStep1) -> TutorRegistrationProgress:
    try:
        tutor = auth_service.register_tutor_step1(db, body)
    except AuthError as e:
        raise _http_for_auth_error(e) from e
    return TutorRegistrationProgress(
        registration_token=auth_service.registration_token_for_tutor(tutor.tutor_id),
    )


@router.post("/tutor/register/step-2", response_model=TutorRegistrationProgress)
def tutor_register_step_2(
    db: DbSession,
    tutor: Annotated[Tutor, Depends(get_current_tutor_registration)],
    body: TutorRegisterStep2,
) -> TutorRegistrationProgress:
    try:
        auth_service.apply_tutor_registration_step2(db, tutor, body)
    except AuthError as e:
        raise _http_for_auth_error(e) from e
    return TutorRegistrationProgress(
        registration_token=auth_service.registration_token_for_tutor(tutor.tutor_id),
    )


@router.post("/tutor/register/step-3", response_model=TutorRegistrationProgress)
def tutor_register_step_3(
    db: DbSession,
    tutor: Annotated[Tutor, Depends(get_current_tutor_registration)],
    body: TutorRegisterStep3,
) -> TutorRegistrationProgress:
    try:
        auth_service.apply_tutor_registration_step3(db, tutor, body)
    except AuthError as e:
        raise _http_for_auth_error(e) from e
    return TutorRegistrationProgress(
        registration_token=auth_service.registration_token_for_tutor(tutor.tutor_id),
    )


@router.post("/tutor/register/step-4", response_model=Token)
def tutor_register_step_4(
    db: DbSession,
    tutor: Annotated[Tutor, Depends(get_current_tutor_registration)],
    body: TutorRegisterStep4,
) -> Token:
    try:
        auth_service.apply_tutor_registration_step4(db, tutor, body)
    except AuthError as e:
        raise _http_for_auth_error(e) from e
    return Token(access_token=auth_service.token_for_tutor(tutor))




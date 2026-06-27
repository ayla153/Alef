from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict

from app.api.deps import (
    DbSession,
    get_current_student_registration,
    get_current_tutor_registration,
    require_tutor_registration_step,
)
from app.api.routers.auth_student_me import router as auth_student_me_router
from app.api.routers.auth_otp import router as auth_otp_router
from app.models.pending_student_registrations import PendingStudentRegistration
from app.models.pending_tutor_registrations import PendingTutorRegistration
from app.schemas.auth import (
    LoginRequest,
    RefreshTokenRequest,
    StudentRegister,
    StudentRegistrationProgress,
    Token,
    TutorRegisterStep1,
    TutorRegisterStep2,
    TutorRegisterStep3,
    TutorRegistrationProgress,
)
from app.schemas.otp import OtpEmailResponse, OtpMessageResponse
from app.services import auth_service
from app.services.auth_service import AuthError
from app.services import pending_student_registration_service as pending_student_service
from app.services import pending_tutor_registration_service as pending_service


def _http_for_auth_error(e: AuthError) -> HTTPException:
    code = status.HTTP_400_BAD_REQUEST
    if e.code == "email_taken":
        code = status.HTTP_409_CONFLICT
    elif e.code == "registration_expired":
        code = status.HTTP_410_GONE
    elif e.code == "invalid_step":
        code = status.HTTP_400_BAD_REQUEST
    return HTTPException(status_code=code, detail=e.message)


router = APIRouter(prefix="/auth", tags=["auth"])
router.include_router(auth_student_me_router)
router.include_router(auth_otp_router)


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
            detail="البريد الإلكتروني أو كلمة السر غير صحيحة",
        )
    return auth_service.tokens_for_student(student)


@router.post("/tutor/login", response_model=Token)
def login_tutor(db: DbSession, body: LoginRequest) -> Token:
    tutor = auth_service.authenticate_tutor(db, body.email, body.password)
    if not tutor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="البريد الإلكتروني أو كلمة السر غير صحيحة",
        )
    if not tutor.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required. Complete registration with OTP.",
        )
    if tutor.is_banned:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="تم حظر حسابك. تواصل مع الإدارة.",
        )
    return auth_service.tokens_for_tutor(tutor)


@router.post("/admin/login", response_model=Token)
def login_admin(db: DbSession, body: LoginRequest) -> Token:
    admin = auth_service.authenticate_admin(db, body.email, body.password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="البريد الإلكتروني أو كلمة السر غير صحيحة",
        )
    return auth_service.tokens_for_admin(admin)


@router.post("/refresh", response_model=Token)
def refresh_tokens(body: RefreshTokenRequest, db: DbSession) -> Token:
    try:
        return auth_service.refresh_auth_tokens(db, body.refresh_token)
    except AuthError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=e.message,
        ) from e


@router.post(
    "/student/register",
    response_model=StudentRegistrationProgress,
    status_code=status.HTTP_201_CREATED,
)
def student_register(db: DbSession, body: StudentRegister) -> StudentRegistrationProgress:
    try:
        pending = pending_student_service.create_pending(db, body)
    except AuthError as e:
        raise _http_for_auth_error(e) from e
    return StudentRegistrationProgress(
        registration_token=auth_service.registration_token_for_student(pending.pending_id, step=2),
    )


@router.post("/student/register/cancel", response_model=OtpMessageResponse)
def student_register_cancel(
    db: DbSession,
    pending: Annotated[PendingStudentRegistration, Depends(get_current_student_registration)],
) -> OtpMessageResponse:
    pending_student_service.cancel_pending(db, pending)
    return OtpMessageResponse(message="Registration cancelled.")


@router.post(
    "/tutor/register/step-1",
    response_model=TutorRegistrationProgress,
    status_code=status.HTTP_201_CREATED,
)
def tutor_register_step_1(db: DbSession, body: TutorRegisterStep1) -> TutorRegistrationProgress:
    try:
        pending = pending_service.create_pending_step1(db, body)
    except AuthError as e:
        raise _http_for_auth_error(e) from e
    return TutorRegistrationProgress(
        registration_token=auth_service.registration_token_for_tutor(pending.pending_id, step=2),
    )


@router.post("/tutor/register/step-2", response_model=TutorRegistrationProgress)
def tutor_register_step_2(
    db: DbSession,
    pending: Annotated[PendingTutorRegistration, Depends(require_tutor_registration_step(2))],
    body: TutorRegisterStep2,
) -> TutorRegistrationProgress:
    try:
        pending_service.apply_pending_step2(db, pending, body)
    except AuthError as e:
        raise _http_for_auth_error(e) from e
    return TutorRegistrationProgress(
        registration_token=auth_service.registration_token_for_tutor(pending.pending_id, step=3),
    )


@router.post("/tutor/register/step-3", response_model=TutorRegistrationProgress)
def tutor_register_step_3(
    db: DbSession,
    pending: Annotated[PendingTutorRegistration, Depends(require_tutor_registration_step(3))],
    body: TutorRegisterStep3,
) -> TutorRegistrationProgress:
    try:
        pending_service.apply_pending_step3(db, pending, body)
    except AuthError as e:
        raise _http_for_auth_error(e) from e
    return TutorRegistrationProgress(
        registration_token=auth_service.registration_token_for_tutor(pending.pending_id, step=4),
    )


@router.post("/tutor/register/cancel", response_model=OtpMessageResponse)
def tutor_register_cancel(
    db: DbSession,
    pending: Annotated[PendingTutorRegistration, Depends(get_current_tutor_registration)],
) -> OtpMessageResponse:
    pending_service.cancel_pending(db, pending)
    return OtpMessageResponse(message="Registration cancelled.")

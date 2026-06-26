from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import DbSession, require_student_registration_step, require_tutor_registration_step
from app.models.pending_student_registrations import PendingStudentRegistration
from app.models.pending_tutor_registrations import PendingTutorRegistration
from app.schemas.auth import Token, TutorRegisterStep4
from app.schemas.enums import AuthUserRoleEnum, OtpPurposeEnum
from jose import JWTError

from app.schemas.otp import (
    OtpEmailResponse,
    OtpMessageResponse,
    OtpSendRequest,
    OtpVerifyOnly,
    PasswordResetComplete,
    PasswordResetConfirm,
    PasswordResetVerify,
    PasswordResetVerifyResponse,
)
from app.services import auth_service
from app.services.auth_service import AuthError
from app.services import pending_student_registration_service as pending_student_service
from app.services import pending_tutor_registration_service as pending_service
from app.core.config import dev_otp_exposed
from app.core.security import create_password_reset_token, decode_password_reset_token
from app.services.otp_service import (
    OtpError,
    resolve_auth_role_for_email,
    send_password_reset_otp_for_email,
    send_pending_student_registration_otp,
    send_pending_tutor_registration_otp,
    verify_otp,
)


def _http_for_otp_error(e: OtpError) -> HTTPException:
    code = status.HTTP_400_BAD_REQUEST
    if e.code == "email_taken":
        code = status.HTTP_409_CONFLICT
    elif e.code == "account_not_found":
        code = status.HTTP_404_NOT_FOUND
    elif e.code == "email_delivery_failed":
        code = status.HTTP_503_SERVICE_UNAVAILABLE
    elif e.code in ("otp_rate_limited", "otp_locked"):
        code = status.HTTP_429_TOO_MANY_REQUESTS
    return HTTPException(status_code=code, detail=e.message)


def _http_for_auth_error(e: AuthError) -> HTTPException:
    code = status.HTTP_400_BAD_REQUEST
    if e.code == "email_taken":
        code = status.HTTP_409_CONFLICT
    elif e.code == "account_not_found":
        code = status.HTTP_404_NOT_FOUND
    elif e.code == "registration_expired":
        code = status.HTTP_410_GONE
    elif e.code == "registration_incomplete":
        code = status.HTTP_400_BAD_REQUEST
    return HTTPException(status_code=code, detail=e.message)


router = APIRouter(tags=["auth-otp"])

_OTP_SENT_MESSAGE = "If this email is eligible, a verification code has been sent."


def _password_reset_request_response(db: DbSession, email: str) -> OtpMessageResponse:
    try:
        otp_code = send_password_reset_otp_for_email(db, email)
    except OtpError as e:
        raise _http_for_otp_error(e) from e
    return OtpMessageResponse(
        message=_OTP_SENT_MESSAGE,
        dev_otp=otp_code if dev_otp_exposed() and otp_code else None,
    )


def _password_reset_verify(
    db: DbSession, body: PasswordResetVerify
) -> PasswordResetVerifyResponse:
    email = str(body.email)
    try:
        role = resolve_auth_role_for_email(db, email)
        if role is None:
            raise AuthError("Account not found", "account_not_found")
        verify_otp(
            db,
            email,
            body.otp,
            OtpPurposeEnum.PASSWORD_RESET,
            role,
        )
        token = create_password_reset_token(email)
    except OtpError as e:
        raise _http_for_otp_error(e) from e
    except AuthError as e:
        raise _http_for_auth_error(e) from e
    return PasswordResetVerifyResponse(
        message="Verification code accepted",
        password_reset_token=token,
    )


def _password_reset_complete(db: DbSession, body: PasswordResetComplete) -> OtpMessageResponse:
    try:
        email = decode_password_reset_token(body.password_reset_token)
        auth_service.reset_password_for_email(db, email, body.new_password)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired password reset session. Please verify the code again.",
        ) from e
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired password reset session. Please verify the code again.",
        ) from e
    except AuthError as e:
        raise _http_for_auth_error(e) from e
    return OtpMessageResponse(message="Password updated successfully")


def _password_reset_confirm(db: DbSession, body: PasswordResetConfirm) -> OtpMessageResponse:
    email = str(body.email)
    try:
        role = resolve_auth_role_for_email(db, email)
        if role is None:
            raise AuthError("Account not found", "account_not_found")
        verify_otp(
            db,
            email,
            body.otp,
            OtpPurposeEnum.PASSWORD_RESET,
            role,
        )
        auth_service.reset_password_for_email(db, email, body.new_password)
    except OtpError as e:
        raise _http_for_otp_error(e) from e
    except AuthError as e:
        raise _http_for_auth_error(e) from e
    return OtpMessageResponse(message="Password updated successfully")


@router.post("/password-reset/request", response_model=OtpMessageResponse)
def password_reset_request(db: DbSession, body: OtpSendRequest) -> OtpMessageResponse:
    return _password_reset_request_response(db, str(body.email))


@router.post("/password-reset/verify", response_model=PasswordResetVerifyResponse)
def password_reset_verify(db: DbSession, body: PasswordResetVerify) -> PasswordResetVerifyResponse:
    return _password_reset_verify(db, body)


@router.post("/password-reset/confirm", response_model=OtpMessageResponse)
def password_reset_confirm(db: DbSession, body: PasswordResetComplete) -> OtpMessageResponse:
    return _password_reset_complete(db, body)


@router.post("/student/register/send-otp", response_model=OtpEmailResponse)
def student_register_send_otp(
    db: DbSession,
    pending: Annotated[PendingStudentRegistration, Depends(require_student_registration_step(2))],
) -> OtpEmailResponse:
    try:
        send_pending_student_registration_otp(db, pending)
    except OtpError as e:
        raise _http_for_otp_error(e) from e
    return OtpEmailResponse(
        email=pending.email,
        message="Verification code sent to email",
    )


@router.post("/student/register/confirm", response_model=Token, status_code=status.HTTP_201_CREATED)
def student_register_confirm(
    db: DbSession,
    pending: Annotated[PendingStudentRegistration, Depends(require_student_registration_step(2))],
    body: OtpVerifyOnly,
) -> Token:
    try:
        verify_otp(
            db,
            pending.email,
            body.otp,
            OtpPurposeEnum.REGISTRATION,
            AuthUserRoleEnum.STUDENT,
        )
        student = pending_student_service.promote_pending_to_student(db, pending)
    except OtpError as e:
        raise _http_for_otp_error(e) from e
    except AuthError as e:
        raise _http_for_auth_error(e) from e
    return auth_service.tokens_for_student(student)


@router.post("/student/password-reset/request", response_model=OtpMessageResponse)
def student_password_reset_request(db: DbSession, body: OtpSendRequest) -> OtpMessageResponse:
    return _password_reset_request_response(db, str(body.email))


@router.post("/student/password-reset/confirm", response_model=OtpMessageResponse)
def student_password_reset_confirm(db: DbSession, body: PasswordResetConfirm) -> OtpMessageResponse:
    return _password_reset_confirm(db, body)


@router.post("/tutor/password-reset/request", response_model=OtpMessageResponse)
def tutor_password_reset_request(db: DbSession, body: OtpSendRequest) -> OtpMessageResponse:
    return _password_reset_request_response(db, str(body.email))


@router.post("/tutor/register/step-4/save", response_model=OtpEmailResponse)
def tutor_register_step_4_save(
    db: DbSession,
    pending: Annotated[PendingTutorRegistration, Depends(require_tutor_registration_step(4))],
    body: TutorRegisterStep4,
) -> OtpEmailResponse:
    try:
        pending_service.apply_pending_step4(db, pending, body)
    except AuthError as e:
        raise _http_for_auth_error(e) from e
    return OtpEmailResponse(
        email=pending.email,
        message="Profile saved. Verify your email to complete registration.",
    )


@router.post("/tutor/register/step-4/send-otp", response_model=OtpEmailResponse)
def tutor_register_step_4_send_otp(
    db: DbSession,
    pending: Annotated[PendingTutorRegistration, Depends(require_tutor_registration_step(4))],
) -> OtpEmailResponse:
    try:
        send_pending_tutor_registration_otp(db, pending)
    except OtpError as e:
        raise _http_for_otp_error(e) from e
    return OtpEmailResponse(
        email=pending.email,
        message="Verification code sent to email",
    )


@router.post("/tutor/register/step-4/confirm", response_model=Token)
def tutor_register_step_4_confirm(
    db: DbSession,
    pending: Annotated[PendingTutorRegistration, Depends(require_tutor_registration_step(4))],
    body: OtpVerifyOnly,
) -> Token:
    try:
        verify_otp(
            db,
            pending.email,
            body.otp,
            OtpPurposeEnum.REGISTRATION,
            AuthUserRoleEnum.TUTOR,
        )
        tutor = pending_service.promote_pending_to_tutor(db, pending)
    except OtpError as e:
        raise _http_for_otp_error(e) from e
    except AuthError as e:
        raise _http_for_auth_error(e) from e
    return auth_service.tokens_for_tutor(tutor)


@router.post("/tutor/password-reset/confirm", response_model=OtpMessageResponse)
def tutor_password_reset_confirm(db: DbSession, body: PasswordResetConfirm) -> OtpMessageResponse:
    return _password_reset_confirm(db, body)

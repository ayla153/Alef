from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import DbSession, require_student_registration_step, require_tutor_registration_step
from app.models.pending_student_registrations import PendingStudentRegistration
from app.models.pending_tutor_registrations import PendingTutorRegistration
from app.schemas.auth import Token, TutorRegisterStep4
from app.schemas.enums import AuthUserRoleEnum, OtpPurposeEnum
from app.schemas.otp import (
    OtpEmailResponse,
    OtpMessageResponse,
    OtpSendRequest,
    OtpVerifyOnly,
    PasswordResetConfirm,
)
from app.services import auth_service
from app.services.auth_service import AuthError
from app.services import pending_student_registration_service as pending_student_service
from app.services import pending_tutor_registration_service as pending_service
from app.services.otp_service import (
    OtpError,
    send_password_reset_otp,
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
    try:
        send_password_reset_otp(db, str(body.email), AuthUserRoleEnum.STUDENT)
    except OtpError as e:
        raise _http_for_otp_error(e) from e
    return OtpMessageResponse(message=_OTP_SENT_MESSAGE)


@router.post("/student/password-reset/confirm", response_model=OtpMessageResponse)
def student_password_reset_confirm(db: DbSession, body: PasswordResetConfirm) -> OtpMessageResponse:
    try:
        verify_otp(
            db,
            str(body.email),
            body.otp,
            OtpPurposeEnum.PASSWORD_RESET,
            AuthUserRoleEnum.STUDENT,
        )
        auth_service.reset_student_password(db, str(body.email), body.new_password)
    except OtpError as e:
        raise _http_for_otp_error(e) from e
    except AuthError as e:
        raise _http_for_auth_error(e) from e
    return OtpMessageResponse(message="Password updated successfully")


@router.post("/tutor/password-reset/request", response_model=OtpMessageResponse)
def tutor_password_reset_request(db: DbSession, body: OtpSendRequest) -> OtpMessageResponse:
    try:
        send_password_reset_otp(db, str(body.email), AuthUserRoleEnum.TUTOR)
    except OtpError as e:
        raise _http_for_otp_error(e) from e
    return OtpMessageResponse(message=_OTP_SENT_MESSAGE)


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
    try:
        verify_otp(
            db,
            str(body.email),
            body.otp,
            OtpPurposeEnum.PASSWORD_RESET,
            AuthUserRoleEnum.TUTOR,
        )
        auth_service.reset_tutor_password(db, str(body.email), body.new_password)
    except OtpError as e:
        raise _http_for_otp_error(e) from e
    except AuthError as e:
        raise _http_for_auth_error(e) from e
    return OtpMessageResponse(message="Password updated successfully")

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import DbSession, require_tutor_registration_step
from app.models.tutors import Tutor
from app.schemas.auth import StudentRegister, Token, TutorRegister, TutorRegisterStep4
from app.schemas.enums import AuthUserRoleEnum, OtpPurposeEnum
from app.schemas.otp import (
    OtpMessageResponse,
    OtpSendRequest,
    PasswordResetConfirm,
    StudentRegisterVerify,
    TutorRegisterStep4Verify,
    TutorRegisterVerify,
)
from app.services import auth_service
from app.services.auth_service import AuthError
from app.services.otp_service import (
    OtpError,
    send_password_reset_otp,
    send_registration_completion_otp,
    send_registration_otp,
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
    return HTTPException(status_code=code, detail=e.message)


def _http_for_auth_error(e: AuthError) -> HTTPException:
    code = status.HTTP_400_BAD_REQUEST
    if e.code == "email_taken":
        code = status.HTTP_409_CONFLICT
    elif e.code == "account_not_found":
        code = status.HTTP_404_NOT_FOUND
    return HTTPException(status_code=code, detail=e.message)


router = APIRouter(tags=["auth-otp"])

_OTP_SENT_MESSAGE = "If this email is eligible, a verification code has been sent."


@router.post("/student/register/send-otp", response_model=OtpMessageResponse)
def student_register_send_otp(db: DbSession, body: OtpSendRequest) -> OtpMessageResponse:
    try:
        send_registration_otp(db, str(body.email), AuthUserRoleEnum.STUDENT)
    except OtpError as e:
        raise _http_for_otp_error(e) from e
    return OtpMessageResponse(message="Verification code sent to email")


@router.post("/student/register/verify", response_model=Token, status_code=status.HTTP_201_CREATED)
def student_register_verify(db: DbSession, body: StudentRegisterVerify) -> Token:
    try:
        verify_otp(
            db,
            str(body.email),
            body.otp,
            OtpPurposeEnum.REGISTRATION,
            AuthUserRoleEnum.STUDENT,
        )
        student = auth_service.register_student(
            db,
            StudentRegister(
                first_name=body.first_name,
                last_name=body.last_name,
                email=body.email,
                password=body.password,
                date_birth=body.date_birth,
                phone_number=body.phone_number,
                grade_level=body.grade_level,
            ),
        )
    except OtpError as e:
        raise _http_for_otp_error(e) from e
    except AuthError as e:
        raise _http_for_auth_error(e) from e
    return Token(access_token=auth_service.token_for_student(student))


@router.post("/tutor/register/send-otp", response_model=OtpMessageResponse)
def tutor_register_send_otp(db: DbSession, body: OtpSendRequest) -> OtpMessageResponse:
    try:
        send_registration_otp(db, str(body.email), AuthUserRoleEnum.TUTOR)
    except OtpError as e:
        raise _http_for_otp_error(e) from e
    return OtpMessageResponse(message="Verification code sent to email")


@router.post("/tutor/register/verify", response_model=Token, status_code=status.HTTP_201_CREATED)
def tutor_register_verify(db: DbSession, body: TutorRegisterVerify) -> Token:
    try:
        verify_otp(
            db,
            str(body.email),
            body.otp,
            OtpPurposeEnum.REGISTRATION,
            AuthUserRoleEnum.TUTOR,
        )
        tutor = auth_service.register_tutor(
            db,
            TutorRegister(
                first_name=body.first_name,
                last_name=body.last_name,
                email=body.email,
                password=body.password,
                date_birth=body.date_birth,
                phone_number=body.phone_number,
                tution_type=body.tution_type,
                bio=body.bio,
                experience_years=body.experience_years,
            ),
        )
    except OtpError as e:
        raise _http_for_otp_error(e) from e
    except AuthError as e:
        raise _http_for_auth_error(e) from e
    return Token(access_token=auth_service.token_for_tutor(tutor))


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


@router.post("/tutor/register/step-4/send-otp", response_model=OtpMessageResponse)
def tutor_register_step_4_send_otp(
    db: DbSession,
    tutor: Annotated[Tutor, Depends(require_tutor_registration_step(4))],
) -> OtpMessageResponse:
    try:
        send_registration_completion_otp(db, tutor.email, AuthUserRoleEnum.TUTOR)
    except OtpError as e:
        raise _http_for_otp_error(e) from e
    return OtpMessageResponse(message="Verification code sent to email")


@router.post("/tutor/register/step-4/verify", response_model=Token)
def tutor_register_step_4_verify(
    db: DbSession,
    tutor: Annotated[Tutor, Depends(require_tutor_registration_step(4))],
    body: TutorRegisterStep4Verify,
) -> Token:
    try:
        verify_otp(
            db,
            tutor.email,
            body.otp,
            OtpPurposeEnum.REGISTRATION,
            AuthUserRoleEnum.TUTOR,
        )
        auth_service.apply_tutor_registration_step4(
            db,
            tutor,
            TutorRegisterStep4(
                bio=body.bio,
                tutor_photo_url=body.tutor_photo_url,
                tutor_video_url=body.tutor_video_url,
                certificate_url=body.certificate_url,
            ),
        )
    except OtpError as e:
        raise _http_for_otp_error(e) from e
    except AuthError as e:
        raise _http_for_auth_error(e) from e
    return Token(access_token=auth_service.token_for_tutor(tutor))


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

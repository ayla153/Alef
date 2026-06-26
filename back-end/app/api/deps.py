from typing import Annotated, Tuple

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database import get_db
from app.models.admins import Admin
from app.models.pending_student_registrations import PendingStudentRegistration
from app.models.pending_tutor_registrations import PendingTutorRegistration
from app.models.students import Student
from app.models.tutors import Tutor
from app.schemas.auth import TokenPayload
from app.services.auth_service import (
    AuthError,
    STUDENT_REGISTRATION_ROLE,
    TUTOR_REGISTRATION_ROLE,
)
from app.services.pending_student_registration_service import get_pending_or_404 as get_student_pending_or_404
from app.services.pending_tutor_registration_service import get_pending_or_404

security = HTTPBearer()


def get_token_payload(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
) -> TokenPayload:
    try:
        claims = decode_access_token(credentials.credentials)
        sub = claims.get("sub")
        role = claims.get("role")
        step = claims.get("step")
        if sub is None or role is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return TokenPayload(
            sub=int(sub),
            role=str(role),
            step=int(step) if step is not None else None,
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None


DbSession = Annotated[Session, Depends(get_db)]


def get_current_student(
    db: DbSession,
    payload: Annotated[TokenPayload, Depends(get_token_payload)],
) -> Student:
    if payload.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a student account",
        )
    student = db.get(Student, payload.sub)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
        )
    return student


def get_current_tutor(
    db: DbSession,
    payload: Annotated[TokenPayload, Depends(get_token_payload)],
) -> Tutor:
    if payload.role != "tutor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a tutor account",
        )
    tutor = db.get(Tutor, payload.sub)
    if not tutor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
        )
    return tutor


def get_current_user_role_id(
    db: DbSession,
    payload: Annotated[TokenPayload, Depends(get_token_payload)],
) -> Tuple[str, int]:
    if payload.role == "student":
        user = db.get(Student, payload.sub)
    elif payload.role == "tutor":
        user = db.get(Tutor, payload.sub)
    elif payload.role == "admin":
        user = db.get(Admin, payload.sub)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid user role.",
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
        )

    return payload.role, int(payload.sub)


def get_verified_tutor(
    current_tutor: Annotated[Tutor, Depends(get_current_tutor)],
) -> Tutor:
    if not current_tutor.verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Verified tutor account required.",
        )
    return current_tutor


def get_current_tutor_registration(
    db: DbSession,
    payload: Annotated[TokenPayload, Depends(get_token_payload)],
) -> PendingTutorRegistration:
    if payload.role != TUTOR_REGISTRATION_ROLE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a valid tutor registration token",
        )
    try:
        return get_pending_or_404(db, payload.sub)
    except AuthError as exc:
        if exc.code == "registration_expired":
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail=exc.message,
            ) from exc
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=exc.message,
        ) from exc


def _require_registration_step(payload: TokenPayload, expected_step: int) -> None:
    if payload.step != expected_step:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Invalid registration step token. Expected step {expected_step}.",
        )


def require_tutor_registration_step(expected_step: int):
    def _dependency(
        db: DbSession,
        payload: Annotated[TokenPayload, Depends(get_token_payload)],
    ) -> PendingTutorRegistration:
        if payload.role != TUTOR_REGISTRATION_ROLE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not a valid tutor registration token",
            )
        _require_registration_step(payload, expected_step)
        try:
            return get_pending_or_404(db, payload.sub)
        except AuthError as exc:
            if exc.code == "registration_expired":
                raise HTTPException(
                    status_code=status.HTTP_410_GONE,
                    detail=exc.message,
                ) from exc
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=exc.message,
            ) from exc

    return _dependency


def get_current_student_registration(
    db: DbSession,
    payload: Annotated[TokenPayload, Depends(get_token_payload)],
) -> PendingStudentRegistration:
    if payload.role != STUDENT_REGISTRATION_ROLE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a valid student registration token",
        )
    try:
        return get_student_pending_or_404(db, payload.sub)
    except AuthError as exc:
        if exc.code == "registration_expired":
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail=exc.message,
            ) from exc
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=exc.message,
        ) from exc


def require_student_registration_step(expected_step: int):
    def _dependency(
        db: DbSession,
        payload: Annotated[TokenPayload, Depends(get_token_payload)],
    ) -> PendingStudentRegistration:
        if payload.role != STUDENT_REGISTRATION_ROLE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not a valid student registration token",
            )
        _require_registration_step(payload, expected_step)
        try:
            return get_student_pending_or_404(db, payload.sub)
        except AuthError as exc:
            if exc.code == "registration_expired":
                raise HTTPException(
                    status_code=status.HTTP_410_GONE,
                    detail=exc.message,
                ) from exc
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=exc.message,
            ) from exc

    return _dependency



def get_current_admin(
    db: DbSession,
    payload: Annotated[TokenPayload, Depends(get_token_payload)],
) -> Admin:
    if payload.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not an admin account",
        )
    admin = db.get(Admin, payload.sub)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
        )
    return admin

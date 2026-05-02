"""Minimal student profile routes under /auth (subset of identity fields)."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, EmailStr
from sqlalchemy import select

from app.api.deps import DbSession, get_current_student
from app.core.security import get_password_hash
from app.models.students import Student

router = APIRouter(tags=["auth"])


class StudentMe(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: int
    email: str
    first_name: str
    last_name: str


class StudentMeUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    phone_number: str | None = None
    student_photo: str | None = None


@router.get("/student/me", response_model=StudentMe)
def get_student_me(student: Annotated[Student, Depends(get_current_student)]) -> StudentMe:
    return StudentMe.model_validate(student)


@router.patch("/student/me", response_model=StudentMe)
def update_student_me(
    db: DbSession,
    body: StudentMeUpdate,
    student: Annotated[Student, Depends(get_current_student)],
) -> StudentMe:
    if body.email is not None and body.email.lower() != student.email.lower():
        existing = db.scalar(select(Student).where(Student.email == body.email.lower()))
        if existing is not None and existing.student_id != student.student_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Student with email '{body.email}' already exists",
            )
        student.email = body.email.lower()

    if body.first_name is not None:
        student.first_name = body.first_name.strip()
    if body.last_name is not None:
        student.last_name = body.last_name.strip()
    if body.password is not None:
        student.password = get_password_hash(body.password)
    if body.phone_number is not None:
        student.phone_number = body.phone_number
    if body.student_photo is not None:
        student.student_photo = body.student_photo

    db.commit()
    db.refresh(student)
    return StudentMe.model_validate(student)

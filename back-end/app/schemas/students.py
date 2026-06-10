from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.schemas.addresses import AddressOut
from app.schemas.enums import student_grade_enum


class CreateStudent(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
    )

    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    date_birth: date
    phone_number: str = Field(..., min_length=8, max_length=20)
    grade_level: student_grade_enum


class UpdateStudentRequest(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
        extra="forbid",
    )

    first_name: str | None = Field(default=None, min_length=1, max_length=50)
    last_name: str | None = Field(default=None, min_length=1, max_length=50)
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=8, max_length=100)
    date_birth: date | None = None
    phone_number: str | None = Field(default=None, min_length=8, max_length=20)
    student_photo: str | None = None
    grade_level: student_grade_enum | None = None


class StudentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: int
    first_name: str
    last_name: str
    email: str
    date_birth: date
    phone_number: str
    student_photo: str | None = None
    registered_at: datetime
    grade_level: student_grade_enum
    address: AddressOut | None = None

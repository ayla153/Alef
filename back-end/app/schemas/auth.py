from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.schemas.enums import TuitionTypeEnum


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

#TODO add all info that is required for student registration
class StudentRegister(BaseModel):
    first_name: str = Field(..., max_length=50)
    last_name: str = Field(..., max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    date_birth: datetime
    phone_number: str = Field(..., max_length=20)

    @field_validator("password")
    @classmethod
    def password_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("password cannot be empty")
        return v


#TODO add all info that is required for tutor registration
class TutorRegister(BaseModel):
    first_name: str = Field(..., max_length=50)
    last_name: str = Field(..., max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    date_birth: datetime
    phone_number: str = Field(..., max_length=20)
    tution_type: TuitionTypeEnum
    bio: str | None = Field(None, max_length=500)
    experience_years: int | None = None

    @field_validator("password")
    @classmethod
    def password_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("password cannot be empty")
        return v


class TokenPayload(BaseModel):
    sub: int
    role: str


class TutorRegistrationProgress(BaseModel):
    """Bearer token for steps 2–3 only; not accepted by normal tutor-protected routes."""

    registration_token: str
    token_type: str = "bearer"


class TutorRegisterStep1(BaseModel):
    first_name: str = Field(..., max_length=50)
    last_name: str = Field(..., max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    date_birth: datetime
    phone_number: str = Field(..., max_length=20)

    @field_validator("password")
    @classmethod
    def password_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("password cannot be empty")
        return v


class TutorSubjectSelection(BaseModel):
    subject_id: int 
    foundation: bool = False
    experience_years: int | None = Field(None, ge=0)
    stage_1: bool = False
    stage_2: bool = False
    stage_3: bool = False


class TutorRegisterStep2(BaseModel):
    subjects: list[TutorSubjectSelection] = Field(..., min_length=1)
    




class TutorRegisterStep3(BaseModel):
    tution_type: TuitionTypeEnum
    total_experience_years: int | None = Field(None, ge=0)
    price_stage_1: int | None = Field(None, ge=0)
    price_stage_2: int | None = Field(None, ge=0)
    price_stage_3: int | None = Field(None, ge=0)


class TutorRegisterStep4(BaseModel):
    bio: str | None = Field(None, max_length=500)
    tutor_photo_url: str | None = Field(None, max_length=255)
    tutor_video_url: str | None = Field(None, max_length=255)
    certificate_url: str | None = Field(None, max_length=255)


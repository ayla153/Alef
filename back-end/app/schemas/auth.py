from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

from app.schemas.enums import tution_type_enum


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
    tution_type: tution_type_enum
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
    level_id: list[int]   #should take levels not only one id fix this

    foundation: bool = False


class TutorRegisterStep2(BaseModel):
    subjects: list[TutorSubjectSelection] = Field(..., min_length=1)

    @model_validator(mode="after")
    def unique_subject_level_pairs(self) -> TutorRegisterStep2:
        pairs = {(s.subject_id, s.level_id) for s in self.subjects}
        if len(pairs) != len(self.subjects):
            raise ValueError("duplicate subject and level combination")
        return self


class TutorRegisterStep3(BaseModel):
    tution_type: tution_type_enum
    experience_years: int | None = Field(None, ge=0)


class TutorRegisterStep4(BaseModel):
    bio: str | None = Field(None, max_length=500)

from pydantic import BaseModel, EmailStr, Field, field_validator


class OtpSendRequest(BaseModel):
    email: EmailStr


class OtpMessageResponse(BaseModel):
    message: str


class OtpEmailResponse(BaseModel):
    message: str
    email: EmailStr


class OtpVerifyOnly(BaseModel):
    otp: str = Field(..., min_length=4, max_length=10)

    @field_validator("otp")
    @classmethod
    def otp_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("otp cannot be empty")
        return v.strip()


class PasswordResetConfirm(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=4, max_length=10)
    new_password: str = Field(..., min_length=8)

    @field_validator("otp")
    @classmethod
    def otp_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("otp cannot be empty")
        return v.strip()

    @field_validator("new_password")
    @classmethod
    def password_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("password cannot be empty")
        return v

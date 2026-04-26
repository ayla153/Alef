from typing import Optional
import re

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class CreateAdmin(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
    )

    first_name: str = Field(
        ...,
        min_length=1,
        max_length=50,
        pattern=r'^[A-Za-z]+$',
        description="First name - letters only, 1-50 characters",
    )
    last_name: str = Field(
        ...,
        min_length=1,
        max_length=50,
        pattern=r'^[A-Za-z]+$',
        description="Last name - letters only, 1-50 characters",
    )
    email: EmailStr = Field(
        ...,
        description="Admin email address",
    )
    password: str = Field(
        ...,
        min_length=6,
        max_length=100,
        description="Password must be between 6 and 100 characters",
    )

    @field_validator('first_name', 'last_name')
    @classmethod
    def validate_name(cls, value: str) -> str:
        if not re.match(r'^[A-Za-z]+$', value):
            raise ValueError('Name must contain only English letters')
        return value.strip()


class UpdateAdminRequest(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
        extra='forbid',
    )

    first_name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=50,
        pattern=r'^[A-Za-z]+$',
        description="First name - letters only, 1-50 characters",
    )
    last_name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=50,
        pattern=r'^[A-Za-z]+$',
        description="Last name - letters only, 1-50 characters",
    )
    email: Optional[EmailStr] = Field(
        None,
        description="Admin email address",
    )
    password: Optional[str] = Field(
        None,
        min_length=6,
        max_length=100,
        description="Password must be between 6 and 100 characters",
    )

    @field_validator('first_name', 'last_name')
    @classmethod
    def validate_name(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        if not re.match(r'^[A-Za-z]+$', value):
            raise ValueError('Name must contain only English letters')
        return value.strip()


class AdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    admin_id: int
    first_name: str
    last_name: str
    email: str

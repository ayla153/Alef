from datetime import datetime
from typing import List, Optional
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


class AdminTutorReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    review_id: int
    student_name: str
    number_of_stars: int
    comment: Optional[str] = None
    created_at: datetime


class AdminTutorReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    tutor_id: int
    tutor_name: str
    offers_submitted_count: int
    private_leads_received_count: int
    favorites_count: int
    average_rating: Optional[float] = None
    reviews_count: int
    reviews: List[AdminTutorReviewOut]
    last_seen_at: Optional[datetime] = None
    registered_at: datetime

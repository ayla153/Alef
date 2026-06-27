from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional
import re

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.schemas.enums import TuitionTypeEnum, gender_enum
from app.schemas.reviews import ReviewOut
from app.api.routers.Addresses.Address_out import AddressOut
from app.api.routers.Tutor_Subjects.Tutor_Subjects_out import TutorSubjectsOut


class CreateTutor(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
    )

    first_name: str = Field(
        ...,
        min_length=1,
        max_length=50,
        pattern=r'^[A-Za-z]+$',
        description="First name - English letters only, 1-50 characters",
    )
    last_name: str = Field(
        ...,
        min_length=1,
        max_length=50,
        pattern=r'^[A-Za-z]+$',
        description="Last name - English letters only, 1-50 characters",
    )
    email: EmailStr = Field(
        ...,
        description="Email address - must be valid",
    )
    password: str = Field(
        ...,
        min_length=6,
        max_length=100,
        description="Password - must be between 6 and 100 characters",
    )
    date_birth: date = Field(
        ...,
        description="Date of birth in YYYY-MM-DD format",
    )
    phone_number: str = Field(
        ...,
        description="Phone number - must be a valid real number",
    )
    bio: Optional[str] = Field(
        None,
        max_length=1000,
        description="Tutor biography",
    )
    total_experience_years: Optional[int] = Field(
        None,
        ge=0,
        le=70,
        description="Total years of experience - between 0 and 70",
    )
    tution_type: TuitionTypeEnum = Field(
        ...,
        description="Tuition type (e.g., online, offline, both)",
    )
    gender: gender_enum = Field(
        ...,
        description="Tutor gender (male or female)",
    )

    @field_validator('first_name', 'last_name')
    @classmethod
    def validate_name_english_only(cls, value: str) -> str:
        if not value:
            return value
        if not re.match(r'^[A-Za-z]+$', value):
            raise ValueError('Name must contain only English letters')
        return value.strip()

    @field_validator('phone_number')
    @classmethod
    def validate_phone_number(cls, value: str) -> str:
        if not value:
            return value
        cleaned = re.sub(r'[\s\-\(\)]', '', value)
        if cleaned.startswith('+'):
            phone_digits = cleaned[1:]
            if not phone_digits.isdigit():
                raise ValueError('Phone number must contain only digits after +')
            if len(phone_digits) < 8 or len(phone_digits) > 14:
                raise ValueError('Phone number must be between 8 and 15 digits (including +)')
        else:
            if not cleaned.isdigit():
                raise ValueError('Phone number must contain only digits')
            if len(cleaned) < 8 or len(cleaned) > 15:
                raise ValueError('Phone number must be between 8 and 15 digits')
        return cleaned

    @field_validator('date_birth')
    @classmethod
    def validate_date_birth(cls, value: date) -> date:
        if not value:
            return value
        today = date.today()
        age = today.year - value.year
        if (today.month, today.day) < (value.month, value.day):
            age -= 1
        if age < 12:
            raise ValueError('Tutor must be at least 12 years old')
        if age > 100:
            raise ValueError('Invalid age (more than 100 years)')
        return value

    @field_validator('total_experience_years')
    @classmethod
    def validate_total_experience_years(cls, value: Optional[int]) -> Optional[int]:
        if value is None:
            return value
        if value < 0:
            raise ValueError('Total experience years cannot be negative')
        if value > 70:
            raise ValueError('Total experience years cannot exceed 70')
        return value


class UpdateTutorRequest(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
        use_enum_values=True,
        extra='forbid',
    )

    first_name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=50,
        pattern=r'^[A-Za-z]+$',
        description="First name - English letters only, 1-50 characters",
    )
    last_name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=50,
        pattern=r'^[A-Za-z]+$',
        description="Last name - English letters only, 1-50 characters",
    )
    email: Optional[EmailStr] = Field(
        None,
        description="Email address - must be valid",
    )
    password: Optional[str] = Field(
        None,
        min_length=6,
        max_length=100,
        description="Password must be between 6 and 100 characters",
    )
    date_birth: Optional[date] = Field(
        None,
        description="Date of birth",
    )
    phone_number: Optional[str] = Field(
        None,
        description="Phone number - must be a valid real number",
    )
    bio: Optional[str] = Field(
        None,
        max_length=1000,
        description="Tutor biography",
    )
    total_experience_years: Optional[int] = Field(
        None,
        ge=0,
        le=70,
        description="Total years of experience - between 0 and 70",
    )
    tution_type: Optional[TuitionTypeEnum] = Field(
        None,
        description="Tuition type - online, offline, or both",
    )

    @field_validator('first_name', 'last_name')
    @classmethod
    def validate_name_english_only(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        if not re.match(r'^[A-Za-z]+$', value):
            raise ValueError('Name must contain only English letters')
        return value.strip()

    @field_validator('phone_number')
    @classmethod
    def validate_phone_number(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        cleaned = re.sub(r'[\s\-\(\)]', '', value)
        if cleaned.startswith('+'):
            phone_digits = cleaned[1:]
            if not phone_digits.isdigit():
                raise ValueError('Phone number must contain only digits after +')
            if len(phone_digits) < 8 or len(phone_digits) > 14:
                raise ValueError('Phone number must be between 8 and 15 digits (including +)')
        else:
            if not cleaned.isdigit():
                raise ValueError('Phone number must contain only digits')
            if len(cleaned) < 8 or len(cleaned) > 15:
                raise ValueError('Phone number must be between 8 and 15 digits')
        return cleaned

    @field_validator('date_birth')
    @classmethod
    def validate_date_birth(cls, value: Optional[date]) -> Optional[date]:
        if value is None:
            return value
        today = date.today()
        age = today.year - value.year
        if (today.month, today.day) < (value.month, value.day):
            age -= 1
        if age < 12:
            raise ValueError('Tutor must be at least 12 years old')
        if age > 100:
            raise ValueError('Invalid age (more than 100 years)')
        return value

    @field_validator('total_experience_years')
    @classmethod
    def validate_experience_years(cls, value: Optional[int]) -> Optional[int]:
        if value is None:
            return value
        if value < 0:
            raise ValueError('Total experience years cannot be negative')
        if value > 70:
            raise ValueError('Total experience years cannot exceed 70')
        return value

    @field_validator('tution_type')
    @classmethod
    def validate_tution_type(cls, value: Optional[TuitionTypeEnum]) -> Optional[TuitionTypeEnum]:
        if value is None:
            return value
        allowed_values = ['online', 'offline', 'both']
        if value.value not in allowed_values:
            raise ValueError(f"Tuition type must be one of: {', '.join(allowed_values)}")
        return value


class TutorOut(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        use_enum_values=True,
    )

    tutor_id: int
    first_name: str
    last_name: str
    email: str
    date_birth: date
    phone_number: str
    tutor_photo: Optional[str] = None
    tutor_video: Optional[str] = None
    bio: Optional[str] = None
    total_experience_years: Optional[int] = None
    registered_at: datetime
    tution_type: TuitionTypeEnum
    verified: bool
    is_banned: bool = False
    banned_at: Optional[datetime] = None
    gender: Optional[gender_enum] = None
    reviews: Optional[List[ReviewOut]] = None
    Address: Optional[AddressOut] = None
    tutor_subjects: Optional[List[TutorSubjectsOut]] = None



class WeeklyActivityPoint(BaseModel):
    model_config = ConfigDict(from_attributes=True)
 
    day: str
    count: int
 
 
class RecentActivityItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
 
    type: str
    text: str
    timestamp: datetime


class RecentActivityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    items: List[RecentActivityItem]


class TutorRecentRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    lead_id: int
    title: str
    subject: str
    level: str
    is_public: bool
    lead_status: str
    student_name: Optional[str]
    created_at: datetime


class TutorRecentRequestsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    items: List[TutorRecentRequestOut]
 
 
class TutorStatsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
 
    new_requests: int
    pending_requests: int
    accepted_requests: int
    average_rating: Optional[float]
    weekly_activity: List[WeeklyActivityPoint]
    recent_activity: List[RecentActivityItem]
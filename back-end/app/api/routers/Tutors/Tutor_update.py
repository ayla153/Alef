from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_validator
from datetime import date, datetime
from typing import Optional
import re
from app.schemas.enums import TuitionTypeEnum

class UpdateTutorRequest(BaseModel):
    """Update tutor model - all fields are optional"""
    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
        use_enum_values=True,
        extra='forbid',  # Prevent extra fields from being sent
    )

    # All fields are Optional for partial updates
    first_name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=50,
        pattern=r'^[A-Za-z]+$',
        description="First name - English letters only, 1-50 characters"
    )

    last_name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=50,
        pattern=r'^[A-Za-z]+$',
        description="Last name - English letters only, 1-50 characters"
    )

    email: Optional[EmailStr] = Field(
        None,
        description="Email address - must be valid"
    )

    password: Optional[str] = Field(
        None,
        min_length=6,
        max_length=100,
        description="Password - must be between 6 and 100 characters"
    )

    date_birth: Optional[date] = Field(
        None,
        description="Date of birth"
    )

    phone_number: Optional[str] = Field(
        None,
        description="Phone number - must be a valid real number"
    )

    # tutor_photo: Optional[str] = Field(
    #     None,
    #     max_length=500,
    #     description="Tutor profile photo URL"
    # )

    # tutor_video: Optional[str] = Field(
    #     None,
    #     max_length=500,
    #     description="Tutor introduction video URL"
    # )

    bio: Optional[str] = Field(
        None,
        max_length=1000,
        description="Tutor biography"
    )

    total_experience_years: Optional[int] = Field(
        None,
        ge=0,
        le=70,
        description="Total years of experience - between 0 and 70"
    )

    tution_type: Optional[TuitionTypeEnum] = Field(
        None,
        description="Tuition type - online, offline, or both"
    )

    verified: Optional[bool] = Field(
        None,
        description="Verification status"
    )

    # ========== Validators (same as Create model) ==========

    @field_validator('first_name', 'last_name')
    @classmethod
    def validate_name_english_only(cls, value: Optional[str]) -> Optional[str]:
        """Ensure the name contains only English letters"""
        if value is None:
            return value
        if not re.match(r'^[A-Za-z]+$', value):
            raise ValueError('Name must contain only English letters')
        return value.strip()

    @field_validator('first_name', 'last_name')
    @classmethod
    def validate_name_length(cls, value: Optional[str]) -> Optional[str]:
        """Ensure name length is between 1 and 50 characters"""
        if value is None:
            return value
        if len(value) < 1 or len(value) > 50:
            raise ValueError('Name must be between 1 and 50 characters')
        return value

    @field_validator('phone_number')
    @classmethod
    def validate_phone_number(cls, value: Optional[str]) -> Optional[str]:
        """
        Validate phone number:
        - Must contain only digits
        - Can start with +
        - Length between 8 and 15 digits
        """
        if value is None:
            return value

        # Remove spaces, dashes, parentheses
        cleaned = re.sub(r'[\s\-\(\)]', '', value)

        # Allow + only at the beginning
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
        """Validate date of birth and ensure person is at least 18 years old"""
        if value is None:
            return value

        today = date.today()

        # Calculate age
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
        """Ensure experience years are realistic"""
        if value is None:
            return value

        if value < 0:
            raise ValueError('Total Experience years cannot be negative')

        if value > 70:
            raise ValueError('Total Experience years cannot exceed 70')

        return value

    @field_validator('tution_type')
    @classmethod
    def validate_tution_type(cls, value: Optional[TuitionTypeEnum]) -> Optional[TuitionTypeEnum]:
        """Ensure tuition type is valid"""
        if value is None:
            return value

        # Validation is automatic with enum, but we can add custom logic if needed
        allowed_values = ['online', 'offline', 'both']
        if value.value not in allowed_values:
            raise ValueError(f'Tuition type must be one of: {", ".join(allowed_values)}')

        return value

    # @field_validator('tutor_photo', 'tutor_video')
    # @classmethod
    # def validate_url(cls, value: Optional[str]) -> Optional[str]:
    #     """Validate URL format (optional fields)"""
    #     if value is None:
    #         return value

    #     # Basic URL validation
    #     url_pattern = r'^https?://[^\s/$.?#].[^\s]*$'
    #     if not re.match(url_pattern, value):
    #         raise ValueError('URL must be valid (starts with http:// or https://)')

    #     return value

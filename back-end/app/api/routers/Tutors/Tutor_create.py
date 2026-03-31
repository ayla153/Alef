from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from datetime import date, datetime
import re
from app.schemas.enums import TuitionTypeEnum

class CreateTutor(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,  # Replacement for orm_mode
        str_strip_whitespace=True,  # Automatically strip whitespace from strings
    )

    # Fields with validations
    first_name: str = Field(
        ...,
        min_length=1,
        max_length=50,
        pattern=r'^[A-Za-z]+$',
        description="First name - English letters only, 1-50 characters"
    )

    last_name: str = Field(
        ...,
        min_length=1,
        max_length=50,
        pattern=r'^[A-Za-z]+$',
        description="Last name - English letters only, 1-50 characters"
    )

    email: EmailStr = Field(
        ...,
        description="Email address - must be valid"
    )

    password: str = Field(
        ...,
        min_length=6,
        max_length=100,
        description="Password - must be between 6 and 100 characters"
    )

    date_birth: date = Field(
        ...,
        description="Date of birth in YYYY-MM-DD format"
    )

    phone_number: str = Field(
        ...,
        description="Phone number - must be a valid real number"
    )

    # tutor_photo: str | None = Field(
    #     None,
    #     description="Tutor profile photo URL"
    # )

    # tutor_video: str | None = Field(
    #     None,
    #     description="Tutor introduction video URL"
    # )

    bio: str | None = Field(
        None,
        max_length=1000,
        description="Tutor biography"
    )

    total_experience_years: int | None = Field(
        None,
        ge=0,           # greater than or equal to 0
        le=70,          # less than or equal to 70
        description="Total years of experience - between 0 and 70"
    )

    tution_type: TuitionTypeEnum = Field(
        ...,
        description="Tuition type (e.g., online, offline, both)"
    )


    # ========== Additional Validators ==========

    @field_validator('first_name', 'last_name')
    @classmethod
    def validate_name_english_only(cls, value: str) -> str:
        """Ensure the name contains only English letters"""
        if not value:
            return value
        if not re.match(r'^[A-Za-z]+$', value):
            raise ValueError('Name must contain only English letters')
        return value.strip()

    @field_validator('first_name', 'last_name')
    @classmethod
    def validate_name_length(cls, value: str) -> str:
        """Ensure name length is between 1 and 50 characters"""
        if not value:
            return value
        if len(value) < 1 or len(value) > 50:
            raise ValueError('Name must be between 1 and 50 characters')
        return value

    @field_validator('phone_number')
    @classmethod
    def validate_phone_number(cls, value: str) -> str:
        """
        Validate phone number:
        - Must contain only digits
        - Can start with +
        - Length between 8 and 15 digits
        """
        if not value:
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
    def validate_date_birth(cls, value: date) -> date:
        """Validate date of birth and ensure person is at least 18 years old"""
        if not value:
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
    def validate_total_experience_years(cls, value: int | None) -> int | None:
        """Ensure total experience years are realistic"""
        if value is None:
            return value

        if value < 0:
            raise ValueError('Total experience years cannot be negative')

        if value > 70:
            raise ValueError('Total experience years cannot exceed 70')

        return value


    # @field_validator('tutor_photo', 'tutor_video')
    # @classmethod
    # def validate_url(cls, value: str | None) -> str | None:
    #     """Validate URL format (optional fields)"""
    #     if value is None:
    #         return value

    #     # Basic URL validation
    #     url_pattern = r'^https?://[^\s/$.?#].[^\s]*$'
    #     if not re.match(url_pattern, value):
    #         raise ValueError('URL must be valid (starts with http:// or https://)')

    #     return value


# # Usage example
# if __name__ == "__main__":
#     # Valid data
#     valid_data = {
#         "first_name": "Ahmed",
#         "last_name": "Mohammad",
#         "email": "ahmed@example.com",
#         "date_birth": "1990-05-15",
#         "phone_number": "+96171234567",
#         "tutor_photo": "https://example.com/photo.jpg",
#         "bio": "Professional math tutor",
#         "experience_years": 5,
#         "registered_at": "2024-01-15 10:30:00",
#         "tution_type": "online",
#         "verified": False
#     }

#     try:
#         tutor = CreateTutor(**valid_data)
#         print("✅ Data is valid!")
#         print(tutor.model_dump())
#     except Exception as e:
#         print(f"❌ Error: {e}")
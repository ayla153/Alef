from pydantic import BaseModel, ConfigDict, Field, field_validator
import re


class CreateArea(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
    )

    title: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Area title - Arabic or English only, 1-50 characters",
    )
    city_id: int = Field(..., ge=0, description="City ID")

    @field_validator('title')
    @classmethod
    def validate_title(cls, value: str) -> str:
        # Allow Arabic characters, English letters, and spaces
        if not re.match(r'^[\u0600-\u06FFA-Za-z\s]+$', value):
            raise ValueError('Title must contain only Arabic or English characters')
        return value.strip()


class UpdateArea(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
        extra="forbid",
    )

    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
        description="Area title - Arabic or English only, 1-50 characters",
    )

    @field_validator('title')
    @classmethod
    def validate_title(cls, value: str) -> str:
        if not re.match(r'^[\u0600-\u06FFA-Za-z\s]+$', value):
            raise ValueError('Title must contain only Arabic or English characters')
        return value.strip()


class AreaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    area_id: int
    title: str
    city_id: int

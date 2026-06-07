from pydantic import BaseModel, ConfigDict, Field
import re


class CreateCity(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
    )

    title: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="City title - Arabic or English only, 1-50 characters",
    )

    @classmethod
    def validate_title(cls, value: str) -> str:
        # Allow Arabic characters, English letters, and spaces
        if not re.match(r'^[\u0600-\u06FFA-Za-z\s]+$', value):
            raise ValueError('Title must contain only Arabic or English characters')
        return value.strip()


class UpdateCity(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
        extra="forbid",
    )

    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
        description="City title - Arabic or English only, 1-50 characters",
    )


class CityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    city_id: int
    title: str

from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional


class CreateAddress(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
    )

    student_id: Optional[int] = Field(default=None, ge=0, description="Student ID - mutually exclusive with tutor_id")
    tutor_id: Optional[int] = Field(default=None, ge=0, description="Tutor ID - mutually exclusive with student_id")
    city_id: int = Field(..., ge=0, description="City ID")
    area_id: int = Field(..., ge=0, description="Area ID")

    @field_validator('student_id', 'tutor_id', mode='before')
    @classmethod
    def validate_exclusive_ids(cls, v):
        return v

    def __init__(self, **data):
        super().__init__(**data)
        # At least one of student_id or tutor_id must be provided
        if self.student_id is None and self.tutor_id is None:
            raise ValueError("Either student_id or tutor_id must be provided")
        # Cannot have both
        if self.student_id is not None and self.tutor_id is not None:
            raise ValueError("Cannot have both student_id and tutor_id")


class UpdateAddress(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
        extra="forbid",
    )

    city_id: int | None = Field(default=None, ge=0, description="City ID")
    area_id: int | None = Field(default=None, ge=0, description="Area ID")


class UpdateAddressAdmin(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
        extra="forbid",
    )

    student_id: Optional[int] = Field(default=None, ge=0, description="Student ID")
    tutor_id: Optional[int] = Field(default=None, ge=0, description="Tutor ID")
    city_id: int | None = Field(default=None, ge=0, description="City ID")
    area_id: int | None = Field(default=None, ge=0, description="Area ID")

    def __init__(self, **data):
        super().__init__(**data)
        # If both student_id and tutor_id are provided, validate
        if self.student_id is not None and self.tutor_id is not None:
            raise ValueError("Cannot have both student_id and tutor_id")
        # If neither are provided, check if at least one existing value will remain
        if self.student_id is None and self.tutor_id is None:
            # This will be validated in the service
            pass


class AddressOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    address_id: int
    student_id: Optional[int] = None
    tutor_id: Optional[int] = None
    city_id: int
    area_id: int
    city_title: str
    area_title: str

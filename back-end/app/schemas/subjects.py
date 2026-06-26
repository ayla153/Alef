from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CreateSubject(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
    )

    subject_title: str = Field(
        ...,
        min_length=1,
        max_length=100,
        pattern=r'^[A-Za-z]+$',
        description="Subject title - must be between 1 and 100 characters",
    )
    subject_description: Optional[str] = Field(
        None,
        max_length=500,
        pattern=r'^[A-Za-z][A-Za-z0-9]*$',
        description="Subject description - optional, max 500 characters",
    )


class UpdateSubjectRequest(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
        extra='forbid',
    )

    subject_title: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        pattern=r'^[A-Za-z]+$',
        description="Subject title - must be between 1 and 100 characters",
    )
    subject_description: Optional[str] = Field(
        None,
        max_length=500,
        pattern=r'^[A-Za-z][A-Za-z0-9]*$',
        description="Subject description - optional, max 500 characters",
    )


class SubjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    subject_id: int
    subject_title: str
    subject_description: Optional[str]
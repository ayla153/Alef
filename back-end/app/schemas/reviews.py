from __future__ import annotations

from datetime import datetime
from typing import Optional
import re

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ReviewOut(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    review_id: int
    tutor_id: int
    student_id: int
    number_of_stars: int
    comment: Optional[str]
    created_at: datetime


class CreateReview(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
    )

    tutor_id: int = Field(
        ...,
        gt=-1,
        description="Tutor ID - must be greater than -1",
    )
    number_of_stars: int = Field(
        ...,
        ge=0,
        le=5,
        description="Number of stars - must be between 0 and 5",
    )
    comment: Optional[str] = Field(
        None,
        max_length=500,
        description="Review comment - optional, max 500 characters",
    )

    @field_validator('comment')
    @classmethod
    def validate_comment(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        # Allow alphabets, numbers, spaces, and specific punctuation: ?, ., ,, (, ), *
        if not re.match(r'^[A-Za-z0-9\s\?\.\,\(\)\*]*$', value):
            raise ValueError('Comment can only contain letters, numbers, spaces, and punctuation (?, ., ,, (, ), *)')
        return value.strip()


class UpdateReviewRequest(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
        extra='forbid',
    )

    tutor_id: Optional[int] = Field(
        None,
        gt=-1,
        description="Tutor ID - must be greater than -1",
    )
    number_of_stars: Optional[int] = Field(
        None,
        ge=0,
        le=5,
        description="Number of stars - must be between 0 and 5",
    )
    comment: Optional[str] = Field(
        None,
        max_length=500,
        description="Review comment - optional, max 500 characters",
    )

    @field_validator('comment')
    @classmethod
    def validate_comment(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        # Allow alphabets, numbers, spaces, and specific punctuation: ?, ., ,, (, ), *
        if not re.match(r'^[A-Za-z0-9\s\?\.\,\(\)\*]*$', value):
            raise ValueError('Comment can only contain letters, numbers, spaces, and punctuation (?, ., ,, (, ), *)')
        return value.strip()
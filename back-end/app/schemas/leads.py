from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.enums import (
    LeadApplicationStatusEnum,
    LeadStatusEnum,
    TuitionTypeEnum,
    gender_enum,
)


class CreatePublicLeadIn(BaseModel):
    """Public marketplace lead only (SCRUM-60). No private fields."""

    model_config = ConfigDict(extra="forbid")

    title: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    foundation_tution: bool = False
    tution_type: TuitionTypeEnum
    expected_fee: float = Field(..., ge=0)
    preferred_gender: Optional[gender_enum] = None
    subject_id: int = Field(..., gt=0)
    level_id: int = Field(..., gt=0)


class CreateLeadIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    foundation_tution: bool = False
    tution_type: TuitionTypeEnum
    expected_fee: float = Field(..., ge=0)
    preferred_gender: Optional[gender_enum] = None
    subject_id: int = Field(..., gt=0)
    level_id: int = Field(..., gt=0)
    is_public: bool = True
    # Private lead (from tutor profile): fixed tutor; creates a lead_targets row on create (SCRUM-62).
    target_tutor_id: Optional[int] = Field(
        None,
        gt=0,
        description="Required for private leads; must be omitted for public-only leads.",
    )
    publish_public_copy: bool = Field(
        False,
        description="Private lead only: optional anonymized public browse card (no student name).",
    )


class OfferIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    proposed_fee: float = Field(..., ge=0)
    first_session_note: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1, max_length=500)


class LeadApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    lead_application_id: int
    tutor_id: int
    proposed_fee: float
    first_session_note: str
    message: str
    application_status: LeadApplicationStatusEnum
    contact_revealed_at: Optional[datetime] = None
    created_at: datetime
    tutor_first_name: Optional[str] = None
    tutor_phone_number: Optional[str] = Field(
        None,
        description="Populated only after contact reveal rules apply.",
    )


class LeadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    post_requirements_id: int
    title: str
    description: str
    foundation_tution: bool
    tution_type: TuitionTypeEnum
    expected_fee: float
    created_at: datetime
    expired_at: datetime
    preferred_gender: Optional[gender_enum] = None
    student_id: int
    subject_id: int
    level_id: int
    lead_status: LeadStatusEnum
    is_public: bool
    accepting_applications: bool
    closed_at: Optional[datetime] = None
    max_applications: int
    pending_offer_count: int = 0
    target_tutor_id: Optional[int] = None  # set when lead_target exists (private lead)
    student_phone_number: Optional[str] = Field(
        None,
        description="Populated only after contact reveal rules apply.",
    )
    applications: list[LeadApplicationOut] = Field(default_factory=list)


class LeadBrowseCardOut(BaseModel):
    """Anonymous public browse card — no student name or phone."""

    model_config = ConfigDict(from_attributes=True)

    post_requirements_id: int
    title: str
    description: str
    foundation_tution: bool
    tution_type: TuitionTypeEnum
    expected_fee: float
    created_at: datetime
    preferred_gender: Optional[gender_enum] = None
    subject_id: int
    level_id: int
    accepting_applications: bool
    pending_offer_count: int
    max_applications: int

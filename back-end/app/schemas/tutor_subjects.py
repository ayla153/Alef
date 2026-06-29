from typing import Optional

from pydantic import BaseModel, Field


class CreateTutorSubject(BaseModel):
    subject_id: int
    level_id: int
    foundation: bool = False
    elementory_stage: bool = False
    middle_stage: bool = False
    high_stage: bool = False
    experience_years: int = Field(0, ge=0)
    price_per_hour: int = Field(..., ge=0)


class UpdateTutorSubjectRequest(BaseModel):
    subject_id: Optional[int] = None
    level_id: Optional[int] = None
    foundation: Optional[bool] = None
    elementory_stage: Optional[bool] = None
    middle_stage: Optional[bool] = None
    high_stage: Optional[bool] = None
    experience_years: Optional[int] = Field(None, ge=0)
    price_per_hour: Optional[int] = Field(None, ge=0)
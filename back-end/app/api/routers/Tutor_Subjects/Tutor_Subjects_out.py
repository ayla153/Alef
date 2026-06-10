from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.schemas.levels import LevelOut
from app.schemas.subjects import SubjectOut


class TutorSubjectsOut(BaseModel):
    tutor_subject_id: int
    foundation: bool
    elementory_stage: bool
    middle_stage: bool
    high_stage: bool
    experience_years: int
    price_per_hour: int
    tutor_id: int
    subject: Optional[SubjectOut] = None
    level: Optional[LevelOut] = None
    level_id: int
    subject_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
    
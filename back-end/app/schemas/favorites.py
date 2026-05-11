from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CreateFavorite(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    tutor_id: int = Field(
        ...,
        gt=-1,
        description="Tutor ID - must be greater than -1",
    )


class UpdateFavoriteRequest(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        extra='forbid',
    )

    tutor_id: Optional[int] = Field(
        None,
        gt=-1,
        description="Tutor ID - must be greater than -1",
    )


class FavoriteOut(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    favorite_id: int
    student_id: int
    tutor_id: int
    created_at: datetime
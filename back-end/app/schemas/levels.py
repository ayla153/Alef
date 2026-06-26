from pydantic import BaseModel, ConfigDict, Field
from typing import Optional

class CreateLevel(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
    )

    level_title: str = Field(
        ...,
        min_length=1,
        max_length=100,
        pattern=r'^[A-Za-z][A-Za-z0-9]*$',
        description="Level title - must be between 1 and 100 characters",
    )


class UpdateLevelRequest(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
        extra='forbid',
    )

    level_title: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        pattern=r'^[A-Za-z][A-Za-z0-9]*$',
        description="Level title - must be between 1 and 100 characters",
    )


class LevelOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    level_id: int
    level_title: str
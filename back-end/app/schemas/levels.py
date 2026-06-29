import re
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

# عربي + إنجليزي + أرقام + مسافات وشرطة (مطابق للمواد والفرونت)
_LEVEL_TITLE_RE = re.compile(r"^[\u0600-\u06FFa-zA-Z0-9\s\-']+$")


class CreateLevel(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
    )

    level_title: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="اسم المرحلة — عربي أو إنجليزي",
    )

    @field_validator("level_title")
    @classmethod
    def validate_level_title(cls, value: str) -> str:
        if not _LEVEL_TITLE_RE.fullmatch(value):
            raise ValueError(
                "اسم المرحلة يقبل حروفاً عربية أو إنجليزية وأرقاماً ومسافات فقط (مثال: المرحلة الابتدائية أو Grade9)"
            )
        return value


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
    )

    @field_validator("level_title")
    @classmethod
    def validate_level_title(cls, value: str | None) -> str | None:
        if value is None:
            return value
        if not _LEVEL_TITLE_RE.fullmatch(value):
            raise ValueError(
                "اسم المرحلة يقبل حروفاً عربية أو إنجليزية وأرقاماً ومسافات فقط (مثال: المرحلة الابتدائية أو Grade9)"
            )
        return value


class LevelOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    level_id: int
    level_title: str
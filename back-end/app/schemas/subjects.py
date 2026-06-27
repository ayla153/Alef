import re
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

# عربي + إنجليزي + أرقام + مسافات وشرطة
_SUBJECT_TITLE_RE = re.compile(r"^[\u0600-\u06FFa-zA-Z0-9\s\-']+$")


class CreateSubject(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
    )

    subject_title: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="اسم المادة — عربي أو إنجليزي",
    )
    subject_description: Optional[str] = Field(
        None,
        max_length=500,
        description="وصف اختياري للمادة",
    )

    @field_validator("subject_title")
    @classmethod
    def validate_subject_title(cls, value: str) -> str:
        if not _SUBJECT_TITLE_RE.fullmatch(value):
            raise ValueError(
                "اسم المادة يقبل حروفاً عربية أو إنجليزية وأرقاماً ومسافات فقط (مثال: الرياضيات أو Math)"
            )
        return value


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
    )
    subject_description: Optional[str] = Field(
        None,
        max_length=500,
    )

    @field_validator("subject_title")
    @classmethod
    def validate_subject_title(cls, value: str | None) -> str | None:
        if value is None:
            return value
        if not _SUBJECT_TITLE_RE.fullmatch(value):
            raise ValueError(
                "اسم المادة يقبل حروفاً عربية أو إنجليزية وأرقاماً ومسافات فقط (مثال: الرياضيات أو Math)"
            )
        return value


class SubjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    subject_id: int
    subject_title: str
    subject_description: Optional[str]

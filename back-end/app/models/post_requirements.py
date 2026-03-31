from sqlalchemy import Integer, String, TIMESTAMP, Boolean, Float, Enum, ForeignKey
from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, TYPE_CHECKING
from app.schemas.enums import TuitionTypeEnum, gender_enum

if TYPE_CHECKING:
    from app.models.students import Student
    from app.models.subjects import Subject
    from app.models.levels import Level
    from app.models.post_statuses import PostStatus

class PostRequirement(Base):
    __tablename__ = "post_requirements"

    post_requirements_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    foundation_tution: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    tution_type: Mapped[TuitionTypeEnum] = mapped_column(Enum(TuitionTypeEnum), nullable=False)
    expected_fee: Mapped[Float] = mapped_column(Float, nullable=False)
    created_at: Mapped[TIMESTAMP] = mapped_column(TIMESTAMP, nullable=False)
    expired_at: Mapped[TIMESTAMP] = mapped_column(TIMESTAMP, nullable=False)
    preferred_gender: Mapped[Optional[gender_enum]] = mapped_column(Enum(gender_enum), nullable=True)

    #foreign keys
    student_id: Mapped[int] = mapped_column(ForeignKey("students.student_id"), nullable=False)
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.subject_id"), nullable=False)
    level_id: Mapped[int] = mapped_column(ForeignKey("levels.level_id"), nullable=False)

    #relationships
    student : Mapped["Student"] = relationship("Student", back_populates="post_requirements")
    subject : Mapped["Subject"] = relationship("Subject", back_populates="post_requirements")
    level : Mapped["Level"] = relationship("Level", back_populates="post_requirements")
    post_status: Mapped[Optional["PostStatus"]] = relationship(
        "PostStatus",
        back_populates="post",
        uselist=False,
        cascade="all, delete-orphan",
    )

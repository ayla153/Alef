from datetime import datetime
from typing import List, Optional, TYPE_CHECKING

from sqlalchemy import Boolean, Enum, Float, ForeignKey, Integer, String, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.schemas.enums import LeadStatusEnum, TuitionTypeEnum, enum_values_callable, gender_enum

if TYPE_CHECKING:
    from app.models.lead_applications import LeadApplication
    from app.models.lead_targets import LeadTarget
    from app.models.levels import Level
    from app.models.students import Student
    from app.models.subjects import Subject

class PostRequirement(Base):
    __tablename__ = "post_requirements"

    post_requirements_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    foundation_tution: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    tution_type: Mapped[TuitionTypeEnum] = mapped_column(
        Enum(TuitionTypeEnum, values_callable=enum_values_callable),
        nullable=False,
    )
    help_type: Mapped[str] = mapped_column(String(100), nullable=False)
    min_expected_fee: Mapped[Float] = mapped_column(Float, nullable=False)
    max_expected_fee: Mapped[Float] = mapped_column(Float, nullable=False)
    weekly_classes: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[TIMESTAMP] = mapped_column(TIMESTAMP, nullable=False)
    expired_at: Mapped[TIMESTAMP] = mapped_column(TIMESTAMP, nullable=False)
    preferred_gender: Mapped[Optional[gender_enum]] = mapped_column(
        Enum(gender_enum, values_callable=enum_values_callable),
        nullable=True,
    )
    lead_status: Mapped[LeadStatusEnum] = mapped_column(
        Enum(LeadStatusEnum, values_callable=enum_values_callable),
        nullable=False,
        default=LeadStatusEnum.OPEN,
    )
    is_public: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    accepting_applications: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    closed_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP, nullable=True)
    max_applications: Mapped[int] = mapped_column(Integer, nullable=False, default=5)

    #foreign keys
    student_id: Mapped[int] = mapped_column(ForeignKey("students.student_id"), nullable=False)
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.subject_id"), nullable=False)
    level_id: Mapped[int] = mapped_column(ForeignKey("levels.level_id"), nullable=False)

    #relationships
    student : Mapped["Student"] = relationship("Student", back_populates="post_requirements")
    subject : Mapped["Subject"] = relationship("Subject", back_populates="post_requirements")
    level : Mapped["Level"] = relationship("Level", back_populates="post_requirements")
    # Present only for private leads (طلب خاص); None means public-only or browse copy without a target.
    lead_target: Mapped[Optional["LeadTarget"]] = relationship(
        "LeadTarget",
        back_populates="lead",
        uselist=False,
        cascade="all, delete-orphan",
    )
    lead_applications: Mapped[List["LeadApplication"]] = relationship(
        "LeadApplication",
        back_populates="lead",
        cascade="all, delete-orphan",
    )

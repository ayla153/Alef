from sqlalchemy import Integer, String, TIMESTAMP, Boolean, Float, Enum, ForeignKey
from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from app.schemas.enums import gender_enum, tution_type_enum

class PostRequirement(Base):
    __tablename__ = "post_requirements"

    post_requirement_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    foundation_tution: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    tution_type: Mapped[tution_type_enum] = mapped_column(Enum(tution_type_enum), nullable=False)
    expected_fee: Mapped[Float] = mapped_column(Float, nullable=False)
    created_at: Mapped[TIMESTAMP] = mapped_column(TIMESTAMP, nullable=False)
    expired_at: Mapped[TIMESTAMP] = mapped_column(TIMESTAMP, nullable=False)
    preferred_gender: Mapped[Optional[gender_enum]] = mapped_column(Enum(gender_enum), nullable=True)

    #foreign keys
    student_id: Mapped[int] = mapped_column(ForeignKey("students.student_id"), nullable=False)
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.subject_id"), nullable=False)
    level_id: Mapped[int] = mapped_column(ForeignKey("levels.level_id"), nullable=False)

    #relationships
    student = relationship("Student", back_populates="post_requirements")
    subject = relationship("Subject", back_populates="post_requirements")
    level = relationship("Level", back_populates="post_requirements")
    post_statuses = relationship("PostStatus", back_populates="posts")

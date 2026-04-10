from sqlalchemy import Boolean, Integer, ForeignKey
from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship

class TutorSubject(Base):
    __tablename__ = "tutor_subjects"

    tutor_subject_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    foundation : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    elementory_stage : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    middle_stage : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    high_stage : Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    experience_years: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    price_per_hour: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    #foreign keys
    tutor_id : Mapped[int] = mapped_column(ForeignKey("tutors.tutor_id"), nullable=False)
    subject_id : Mapped[int] = mapped_column(ForeignKey("subjects.subject_id"), nullable=False)
    level_id: Mapped[int] = mapped_column(ForeignKey("levels.level_id"), nullable=False)

    #relationships
    tutor = relationship("Tutor", back_populates="tutor_subjects")
    subject = relationship("Subject", back_populates="tutor_subjects")
    level = relationship("Level", back_populates="tutor_subjects")

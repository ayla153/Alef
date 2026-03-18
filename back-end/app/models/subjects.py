from typing import Optional
from sqlalchemy import Integer, String
from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship

class Subject(Base):
    __tablename__ = "subjects"

    subject_id : Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    subject_title: Mapped[str] = mapped_column(String(100), nullable=False)
    subject_description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    #relationships
    tutor_subjects = relationship("TutorSubject", back_populates="subject")
    post_requirements = relationship("PostRequirement", back_populates="subject")
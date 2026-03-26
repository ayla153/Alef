from typing import Optional, TYPE_CHECKING, List
from sqlalchemy import Integer, String
from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.levels import Level

if TYPE_CHECKING:
     from app.models.tutor_subjects import TutorSubject
     from app.models.post_requirements import PostRequirement
     from app.models.levels import Level

class Subject(Base):
    __tablename__ = "subjects"

    subject_id : Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    subject_title: Mapped[str] = mapped_column(String(100), nullable=False)
    subject_description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    #relationships
    tutor_subjects : Mapped[List["TutorSubject"]] = relationship("TutorSubject", back_populates="subject")
    post_requirements : Mapped[List["PostRequirement"]] = relationship("PostRequirement", back_populates="subject")
    levels : Mapped[List["Level"]] = relationship("Level", back_populates="subject", cascade="all, delete-orphan")
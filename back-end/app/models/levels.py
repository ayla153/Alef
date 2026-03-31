from sqlalchemy import Integer, String
from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING, List

if TYPE_CHECKING:
     from app.models.post_requirements import PostRequirement
     from app.models.tutor_subjects import TutorSubject

class Level(Base):
    __tablename__ = "levels"

    level_id : Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    level_title: Mapped[str] = mapped_column(String(100), nullable=False)

    #relationships
    post_requirements : Mapped[List["PostRequirement"]] = relationship("PostRequirement", back_populates="level")
    tutor_subjects : Mapped[List["TutorSubject"]] = relationship("TutorSubject", back_populates="level")
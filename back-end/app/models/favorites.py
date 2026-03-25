from sqlalchemy import Integer, TIMESTAMP, ForeignKey
from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.students import Student
    from app.models.tutors import Tutor

class Favorite(Base):
    __tablename__ = "favorites"

    favorite_id : Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False)

    #foreign keys
    student_id: Mapped[int] = mapped_column(ForeignKey("students.student_id"), nullable=False)
    tutor_id: Mapped[int] = mapped_column(ForeignKey("tutors.tutor_id"), nullable=False)

    #relationships
    student : Mapped["Student"] = relationship("Student", back_populates="favorites")
    tutor : Mapped["Tutor"] = relationship("Tutor", back_populates="favorites")
    
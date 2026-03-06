from sqlalchemy import Integer, String, TIMESTAMP, ForeignKey
from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

class Review(Base):
    __tablename__ = "reviews"

    review_id : Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    number_of_stars: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False)
    comment: Mapped[str] = mapped_column(String(500), nullable=True)

    #foreign keys
    tutor_id: Mapped[int] = mapped_column(ForeignKey("tutors.tutor_id"), nullable=False)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.student_id"), nullable=False)

    #relationships
    tutor = relationship("Tutor", back_populates="reviews")
    student = relationship("Student", back_populates="reviews")
from sqlalchemy import Enum, Integer, String, TIMESTAMP
from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from datetime import datetime
from app.schemas.enums import tution_type_enum

class Tutor(Base):
    __tablename__ = "tutors"

    tutor_id : Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    first_name: Mapped[str] = mapped_column(String(50),nullable=False)
    last_name: Mapped[str] = mapped_column(String(50),nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)
    date_birth: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False)
    phone_number: Mapped[Optional[str]] = mapped_column(String(20),nullable=False)
    tutor_photo: Mapped[Optional[str]] = mapped_column(String,nullable=True)
    tutor_video: Mapped[Optional[str]] = mapped_column(String,nullable=True)
    bio: Mapped[str] = mapped_column(String(500),nullable=True)
    experience_years: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    registered_at: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False)
    tution_type: Mapped[tution_type_enum] = mapped_column(Enum(tution_type_enum), nullable=False)
    verified: Mapped[bool] = mapped_column(nullable=False, default=False)

    #relationships
    favorites = relationship("Favorite", back_populates="tutor")
    reviews = relationship("Review", back_populates="tutor")
    post_statuses = relationship("PostStatus", back_populates="tutor")
    tutor_subjects = relationship("TutorSubject", back_populates="tutor")
    
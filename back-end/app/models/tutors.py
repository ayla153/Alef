from sqlalchemy import Integer, String, TIMESTAMP
from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from datetime import datetime

class Tutor(Base):
    __tablename__ = "tutors"

    tutor_id : Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    first_name: Mapped[str] = mapped_column(String(50),nullable=False)
    last_name: Mapped[str] = mapped_column(String(50),nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)
    date_birth: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False)
    phone_number: Mapped[Optional[str]] = mapped_column(String(20),nullable=False)
    #address: Mapped[str] = mapped_column(String(200),nullable=True)
    tutor_photo: Mapped[Optional[str]] = mapped_column(String,nullable=True)
    tutor_video: Mapped[Optional[str]] = mapped_column(String,nullable=True)
    tutor_bio: Mapped[str] = mapped_column(String(500),nullable=True)
    registered_at: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False)
    online_tutions: Mapped[bool] = mapped_column(nullable=False, default=True)
    offline_tutions: Mapped[bool] = mapped_column(nullable=False, default=False)
    verified: Mapped[bool] = mapped_column(nullable=False, default=False)

    #relationships
    favorites = relationship("Favorite", back_populates="tutor")
    reviews = relationship("Review", back_populates="tutor")
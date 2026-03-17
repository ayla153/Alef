from sqlalchemy import Integer, String, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from datetime import datetime
from typing import Optional

class Student(Base):
    __tablename__ = "students"

    student_id : Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    first_name: Mapped[str] = mapped_column(String(50),nullable=False)
    last_name: Mapped[str] = mapped_column(String(50),nullable=False)
    birth_date: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)
    phone_number: Mapped[Optional[str]] = mapped_column(String(20),nullable=False)
    #address: Mapped[str] = mapped_column(String(200),nullable=True)
    student_photo:Mapped[Optional[str]] = mapped_column(String,nullable=True)

    #relationships
    favorites = relationship("Favorite", back_populates="student")
    reviews = relationship("Review", back_populates="student")

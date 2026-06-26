from datetime import date, datetime

from sqlalchemy import Date, Enum, Integer, String, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.schemas.enums import enum_values_callable, student_grade_enum


class PendingStudentRegistration(Base):
    __tablename__ = "pending_student_registrations"

    pending_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    date_birth: Mapped[date] = mapped_column(Date, nullable=False)
    phone_number: Mapped[str] = mapped_column(String(20), nullable=False)
    grade_level: Mapped[student_grade_enum] = mapped_column(
        Enum(student_grade_enum, values_callable=enum_values_callable),
        nullable=False,
    )
    expires_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)

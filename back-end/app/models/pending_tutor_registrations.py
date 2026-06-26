from datetime import date, datetime
from typing import Any

from sqlalchemy import Date, Integer, String, TIMESTAMP
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class PendingTutorRegistration(Base):
    __tablename__ = "pending_tutor_registrations"

    pending_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    date_birth: Mapped[date] = mapped_column(Date, nullable=False)
    phone_number: Mapped[str] = mapped_column(String(20), nullable=False)
    step2_data: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    step3_data: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    step4_data: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    current_step: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    expires_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)

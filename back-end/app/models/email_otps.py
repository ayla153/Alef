from datetime import datetime

from sqlalchemy import Enum, Integer, String, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.schemas.enums import AuthUserRoleEnum, OtpPurposeEnum, enum_values_callable


class EmailOtp(Base):
    __tablename__ = "email_otps"

    otp_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    code_hash: Mapped[str] = mapped_column(String, nullable=False)
    purpose: Mapped[OtpPurposeEnum] = mapped_column(
        Enum(OtpPurposeEnum, values_callable=enum_values_callable),
        nullable=False,
    )
    role: Mapped[AuthUserRoleEnum] = mapped_column(
        Enum(AuthUserRoleEnum, values_callable=enum_values_callable),
        nullable=False,
    )
    expires_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    attempt_count: Mapped[int] = mapped_column(nullable=False, default=0)
    locked_until: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)

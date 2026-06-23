from datetime import datetime

from sqlalchemy import Boolean, Enum, Integer, JSON, String, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.schemas.enums import NotificationType, enum_values_callable


class Notification(Base):
    __tablename__ = "notifications"

    notification_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    recipient_type: Mapped[str] = mapped_column(String(20), nullable=False)
    recipient_id: Mapped[int] = mapped_column(Integer, nullable=False)

    notification_type: Mapped[NotificationType] = mapped_column(
        Enum(NotificationType, values_callable=enum_values_callable),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    body: Mapped[str] = mapped_column(String(500), nullable=False)
    data: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    read_at: Mapped[datetime | None] = mapped_column(TIMESTAMP, nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False, server_default=func.now())

    @property
    def id(self) -> int:
        return self.notification_id

    @property
    def type(self) -> NotificationType:
        return self.notification_type

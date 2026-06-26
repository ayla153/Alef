from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.schemas.enums import NotificationType


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: NotificationType
    title: str
    body: str
    data: Optional[dict] = None
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime


class CreateNotification(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    recipient_role: str
    recipient_id: int
    notification_type: NotificationType
    title: str
    message: str
    data: Optional[dict] = None
    actor_role: Optional[str] = None
    actor_id: Optional[int] = None
    related_type: Optional[str] = None
    related_id: Optional[int] = None


class NotificationListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    items: list[NotificationOut]
    unread_count: int


class NotificationUnreadCountOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    unread_count: int

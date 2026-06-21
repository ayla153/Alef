from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.enums import NotificationType


class CreateNotification(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    recipient_role: Literal["student", "tutor", "admin"]
    recipient_id: int
    notification_type: NotificationType
    title: str = Field(..., min_length=1, max_length=120)
    message: str = Field(..., min_length=1)

    actor_role: Optional[Literal["student", "tutor", "admin"]] = None
    actor_id: Optional[int] = None
    related_type: Optional[str] = None
    related_id: Optional[int] = None


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    notification_id: int
    recipient_role: str
    recipient_id: int
    actor_role: Optional[str]
    actor_id: Optional[int]
    notification_type: NotificationType
    title: str
    message: str
    is_read: bool
    related_type: Optional[str]
    related_id: Optional[int]
    created_at: datetime


class NotificationUnreadCountOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    unread_count: int

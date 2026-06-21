from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.websocket import manager
from app.models.notifications import Notification
from app.schemas.enums import NotificationType
from app.schemas.notifications import CreateNotification, NotificationOut, NotificationUnreadCountOut


def _notification_to_out(notification: Notification) -> NotificationOut:
    return NotificationOut.model_validate(notification)


def create_notification(db: Session, data: CreateNotification) -> NotificationOut:
    notification_type_value = data.notification_type.value if isinstance(data.notification_type, NotificationType) else str(data.notification_type)

    notification = Notification(
        recipient_role=data.recipient_role,
        recipient_id=data.recipient_id,
        actor_role=data.actor_role,
        actor_id=data.actor_id,
        notification_type=notification_type_value,
        title=data.title,
        message=data.message,
        related_type=data.related_type,
        related_id=data.related_id,
        created_at=datetime.utcnow(),
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return _notification_to_out(notification)


async def notify_user(db: Session, data: CreateNotification) -> NotificationOut:
    notification_out = create_notification(db, data)
    await manager.send_to_user(
        data.recipient_role,
        data.recipient_id,
        {
            "type": "notification",
            "event": notification_out.notification_type.value,
            "notification": notification_out.model_dump(mode="json"),
        },
    )
    return notification_out


def list_notifications_for_user(db: Session, recipient_role: str, recipient_id: int) -> list[NotificationOut]:
    notifications = (
        db.scalars(
            select(Notification)
            .where(
                Notification.recipient_role == recipient_role,
                Notification.recipient_id == recipient_id,
            )
            .order_by(Notification.created_at.desc())
        )
        .all()
    )
    return [_notification_to_out(item) for item in notifications]


def unread_count_for_user(db: Session, recipient_role: str, recipient_id: int) -> NotificationUnreadCountOut:
    unread_count = db.scalar(
        select(func.count(Notification.notification_id)).where(
            Notification.recipient_role == recipient_role,
            Notification.recipient_id == recipient_id,
            Notification.is_read.is_(False),
        )
    )
    return NotificationUnreadCountOut(unread_count=int(unread_count or 0))


def mark_notification_read(db: Session, notification_id: int, recipient_role: str, recipient_id: int) -> NotificationOut:
    notification = db.get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    if notification.recipient_role != recipient_role or notification.recipient_id != recipient_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only update your own notifications")

    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return _notification_to_out(notification)


def mark_all_notifications_read(db: Session, recipient_role: str, recipient_id: int) -> int:
    updated = (
        db.query(Notification)
        .filter(
            Notification.recipient_role == recipient_role,
            Notification.recipient_id == recipient_id,
            Notification.is_read.is_(False),
        )
        .update({Notification.is_read: True}, synchronize_session=False)
    )
    db.commit()
    return updated

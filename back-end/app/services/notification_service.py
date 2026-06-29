import asyncio

from fastapi import BackgroundTasks, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.connection_manager import manager
from app.services.email_service import send_email
from app.database import LocalSession
from app.models.admins import Admin
from app.models.notifications import Notification
from app.models.post_requirements import PostRequirement
from app.models.students import Student
from app.models.tutor_subjects import TutorSubject
from app.models.tutors import Tutor
from app.schemas.enums import NotificationType
from app.schemas.notifications import (
    CreateNotification,
    NotificationListResponse,
    NotificationOut,
    NotificationUnreadCountOut,
)


def _notification_to_out(notification: Notification) -> NotificationOut:
    return NotificationOut.model_validate(notification)


class NotificationService:
    def _create_record(
        self,
        db: Session,
        recipient_id: int,
        recipient_type: str,
        notification_type: NotificationType,
        title: str,
        body: str,
        data: dict | None = None,
    ) -> Notification:
        notification = Notification(
            recipient_type=recipient_type,
            recipient_id=recipient_id,
            notification_type=notification_type,
            title=title,
            body=body,
            data=data,
        )
        # Commit on a dedicated session so we never flush unrelated dirty ORM
        # objects from the caller's request session (e.g. leads mid-update).
        session = LocalSession()
        try:
            session.add(notification)
            session.commit()
            session.refresh(notification)
            return notification
        finally:
            session.close()

    def _resolve_recipient_email(self, recipient_type: str, recipient_id: int) -> str | None:
        session = LocalSession()
        try:
            if recipient_type == "student":
                recipient = session.get(Student, recipient_id)
            elif recipient_type == "tutor":
                recipient = session.get(Tutor, recipient_id)
            elif recipient_type == "admin":
                recipient = session.get(Admin, recipient_id)
            else:
                return None
            return getattr(recipient, "email", None)
        finally:
            session.close()

    async def _deliver(self, notification: Notification) -> None:
        if manager.is_online(notification.recipient_type, notification.recipient_id):
            await manager.send(
                notification.recipient_type,
                notification.recipient_id,
                {
                    "id": notification.notification_id,
                    "type": notification.notification_type.value,
                    "title": notification.title,
                    "body": notification.body,
                    "data": notification.data,
                    "is_read": notification.is_read,
                    "created_at": notification.created_at.isoformat(),
                },
            )
            return

        email = self._resolve_recipient_email(notification.recipient_type, notification.recipient_id)
        if email:
            send_email(email, notification.title, notification.body)

    def _deliver_sync(self, notification: Notification) -> None:
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            asyncio.run(self._deliver(notification))
        else:
            loop.create_task(self._deliver(notification))

    def create(
        self,
        db: Session,
        recipient_id: int,
        recipient_type: str,
        notification_type: NotificationType,
        title: str,
        body: str,
        data: dict | None = None,
        background_tasks: BackgroundTasks | None = None,
        deliver: bool = True,
    ) -> Notification:
        notification = self._create_record(
            db,
            recipient_id,
            recipient_type,
            notification_type,
            title,
            body,
            data,
        )
        if deliver:
            if background_tasks is not None:
                background_tasks.add_task(self._deliver_sync, notification)
            else:
                self._deliver_sync(notification)
        return notification

    async def notify_user(self, db: Session, notification: CreateNotification) -> Notification:
        payload_data = dict(notification.data or {})
        if notification.actor_role is not None:
            payload_data["actor_role"] = notification.actor_role
        if notification.actor_id is not None:
            payload_data["actor_id"] = notification.actor_id
        if notification.related_type is not None:
            payload_data["related_type"] = notification.related_type
        if notification.related_id is not None:
            payload_data["related_id"] = notification.related_id

        notification_record = self.create(
            db,
            recipient_id=notification.recipient_id,
            recipient_type=notification.recipient_role,
            notification_type=notification.notification_type,
            title=notification.title,
            body=notification.message,
            data=payload_data or None,
            deliver=False,
        )
        await self._deliver(notification_record)
        return notification_record

    def list_notifications_for_user(self, db: Session, recipient_type: str, recipient_id: int) -> list[NotificationOut]:
        notifications = (
            db.scalars(
                select(Notification)
                .where(
                    Notification.recipient_type == recipient_type,
                    Notification.recipient_id == recipient_id,
                )
                .order_by(Notification.created_at.desc())
            )
            .all()
        )
        return [_notification_to_out(item) for item in notifications]

    def unread_count_for_user(self, db: Session, recipient_type: str, recipient_id: int) -> NotificationUnreadCountOut:
        unread_count = db.scalar(
            select(func.count(Notification.notification_id)).where(
                Notification.recipient_type == recipient_type,
                Notification.recipient_id == recipient_id,
                Notification.is_read.is_(False),
            )
        )
        return NotificationUnreadCountOut(unread_count=int(unread_count or 0))

    def mark_notification_read(self, db: Session, notification_id: int, recipient_type: str, recipient_id: int) -> NotificationOut:
        notification = db.get(Notification, notification_id)
        if not notification:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
        if notification.recipient_type != recipient_type or notification.recipient_id != recipient_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only update your own notifications")

        notification.is_read = True
        notification.read_at = func.now()
        db.commit()
        db.refresh(notification)
        return _notification_to_out(notification)

    def mark_all_notifications_read(self, db: Session, recipient_type: str, recipient_id: int) -> int:
        updated = (
            db.query(Notification)
            .filter(
                Notification.recipient_type == recipient_type,
                Notification.recipient_id == recipient_id,
                Notification.is_read.is_(False),
            )
            .update({Notification.is_read: True, Notification.read_at: func.now()}, synchronize_session=False)
        )
        db.commit()
        return updated

    def create_notifications_for_tutors(
        self,
        db: Session,
        tutor_ids: list[int],
        notification_type: NotificationType,
        title: str,
        body: str,
        data: dict | None = None,
    ) -> None:
        for tutor_id in tutor_ids:
            self.create(db, tutor_id, "tutor", notification_type, title, body, data)

    def notify_public_lead_created(self, db: Session, lead_id: int, subject_id: int, level_id: int) -> None:
        tutor_ids = [
            tutor_subject.tutor_id
            for tutor_subject in (
                db.query(TutorSubject)
                .filter(
                    TutorSubject.subject_id == subject_id,
                    TutorSubject.level_id == level_id,
                )
                .join(Tutor)
                .filter(Tutor.verified.is_(True), Tutor.is_banned.is_(False))
                .limit(5)
                .all()
            )
        ]
        for tutor_id in tutor_ids:
            self.create(
                db,
                tutor_id,
                "tutor",
                NotificationType.PUBLIC_LEAD_CREATED,
                "A new lead is available in your subject",
                "A new lead is available in your subject — check the marketplace now.",
                data={"lead_id": lead_id, "subject_id": subject_id, "level_id": level_id},
            )

    def notify_public_lead_slots_full(self, db: Session, student_id: int, lead_id: int) -> None:
        self.create(
            db,
            student_id,
            "student",
            NotificationType.PUBLIC_LEAD_SLOTS_FULL,
            "Your lead has 5 offers waiting, time to review them",
            "Your lead has 5 offers waiting, time to review them.",
            data={"lead_id": lead_id},
        )

    def notify_public_lead_expired(self, db: Session, lead_id: int) -> None:
        lead = db.get(PostRequirement, lead_id)
        if not lead or not lead.student_id:
            return

        self.create(
            db,
            lead.student_id,
            "student",
            NotificationType.PUBLIC_LEAD_EXPIRED,
            "Your lead has expired",
            "Your public lead expired. If you still need tutoring, please create a new request.",
            data={"lead_id": lead_id},
        )

    def notify_public_lead_closed_matched(self, db: Session, tutor_id: int, lead_id: int) -> None:
        self.create(
            db,
            tutor_id,
            "tutor",
            NotificationType.PUBLIC_LEAD_CLOSED_MATCHED,
            "The student has closed the lead, you can now connect",
            "The student has closed the lead — you can now connect with the student.",
            data={"lead_id": lead_id},
        )

    def notify_public_lead_closed_no_match(self, db: Session, tutor_id: int, lead_id: int) -> None:
        self.create(
            db,
            tutor_id,
            "tutor",
            NotificationType.PUBLIC_LEAD_CLOSED_NO_MATCH,
            "The student closed the lead without selecting anyone",
            "The student closed the lead without selecting anyone.",
            data={"lead_id": lead_id},
        )

    def notify_new_offer_received(self, db: Session, student_id: int, tutor_id: int, lead_id: int, lead_title: str) -> None:
        self.create(
            db,
            student_id,
            "student",
            NotificationType.NEW_OFFER_RECEIVED,
            "A tutor sent you an offer on your lead",
            f"A tutor sent you an offer on your lead '{lead_title}'.",
            data={"lead_id": lead_id, "tutor_id": tutor_id},
        )

    def notify_offer_accepted(self, db: Session, tutor_id: int, offer_id: int, lead_id: int) -> None:
        self.create(
            db,
            tutor_id,
            "tutor",
            NotificationType.OFFER_ACCEPTED,
            "Your offer was accepted — the student's contact is now visible",
            "Your offer was accepted — the student's contact is now visible.",
            data={"offer_id": offer_id, "lead_id": lead_id},
        )

    def notify_offer_rejected(self, db: Session, tutor_id: int, offer_id: int, lead_id: int) -> None:
        self.create(
            db,
            tutor_id,
            "tutor",
            NotificationType.OFFER_REJECTED,
            "Your offer was not selected for this lead",
            "Your offer was not selected for this lead.",
            data={"offer_id": offer_id, "lead_id": lead_id},
        )

    def notify_offer_slot_opened(self, db: Session, tutor_id: int, lead_id: int) -> None:
        self.create(
            db,
            tutor_id,
            "tutor",
            NotificationType.OFFER_SLOT_OPENED,
            "A lead you're eligible for just opened up",
            "A lead you're eligible for just opened up — apply now.",
            data={"lead_id": lead_id},
        )

    def notify_private_lead_received(
        self,
        db: Session,
        tutor_id: int,
        lead_id: int,
        student_name: str | None = None,
    ) -> None:
        if student_name:
            title = f"طلب خاص من {student_name}"
            body = f"{student_name} أرسل لك طلباً خاصاً — راجع صندوق الوارد."
        else:
            title = "طلب خاص جديد"
            body = "وصلك طلب خاص من طالب — راجع صندوق الوارد."
        self.create(
            db,
            tutor_id,
            "tutor",
            NotificationType.PRIVATE_LEAD_RECEIVED,
            title,
            body,
            data={"lead_id": lead_id, "student_name": student_name},
        )

    def notify_private_lead_accepted(self, db: Session, student_id: int, lead_id: int) -> None:
        self.create(
            db,
            student_id,
            "student",
            NotificationType.PRIVATE_LEAD_ACCEPTED,
            "Your tutor accepted your private request — contact is now visible",
            "Your tutor accepted your private request — contact is now visible.",
            data={"lead_id": lead_id},
        )

    def notify_private_lead_rejected(self, db: Session, student_id: int, lead_id: int) -> None:
        self.create(
            db,
            student_id,
            "student",
            NotificationType.PRIVATE_LEAD_REJECTED,
            "Your private request was declined by the tutor",
            "Your private request was declined by the tutor.",
            data={"lead_id": lead_id},
        )

    def notify_new_tutor_pending(self, db: Session, tutor_id: int) -> None:
        admins = db.query(Admin).all()
        for admin in admins:
            self.create(
                db,
                admin.admin_id,
                "admin",
                NotificationType.NEW_TUTOR_PENDING,
                "A new tutor is waiting for verification",
                "A new tutor is waiting for verification.",
                data={"tutor_id": tutor_id},
            )

    def notify_tutor_verified(self, db: Session, tutor_id: int) -> None:
        self.create(
            db,
            tutor_id,
            "tutor",
            NotificationType.TUTOR_VERIFIED,
            "Your account has been verified — you can now browse leads",
            "Your account has been verified — you can now browse leads.",
            data={"tutor_id": tutor_id},
        )

    def notify_tutor_verification_rejected(self, db: Session, tutor_id: int) -> None:
        self.create(
            db,
            tutor_id,
            "tutor",
            NotificationType.TUTOR_VERIFICATION_REJECTED,
            "Your verification was rejected — check the reason and resubmit",
            "Your verification was rejected — check the reason and resubmit.",
            data={"tutor_id": tutor_id},
        )


notification_service = NotificationService()

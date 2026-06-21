import asyncio
from typing import List

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.models.admins import Admin
from app.schemas.admins import AdminOut, CreateAdmin, UpdateAdminRequest
from app.models.tutors import Tutor
from app.schemas.enums import NotificationType
from app.schemas.notifications import CreateNotification
from app.schemas.tutors import TutorOut
from app.services import notification_service
from app.services.tutor_service import _tutor_to_out, get_tutor_by_id, hash_password as get_password_hash


def get_admin_by_email(db: Session, email: str) -> Admin | None:
    return db.scalar(select(Admin).where(Admin.email == email.lower()))


def get_admin_by_id(db: Session, admin_id: int) -> Admin | None:
    return db.get(Admin, admin_id)


def _admin_to_out(admin: Admin) -> AdminOut:
    return AdminOut.model_validate(admin)


def get_all_admins_out(db: Session) -> List[AdminOut]:
    admins = db.scalars(select(Admin)).all()
    return [_admin_to_out(admin) for admin in admins]


def get_admin_by_id_out(db: Session, admin_id: int) -> AdminOut | None:
    admin = get_admin_by_id(db, admin_id)
    if not admin:
        return None
    return _admin_to_out(admin)


def create_admin(db: Session, admin_data: CreateAdmin) -> AdminOut:
    existing = get_admin_by_email(db, admin_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Admin with email '{admin_data.email}' already exists",
        )

    admin = Admin(
        first_name=admin_data.first_name.strip(),
        last_name=admin_data.last_name.strip(),
        email=admin_data.email.lower(),
        password=get_password_hash(admin_data.password),
    )

    db.add(admin)
    try:
        db.commit()
        db.refresh(admin)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Admin with this email already exists",
        )

    return _admin_to_out(admin)


def update_admin(db: Session, admin_id: int, admin_data: UpdateAdminRequest) -> AdminOut:
    admin = get_admin_by_id(db, admin_id)
    if not admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")

    if admin_data.email is not None and admin_data.email.lower() != admin.email:
        existing = get_admin_by_email(db, admin_data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Admin with email '{admin_data.email}' already exists",
            )

    if admin_data.first_name is not None:
        admin.first_name = admin_data.first_name.strip()
    if admin_data.last_name is not None:
        admin.last_name = admin_data.last_name.strip()
    if admin_data.email is not None:
        admin.email = admin_data.email.lower()
    if admin_data.password is not None:
        admin.password = get_password_hash(admin_data.password)

    db.commit()
    db.refresh(admin)
    return _admin_to_out(admin)


def delete_admin(db: Session, admin_id: int) -> None:
    admin = get_admin_by_id(db, admin_id)
    if not admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")
    db.delete(admin)
    db.commit()


def _queue_notification(db: Session, data: CreateNotification) -> None:
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(notification_service.notify_user(db, data))
    except RuntimeError:
        asyncio.run(notification_service.notify_user(db, data))


def verify_tutor(db: Session, tutor_id: int, verified: bool) -> TutorOut:
    tutor = get_tutor_by_id(db, tutor_id)
    if not tutor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found")

    tutor.verified = verified
    db.commit()
    db.refresh(tutor)

    if verified:
        _queue_notification(
            db,
            CreateNotification(
                recipient_role="tutor",
                recipient_id=tutor.tutor_id,
                notification_type=NotificationType.TUTOR_VERIFIED,
                title="Your account has been verified",
                message="Your account has been verified — you can now browse leads and receive offers.",
                actor_role="admin",
                related_type="tutor",
                related_id=tutor.tutor_id,
            ),
        )

    return _tutor_to_out(tutor)

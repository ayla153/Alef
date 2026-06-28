import asyncio
from datetime import datetime, timezone
from typing import List

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.models.admins import Admin
from app.models.favorites import Favorite
from app.models.lead_applications import LeadApplication
from app.models.lead_targets import LeadTarget
from app.models.notifications import Notification
from app.models.post_requirements import PostRequirement
from app.models.reviews import Review
from app.models.students import Student
from app.models.tutors import Tutor
from app.schemas.admins import (
    AdminOut,
    AdminTutorReportOut,
    AdminTutorReviewOut,
    CreateAdmin,
    UpdateAdminRequest,
)
from app.schemas.enums import NotificationType
from app.schemas.notifications import CreateNotification
from app.schemas.tutors import TutorOut
from app.services import notification_service
from app.services.tutor_service import _get_average_rating, _tutor_to_out, hash_password as get_password_hash


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


def get_tutor_report(db: Session, tutor_id: int) -> AdminTutorReportOut:
    tutor = db.get(Tutor, tutor_id)
    if not tutor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found")

    offers_submitted_count = (
        db.scalar(
            select(func.count(LeadApplication.lead_application_id)).where(
                LeadApplication.tutor_id == tutor_id
            )
        )
        or 0
    )

    private_leads_received_count = (
        db.scalar(
            select(func.count(LeadTarget.lead_target_id)).where(
                LeadTarget.tutor_id == tutor_id
            )
        )
        or 0
    )

    favorites_count = (
        db.scalar(
            select(func.count(Favorite.favorite_id)).where(Favorite.tutor_id == tutor_id)
        )
        or 0
    )

    reviews = db.scalars(
        select(Review)
        .options(joinedload(Review.student))
        .where(Review.tutor_id == tutor_id)
        .order_by(Review.created_at.desc())
    ).all()

    review_rows: list[AdminTutorReviewOut] = []
    for review in reviews:
        student = review.student or db.get(Student, review.student_id)
        student_name = student.first_name.strip() if student else f"طالب #{review.student_id}"
        review_rows.append(
            AdminTutorReviewOut(
                review_id=review.review_id,
                student_name=student_name,
                number_of_stars=review.number_of_stars,
                comment=review.comment,
                created_at=review.created_at,
            )
        )

    activity_candidates: list = []

    latest_notification = db.scalar(
        select(func.max(Notification.created_at)).where(
            Notification.recipient_type == "tutor",
            Notification.recipient_id == tutor_id,
        )
    )
    if latest_notification is not None:
        activity_candidates.append(latest_notification)

    latest_offer = db.scalar(
        select(func.max(LeadApplication.created_at)).where(
            LeadApplication.tutor_id == tutor_id
        )
    )
    if latest_offer is not None:
        activity_candidates.append(latest_offer)

    latest_private_lead = db.scalar(
        select(func.max(PostRequirement.created_at))
        .join(LeadTarget, LeadTarget.post_requirements_id == PostRequirement.post_requirements_id)
        .where(LeadTarget.tutor_id == tutor_id)
    )
    if latest_private_lead is not None:
        activity_candidates.append(latest_private_lead)

    last_seen_at = max(activity_candidates) if activity_candidates else None

    return AdminTutorReportOut(
        tutor_id=tutor.tutor_id,
        tutor_name=f"{tutor.first_name} {tutor.last_name}".strip(),
        offers_submitted_count=offers_submitted_count,
        private_leads_received_count=private_leads_received_count,
        favorites_count=favorites_count,
        average_rating=_get_average_rating(db, tutor_id),
        reviews_count=len(review_rows),
        reviews=review_rows,
        last_seen_at=last_seen_at,
        registered_at=tutor.registered_at,
    )


def ban_tutor(db: Session, tutor_id: int) -> TutorOut:
    tutor = db.get(Tutor, tutor_id)
    if not tutor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found")
    if tutor.is_banned:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Tutor account is already banned.",
        )

    tutor.is_banned = True
    tutor.banned_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(tutor)

    notification_service.notify_tutor_verification_rejected(db, tutor.tutor_id)
    return _tutor_to_out(tutor)


def restore_tutor(db: Session, tutor_id: int) -> TutorOut:
    tutor = db.get(Tutor, tutor_id)
    if not tutor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found")
    if not tutor.is_banned:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Tutor account is not banned.",
        )

    tutor.is_banned = False
    tutor.banned_at = None
    db.commit()
    db.refresh(tutor)

    if tutor.verified:
        notification_service.notify_tutor_verified(db, tutor.tutor_id)

    return _tutor_to_out(tutor)


def verify_tutor(db: Session, tutor_id: int, verified: bool) -> TutorOut:
    tutor = db.get(Tutor, tutor_id)
    if not tutor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found")
    if tutor.is_banned:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot verify a banned tutor account.",
        )
    
    tutor.verified = verified
    db.commit()
    db.refresh(tutor)

    if verified:
        notification_service.notify_tutor_verified(db, tutor.tutor_id)
    else:
        notification_service.notify_tutor_verification_rejected(db, tutor.tutor_id)
    return _tutor_to_out(tutor)

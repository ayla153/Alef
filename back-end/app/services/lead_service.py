import asyncio
from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.models.lead_applications import LeadApplication
from app.models.lead_targets import LeadTarget
from app.models.levels import Level
from app.models.post_requirements import PostRequirement
from app.models.students import Student
from app.models.subjects import Subject
from app.models.tutor_subjects import TutorSubject
from app.models.tutors import Tutor
from app.services import notification_service
from app.schemas.enums import LeadApplicationStatusEnum, LeadStatusEnum, NotificationType
from app.schemas.notifications import CreateNotification
from app.schemas.leads import (
    AcceptContactIn,
    ClosePrivateLeadIn,
    CreatePrivateLeadIn,
    CreatePublicLeadIn,
    LeadApplicationOut,
    LeadBrowseCardOut,
    LeadOut,
    OfferIn,
    TutorPublicOfferOut,
    TutorPublicOfferOutcome,
)

MAX_PUBLIC_PENDING_OFFERS = 5
LEAD_AUTO_CLOSE_DAYS = 10
LEAD_DEFAULT_EXPIRY_DAYS = 30
SUBJECT_COOLDOWN_DAYS = 14
MAX_ACTIVE_PRIVATE_LEADS = 1  # private lead (lead_targets row): max one open per student (v1)
OFFERS_PER_TUTOR_PER_LEAD = 1
MAX_PRIVATE_TARGETS_PER_LEAD = 1  # private lead: exactly one target tutor per lead

CLOSED_LEAD_STATUSES = frozenset(
    {
        LeadStatusEnum.CLOSED_SHORTLIST,
        LeadStatusEnum.CLOSED_EMPTY,
        LeadStatusEnum.CLOSED_MATCHED,
        LeadStatusEnum.CLOSED_EXPIRED,
    }
)


def get_lead_by_id(db: Session, lead_id: int) -> PostRequirement | None:
    return (
        db.query(PostRequirement)
        .options(
            joinedload(PostRequirement.student),
            joinedload(PostRequirement.lead_target),
            joinedload(PostRequirement.lead_applications).joinedload(LeadApplication.tutor),
        )
        .filter(PostRequirement.post_requirements_id == lead_id)
        .first()
    )


def count_pending_applications(db: Session, lead_id: int) -> int:
    return (
        db.query(func.count(LeadApplication.lead_application_id))
        .filter(
            LeadApplication.post_requirements_id == lead_id,
            LeadApplication.application_status == LeadApplicationStatusEnum.PENDING,
        )
        .scalar()
        or 0
    )


def sync_accepting_applications(db: Session, lead: PostRequirement) -> None:
    if lead.lead_status != LeadStatusEnum.OPEN or not lead.is_public:
        return
    pending = count_pending_applications(db, lead.post_requirements_id)
    lead.accepting_applications = pending < lead.max_applications


def _queue_notification(db: Session, data: CreateNotification) -> None:
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(notification_service.notify_user(db, data))
    except RuntimeError:
        asyncio.run(notification_service.notify_user(db, data))


def assert_lead_is_open(lead: PostRequirement) -> None:
    if lead.lead_status != LeadStatusEnum.OPEN:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Lead is not open (status={lead.lead_status.value}).",
        )


def assert_no_reopen(lead: PostRequirement, target_status: LeadStatusEnum) -> None:
    if lead.lead_status in CLOSED_LEAD_STATUSES and target_status == LeadStatusEnum.OPEN:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Closed leads cannot be reopened.",
        )


def check_public_subject_cooldown(db: Session, student_id: int, subject_id: int) -> None:
    cutoff = datetime.utcnow() - timedelta(days=SUBJECT_COOLDOWN_DAYS)
    recent_public = (
        db.query(PostRequirement.post_requirements_id)
        .filter(
            PostRequirement.student_id == student_id,
            PostRequirement.subject_id == subject_id,
            PostRequirement.is_public.is_(True),
            PostRequirement.created_at >= cutoff,
        )
        .first()
    )
    if recent_public:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"A public lead for this subject was created within the last "
                f"{SUBJECT_COOLDOWN_DAYS} days."
            ),
        )


def count_open_private_leads(db: Session, student_id: int) -> int:
    """Count open leads that have a lead_targets row (private leads only)."""
    return (
        db.query(func.count(PostRequirement.post_requirements_id))
        .join(LeadTarget, LeadTarget.post_requirements_id == PostRequirement.post_requirements_id)
        .filter(
            PostRequirement.student_id == student_id,
            PostRequirement.lead_status == LeadStatusEnum.OPEN,
        )
        .scalar()
        or 0
    )


def check_max_active_private_leads(db: Session, student_id: int) -> None:
    if count_open_private_leads(db, student_id) >= MAX_ACTIVE_PRIVATE_LEADS:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Student already has {MAX_ACTIVE_PRIVATE_LEADS} open private lead. "
                "Close it before creating another."
            ),
        )


def _application_phones_revealed(app: LeadApplication, lead: PostRequirement) -> bool:
    """Whether this offer row may show the tutor phone to the student."""
    if app.application_status == LeadApplicationStatusEnum.REJECTED:
        return False
    if lead.lead_status == LeadStatusEnum.CLOSED_SHORTLIST:
        return app.application_status == LeadApplicationStatusEnum.PENDING
    if lead.lead_status == LeadStatusEnum.CLOSED_MATCHED:
        return app.contact_revealed_at is not None
    if lead.lead_status == LeadStatusEnum.CLOSED_EXPIRED:
        return (
            app.application_status == LeadApplicationStatusEnum.PENDING
            or app.contact_revealed_at is not None
        )
    return app.contact_revealed_at is not None


def _student_phone_visible(lead: PostRequirement) -> bool:
    """Whether the student may see tutor phones (and their own on shared views)."""
    if lead.lead_status in {
        LeadStatusEnum.CLOSED_SHORTLIST,
        LeadStatusEnum.CLOSED_MATCHED,
    }:
        return True
    if lead.lead_status == LeadStatusEnum.CLOSED_EXPIRED:
        return any(_application_phones_revealed(app, lead) for app in lead.lead_applications)
    return any(app.contact_revealed_at is not None for app in lead.lead_applications)


def _application_to_out(app: LeadApplication, lead: PostRequirement) -> LeadApplicationOut:
    tutor = app.tutor
    show_phone = _application_phones_revealed(app, lead)
    return LeadApplicationOut(
        lead_application_id=app.lead_application_id,
        tutor_id=app.tutor_id,
        proposed_fee=app.proposed_fee,
        first_session_note=app.first_session_note,
        message=app.message,
        application_status=app.application_status,
        contact_revealed_at=app.contact_revealed_at,
        created_at=app.created_at,
        tutor_first_name=tutor.first_name if tutor else None,
        tutor_phone_number=tutor.phone_number if show_phone and tutor else None,
    )


def lead_to_out(lead: PostRequirement) -> LeadOut:
    pending = sum(
        1 for app in lead.lead_applications if app.application_status == LeadApplicationStatusEnum.PENDING
    )
    student_phone = (
        lead.student.phone_number
        if _student_phone_visible(lead) and lead.student
        else None
    )
    return LeadOut(
        post_requirements_id=lead.post_requirements_id,
        title=lead.title,
        description=lead.description,
        foundation_tution=lead.foundation_tution,
        tution_type=lead.tution_type,
        expected_fee=lead.expected_fee,
        created_at=lead.created_at,
        expired_at=lead.expired_at,
        preferred_gender=lead.preferred_gender,
        student_id=lead.student_id,
        subject_id=lead.subject_id,
        level_id=lead.level_id,
        lead_status=lead.lead_status,
        is_public=lead.is_public,
        accepting_applications=lead.accepting_applications,
        closed_at=lead.closed_at,
        max_applications=lead.max_applications,
        pending_offer_count=pending,
        target_tutor_id=lead.lead_target.tutor_id if lead.lead_target else None,
        student_phone_number=student_phone,
        applications=[
            _application_to_out(app, lead)
            for app in sorted(lead.lead_applications, key=lambda a: a.created_at)
        ],
    )


def _tutor_public_offer_outcome(
    app: LeadApplication,
    lead: PostRequirement,
) -> TutorPublicOfferOutcome:
    if app.application_status == LeadApplicationStatusEnum.REJECTED:
        return TutorPublicOfferOutcome.REJECTED
    if app.contact_revealed_at is not None:
        return TutorPublicOfferOutcome.CONTACT_SHARED
    if lead.lead_status == LeadStatusEnum.CLOSED_EMPTY:
        return TutorPublicOfferOutcome.LEAD_CLOSED_EMPTY
    if lead.lead_status == LeadStatusEnum.CLOSED_EXPIRED:
        if app.application_status == LeadApplicationStatusEnum.PENDING:
            return TutorPublicOfferOutcome.CONTACT_SHARED
        return TutorPublicOfferOutcome.LEAD_CLOSED_EXPIRED
    return TutorPublicOfferOutcome.PENDING


def application_to_tutor_public_offer_out(
    app: LeadApplication,
    lead: PostRequirement,
) -> TutorPublicOfferOut:
    outcome = _tutor_public_offer_outcome(app, lead)
    student_phone = None
    if outcome == TutorPublicOfferOutcome.CONTACT_SHARED and lead.student:
        student_phone = lead.student.phone_number
    return TutorPublicOfferOut(
        lead_application_id=app.lead_application_id,
        post_requirements_id=lead.post_requirements_id,
        proposed_fee=app.proposed_fee,
        first_session_note=app.first_session_note,
        message=app.message,
        application_status=app.application_status,
        offer_created_at=app.created_at,
        contact_revealed_at=app.contact_revealed_at,
        lead_title=lead.title,
        lead_status=lead.lead_status,
        lead_closed_at=lead.closed_at,
        subject_id=lead.subject_id,
        level_id=lead.level_id,
        outcome=outcome,
        student_phone_number=student_phone,
    )


def list_tutor_public_offers(db: Session, tutor: Tutor) -> list[TutorPublicOfferOut]:
    """Public marketplace offers this tutor submitted (excludes private inbox leads)."""
    applications = (
        db.query(LeadApplication)
        .join(PostRequirement, LeadApplication.post_requirements_id == PostRequirement.post_requirements_id)
        .outerjoin(LeadTarget, LeadTarget.post_requirements_id == PostRequirement.post_requirements_id)
        .options(
            joinedload(LeadApplication.lead).joinedload(PostRequirement.student),
        )
        .filter(
            LeadApplication.tutor_id == tutor.tutor_id,
            LeadTarget.lead_target_id.is_(None),
            PostRequirement.is_public.is_(True),
        )
        .order_by(LeadApplication.created_at.desc())
        .all()
    )
    return [
        application_to_tutor_public_offer_out(app, app.lead)
        for app in applications
        if app.lead is not None
    ]


def browse_public_leads(db: Session, tutor: Tutor) -> list[LeadBrowseCardOut]:
    """Open public leads accepting offers; tutor must teach the lead subject (anonymous cards)."""
    tutor_subject_ids = {
        ts.subject_id
        for ts in db.query(TutorSubject)
        .filter(TutorSubject.tutor_id == tutor.tutor_id)
        .all()
    }
    if not tutor_subject_ids:
        return []

    leads = (
        db.query(PostRequirement)
        .options(joinedload(PostRequirement.lead_applications))
        .filter(
            PostRequirement.is_public.is_(True),
            PostRequirement.lead_status == LeadStatusEnum.OPEN,
            PostRequirement.accepting_applications.is_(True),
            PostRequirement.subject_id.in_(tutor_subject_ids),
        )
        .order_by(PostRequirement.created_at.desc())
        .all()
    )
    return [lead_to_browse_card_out(lead) for lead in leads]


def submit_offer(
    db: Session,
    lead_id: int,
    tutor: Tutor,
    data: OfferIn,
) -> LeadApplicationOut:
    lead = get_lead_by_id(db, lead_id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found.")

    assert_lead_is_open(lead)
    if not lead.is_public:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Offers apply to public leads only.",
        )
    if not lead.accepting_applications:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Application slots are full for this lead.",
        )

    teaches_subject = (
        db.query(TutorSubject.tutor_subject_id)
        .filter(
            TutorSubject.tutor_id == tutor.tutor_id,
            TutorSubject.subject_id == lead.subject_id,
        )
        .first()
    )
    if teaches_subject is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not teach the subject for this lead.",
        )

    existing = (
        db.query(LeadApplication)
        .filter(
            LeadApplication.post_requirements_id == lead_id,
            LeadApplication.tutor_id == tutor.tutor_id,
        )
        .first()
    )
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already submitted an offer for this lead.",
        )

    pending = count_pending_applications(db, lead_id)
    if pending >= lead.max_applications:
        lead.accepting_applications = False
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Application slots are full for this lead.",
        )

    now = datetime.utcnow()
    application = LeadApplication(
        proposed_fee=data.proposed_fee,
        first_session_note=data.first_session_note.strip(),
        message=data.message.strip(),
        application_status=LeadApplicationStatusEnum.PENDING,
        created_at=now,
        post_requirements_id=lead_id,
        tutor_id=tutor.tutor_id,
    )
    db.add(application)
    db.flush()
    sync_accepting_applications(db, lead)
    db.commit()
    db.refresh(application)
    application.tutor = tutor

    if lead.student_id:
        _queue_notification(
            db,
            CreateNotification(
                recipient_role="student",
                recipient_id=lead.student_id,
                notification_type=NotificationType.NEW_OFFER_RECEIVED,
                title="New offer received",
                message=f"A tutor sent you an offer on your lead '{lead.title}'.",
                actor_role="tutor",
                actor_id=tutor.tutor_id,
                related_type="lead",
                related_id=lead_id,
            ),
        )

    pending_count = count_pending_applications(db, lead_id)
    if pending_count >= lead.max_applications:
        _queue_notification(
            db,
            CreateNotification(
                recipient_role="student",
                recipient_id=lead.student_id,
                notification_type=NotificationType.PUBLIC_LEAD_SLOTS_FULL,
                title="Lead slots are full",
                message="Your lead has 5 offers waiting, time to review them.",
                actor_role="tutor",
                actor_id=tutor.tutor_id,
                related_type="lead",
                related_id=lead_id,
            ),
        )

    return _application_to_out(application, lead)


def lead_to_browse_card_out(lead: PostRequirement) -> LeadBrowseCardOut:
    pending = sum(
        1 for app in lead.lead_applications if app.application_status == LeadApplicationStatusEnum.PENDING
    )
    return LeadBrowseCardOut(
        post_requirements_id=lead.post_requirements_id,
        title=lead.title,
        description=lead.description,
        foundation_tution=lead.foundation_tution,
        tution_type=lead.tution_type,
        expected_fee=lead.expected_fee,
        created_at=lead.created_at,
        preferred_gender=lead.preferred_gender,
        subject_id=lead.subject_id,
        level_id=lead.level_id,
        accepting_applications=lead.accepting_applications,
        pending_offer_count=pending,
        max_applications=lead.max_applications,
    )


def assert_lead_owner(lead: PostRequirement, student: Student) -> None:
    if lead.student_id != student.student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not own this lead.",
        )


def get_lead_for_student(db: Session, lead_id: int, student: Student) -> PostRequirement:
    lead = get_lead_by_id(db, lead_id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found.")
    assert_lead_owner(lead, student)
    return lead


def list_leads_for_student(db: Session, student_id: int) -> list[LeadOut]:
    leads = (
        db.query(PostRequirement)
        .options(
            joinedload(PostRequirement.student),
            joinedload(PostRequirement.lead_target),
            joinedload(PostRequirement.lead_applications).joinedload(LeadApplication.tutor),
        )
        .filter(PostRequirement.student_id == student_id)
        .order_by(PostRequirement.created_at.desc())
        .all()
    )
    return [lead_to_out(lead) for lead in leads]


def create_public_lead(db: Session, student: Student, data: CreatePublicLeadIn) -> LeadOut:
    if db.get(Subject, data.subject_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found.")
    if db.get(Level, data.level_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Level not found.")

    check_public_subject_cooldown(db, student.student_id, data.subject_id)

    now = datetime.utcnow()
    lead = PostRequirement(
        title=data.title.strip(),
        description=data.description.strip(),
        foundation_tution=data.foundation_tution,
        tution_type=data.tution_type,
        expected_fee=data.expected_fee,
        created_at=now,
        expired_at=now + timedelta(days=LEAD_DEFAULT_EXPIRY_DAYS),
        preferred_gender=data.preferred_gender,
        student_id=student.student_id,
        subject_id=data.subject_id,
        level_id=data.level_id,
        lead_status=LeadStatusEnum.OPEN,
        is_public=True,
        accepting_applications=True,
        max_applications=MAX_PUBLIC_PENDING_OFFERS,
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    refreshed = get_lead_by_id(db, lead.post_requirements_id)
    assert refreshed is not None
    return lead_to_out(refreshed)


def reject_offer(
    db: Session,
    lead: PostRequirement,
    offer_id: int,
    student: Student,
) -> LeadOut:
    assert_lead_owner(lead, student)
    assert_lead_is_open(lead)
    if lead.lead_target is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reject offer applies to public leads only.",
        )

    application = next(
        (app for app in lead.lead_applications if app.lead_application_id == offer_id),
        None,
    )
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found.")
    if application.application_status != LeadApplicationStatusEnum.PENDING:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only pending offers can be rejected.",
        )

    application.application_status = LeadApplicationStatusEnum.REJECTED
    sync_accepting_applications(db, lead)
    db.commit()
    refreshed = get_lead_by_id(db, lead.post_requirements_id)
    assert refreshed is not None
    return lead_to_out(refreshed)


def create_private_lead(db: Session, student: Student, data: CreatePrivateLeadIn) -> LeadOut:
    if db.get(Subject, data.subject_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found.")
    if db.get(Level, data.level_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Level not found.")
    tutor = db.get(Tutor, data.target_tutor_id)
    if tutor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found.")

    check_max_active_private_leads(db, student.student_id)

    now = datetime.utcnow()
    is_public = data.publish_public_copy
    lead = PostRequirement(
        title=data.title.strip(),
        description=data.description.strip(),
        foundation_tution=data.foundation_tution,
        tution_type=data.tution_type,
        expected_fee=data.expected_fee,
        created_at=now,
        expired_at=now + timedelta(days=LEAD_DEFAULT_EXPIRY_DAYS),
        preferred_gender=data.preferred_gender,
        student_id=student.student_id,
        subject_id=data.subject_id,
        level_id=data.level_id,
        lead_status=LeadStatusEnum.OPEN,
        is_public=is_public,
        accepting_applications=is_public,
        max_applications=MAX_PUBLIC_PENDING_OFFERS,
    )
    db.add(lead)
    db.flush()

    db.add(
        LeadTarget(
            post_requirements_id=lead.post_requirements_id,
            tutor_id=data.target_tutor_id,
        )
    )
    db.commit()
    refreshed = get_lead_by_id(db, lead.post_requirements_id)
    assert refreshed is not None
    return lead_to_out(refreshed)


def list_tutor_private_inbox(db: Session, tutor: Tutor) -> list[LeadOut]:
    leads = (
        db.query(PostRequirement)
        .join(LeadTarget, LeadTarget.post_requirements_id == PostRequirement.post_requirements_id)
        .options(
            joinedload(PostRequirement.student),
            joinedload(PostRequirement.lead_target),
            joinedload(PostRequirement.lead_applications).joinedload(LeadApplication.tutor),
        )
        .filter(
            LeadTarget.tutor_id == tutor.tutor_id,
            or_(
                PostRequirement.lead_status == LeadStatusEnum.OPEN,
                PostRequirement.lead_status == LeadStatusEnum.CLOSED_MATCHED,
            ),
        )
        .order_by(PostRequirement.created_at.desc())
        .all()
    )
    return [lead_to_out(lead) for lead in leads]


def accept_private_contact(
    db: Session,
    lead_id: int,
    tutor: Tutor,
    data: AcceptContactIn,
) -> LeadOut:
    lead = get_lead_by_id(db, lead_id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found.")
    assert_lead_is_open(lead)
    if lead.lead_target is None or lead.lead_target.tutor_id != tutor.tutor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the targeted tutor may accept this private lead.",
        )

    existing = (
        db.query(LeadApplication)
        .filter(
            LeadApplication.post_requirements_id == lead_id,
            LeadApplication.tutor_id == tutor.tutor_id,
        )
        .first()
    )
    if existing is not None and existing.contact_revealed_at is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Contact already accepted for this lead.",
        )

    now = datetime.utcnow()
    lead.lead_status = LeadStatusEnum.CLOSED_MATCHED
    lead.closed_at = now
    lead.accepting_applications = False
    proposed_fee = data.proposed_fee if data.proposed_fee is not None else lead.expected_fee
    first_session_note = (data.first_session_note or "Flexible").strip()
    message = (data.message or "أوافق على التواصل").strip()

    if existing is not None:
        existing.proposed_fee = proposed_fee
        existing.first_session_note = first_session_note
        existing.message = message
        existing.application_status = LeadApplicationStatusEnum.PENDING
        existing.contact_revealed_at = now
        application = existing
    else:
        application = LeadApplication(
            proposed_fee=proposed_fee,
            first_session_note=first_session_note,
            message=message,
            application_status=LeadApplicationStatusEnum.PENDING,
            contact_revealed_at=now,
            created_at=now,
            post_requirements_id=lead_id,
            tutor_id=tutor.tutor_id,
        )
        db.add(application)

    db.commit()
    refreshed = get_lead_by_id(db, lead_id)
    assert refreshed is not None
    return lead_to_out(refreshed)


def close_lead_private(
    db: Session,
    lead: PostRequirement,
    student: Student,
    body: ClosePrivateLeadIn,
) -> LeadOut:
    assert_lead_owner(lead, student)
    assert_lead_is_open(lead)
    if lead.lead_target is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Use the public close flow for public-only leads.",
        )

    now = datetime.utcnow()
    if body.matched:
        lead.lead_status = LeadStatusEnum.CLOSED_MATCHED
    else:
        lead.lead_status = LeadStatusEnum.CLOSED_EMPTY
        for app in lead.lead_applications:
            app.contact_revealed_at = None

    lead.closed_at = now
    lead.accepting_applications = False
    db.commit()
    refreshed = get_lead_by_id(db, lead.post_requirements_id)
    assert refreshed is not None
    return lead_to_out(refreshed)


def close_lead_for_student(
    db: Session,
    lead: PostRequirement,
    student: Student,
    private_close: ClosePrivateLeadIn | None = None,
) -> LeadOut:
    assert_lead_owner(lead, student)
    if lead.lead_target is not None:
        if private_close is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Private leads require body: { \"matched\": true|false }.",
            )
        return close_lead_private(db, lead, student, private_close)
    return close_lead_public(db, lead)


def close_lead_public_for_student(
    db: Session,
    lead: PostRequirement,
    student: Student,
) -> LeadOut:
    return close_lead_for_student(db, lead, student)


def close_lead_public(db: Session, lead: PostRequirement) -> LeadOut:
    assert_lead_is_open(lead)
    # Private leads are identified by lead_target; they use close_lead_private (SCRUM-62), not shortlist close.
    if lead.lead_target is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Use the private close flow for private leads.",
        )

    now = datetime.utcnow()
    pending_apps = [
        app
        for app in lead.lead_applications
        if app.application_status == LeadApplicationStatusEnum.PENDING
    ]

    if pending_apps:
        lead.lead_status = LeadStatusEnum.CLOSED_SHORTLIST
        for app in pending_apps:
            app.contact_revealed_at = now
    else:
        lead.lead_status = LeadStatusEnum.CLOSED_EMPTY

    lead.closed_at = now
    lead.accepting_applications = False
    db.commit()
    refreshed = get_lead_by_id(db, lead.post_requirements_id)
    assert refreshed is not None

    if refreshed.lead_status == LeadStatusEnum.CLOSED_SHORTLIST:
        for app in refreshed.lead_applications:
            if app.application_status == LeadApplicationStatusEnum.PENDING and app.tutor_id is not None:
                _queue_notification(
                    db,
                    CreateNotification(
                        recipient_role="tutor",
                        recipient_id=app.tutor_id,
                        notification_type=NotificationType.OFFER_ACCEPTED,
                        title="Your offer was accepted",
                        message=f"Your offer on '{refreshed.title}' was accepted — the student's contact is now visible.",
                        actor_role="student",
                        actor_id=refreshed.student_id,
                        related_type="lead",
                        related_id=refreshed.post_requirements_id,
                    ),
                )

    return lead_to_out(refreshed)


def expire_due_leads(db: Session) -> int:
    """Auto-close open leads past LEAD_AUTO_CLOSE_DAYS (SCRUM-63).

    Pending public offers at expiry behave like shortlist close: mutual phone reveal
    so students/tutors who return later still see numbers on closed_expired leads.
    """
    now = datetime.utcnow()
    cutoff = now - timedelta(days=LEAD_AUTO_CLOSE_DAYS)
    open_leads = (
        db.query(PostRequirement)
        .options(joinedload(PostRequirement.lead_applications))
        .filter(
            PostRequirement.lead_status == LeadStatusEnum.OPEN,
            PostRequirement.created_at <= cutoff,
        )
        .all()
    )
    expired_count = 0
    for lead in open_leads:
        pending_apps = [
            app
            for app in lead.lead_applications
            if app.application_status == LeadApplicationStatusEnum.PENDING
        ]
        if pending_apps and lead.lead_target is None:
            for app in pending_apps:
                if app.contact_revealed_at is None:
                    app.contact_revealed_at = now
        lead.lead_status = LeadStatusEnum.CLOSED_EXPIRED
        lead.closed_at = now
        lead.accepting_applications = False
        expired_count += 1
    if expired_count:
        db.commit()
    return expired_count

from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.models.lead_applications import LeadApplication
from app.models.lead_targets import LeadTarget
from app.models.post_requirements import PostRequirement
from app.schemas.enums import LeadApplicationStatusEnum, LeadStatusEnum
from app.schemas.leads import LeadApplicationOut, LeadBrowseCardOut, LeadOut

MAX_PUBLIC_PENDING_OFFERS = 5
LEAD_AUTO_CLOSE_DAYS = 10
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


def _phones_revealed_for_lead(lead: PostRequirement) -> bool:
    if lead.lead_status == LeadStatusEnum.CLOSED_SHORTLIST:
        return True
    if lead.lead_status == LeadStatusEnum.CLOSED_MATCHED:  # private lead: student closed after tutor accept
        return True
    return any(app.contact_revealed_at is not None for app in lead.lead_applications)


def _application_to_out(app: LeadApplication, phones_revealed: bool) -> LeadApplicationOut:
    tutor = app.tutor
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
        tutor_phone_number=tutor.phone_number if phones_revealed and tutor else None,
    )


def lead_to_out(lead: PostRequirement) -> LeadOut:
    phones_revealed = _phones_revealed_for_lead(lead)
    pending = sum(
        1 for app in lead.lead_applications if app.application_status == LeadApplicationStatusEnum.PENDING
    )
    student_phone = lead.student.phone_number if phones_revealed and lead.student else None
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
            _application_to_out(app, phones_revealed)
            for app in sorted(lead.lead_applications, key=lambda a: a.created_at)
        ],
    )


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
    return lead_to_out(refreshed)

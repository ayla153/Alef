from datetime import datetime, timedelta
from pathlib import Path
import re
import shutil

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import or_, and_, func
from sqlalchemy.orm import Session, joinedload, selectinload

from app.core.security import get_password_hash
from app.models.reviews import Review
from app.models.lead_applications import LeadApplication
from app.models.lead_targets import LeadTarget
from app.models.notifications import Notification
from app.models.post_requirements import PostRequirement
from app.models.tutor_subjects import TutorSubject
from app.models.tutors import Tutor
from app.schemas.tutors import (
    CreateTutor,
    TutorOut,
    UpdateTutorRequest,
    WeeklyActivityPoint,
    RecentActivityItem,
    RecentActivityOut,
    TutorRecentRequestOut,
    TutorRecentRequestsOut,
    TutorStatsOut,
    TopTutorRankOut,
    TopTutorsReportOut,
)

from app.schemas.enums import LeadApplicationStatusEnum, LeadStatusEnum, NotificationType


def hash_password(plain_password: str) -> str:
    return get_password_hash(plain_password)


def get_tutor_by_email(db: Session, email: str) -> Tutor | None:
    return db.query(Tutor).filter(Tutor.email == email).first()


def get_tutor_by_id(db: Session, tutor_id: int) -> Tutor | None:
    return (
        db.query(Tutor)
        .options(
            joinedload(Tutor.reviews),
            joinedload(Tutor.address),
            joinedload(Tutor.tutor_subjects).joinedload(TutorSubject.subject),
        )
        .filter(Tutor.tutor_id == tutor_id)
        .first()
    )


def _tutor_to_out(tutor: Tutor) -> TutorOut:
    return TutorOut.model_validate(tutor, from_attributes=True)


def get_tutor_by_id_out(db: Session, tutor_id: int, *, allow_banned: bool = False) -> TutorOut | None:
    tutor = get_tutor_by_id(db, tutor_id)
    if not tutor:
        return None
    if tutor.is_banned and not allow_banned:
        return None
    return _tutor_to_out(tutor)


def assert_tutor_active(tutor: Tutor) -> None:
    if tutor.is_banned:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="حساب المعلّم محظور ولا يمكنه استخدام المنصة.",
        )


def assert_tutor_marketplace_visible(tutor: Tutor) -> None:
    if tutor.is_banned or not tutor.verified:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tutor not found",
        )


def create_tutor(db: Session, tutor_data: CreateTutor) -> TutorOut:
    existing = get_tutor_by_email(db, tutor_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Tutor with email '{tutor_data.email}' already exists",
        )

    tutor_obj = Tutor(
        first_name=tutor_data.first_name.strip(),
        last_name=tutor_data.last_name.strip(),
        email=tutor_data.email.lower(),
        password=hash_password(tutor_data.password),
        date_birth=tutor_data.date_birth,
        phone_number=tutor_data.phone_number,
        bio=tutor_data.bio,
        total_experience_years=tutor_data.total_experience_years,
        registered_at=datetime.utcnow(),
        tution_type=tutor_data.tution_type,
        gender=tutor_data.gender,
        verified=False,
    )

    db.add(tutor_obj)
    db.commit()
    db.refresh(tutor_obj)

    return _tutor_to_out(tutor_obj)


def get_all_tutors(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    subject_ids: list[int] | None = None,
    stages: list[str] | None = None,
    *,
    include_banned: bool = False,
) -> list[TutorOut]:
    valid_stages = {"foundation", "elementory_stage", "middle_stage", "high_stage"}
    normalized_stages = [stage.strip().lower() for stage in (stages or []) if stage.strip()]
    invalid_stages = [stage for stage in normalized_stages if stage not in valid_stages]
    if invalid_stages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid stages: {', '.join(invalid_stages)}",
        )

    query = (
        db.query(Tutor)
        .options(
            selectinload(Tutor.reviews),
            selectinload(Tutor.address),
            selectinload(Tutor.tutor_subjects).selectinload(TutorSubject.subject),
        )
    )

    if not include_banned:
        query = query.filter(Tutor.is_banned.is_(False))

    if subject_ids:
        query = query.join(Tutor.tutor_subjects).filter(TutorSubject.subject_id.in_(subject_ids))

    if normalized_stages:
        stage_filters = []
        if "foundation" in normalized_stages:
            stage_filters.append(TutorSubject.foundation.is_(True))
        if "elementory_stage" in normalized_stages:
            stage_filters.append(TutorSubject.elementory_stage.is_(True))
        if "middle_stage" in normalized_stages:
            stage_filters.append(TutorSubject.middle_stage.is_(True))
        if "high_stage" in normalized_stages:
            stage_filters.append(TutorSubject.high_stage.is_(True))
        query = query.join(Tutor.tutor_subjects).filter(or_(*stage_filters))

    tutors = (
        query.distinct(Tutor.tutor_id)
        .order_by(Tutor.tutor_id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return [_tutor_to_out(tutor) for tutor in tutors]


def _sanitize_filename_base(value: str) -> str:
    sanitized = re.sub(r"[^A-Za-z0-9_-]", "_", value.strip().lower())
    sanitized = re.sub(r"_+", "_", sanitized)
    return sanitized.strip("_") or "tutor"


def _delete_existing_file(file_path: str | None) -> None:
    if not file_path:
        return
    existing = Path(file_path)
    if existing.exists() and existing.is_file():
        try:
            existing.unlink()
        except OSError:
            pass


def _save_upload_file(upload_file: UploadFile, folder: str, dest_filename: str, allowed_ext: set[str]) -> str:
    filename = Path(upload_file.filename).name
    extension = Path(filename).suffix.lower()
    if extension not in allowed_ext:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported media type. Allowed: {', '.join(sorted(allowed_ext))}",
        )

    target_dir = Path(folder)
    target_dir.mkdir(parents=True, exist_ok=True)
    dest_file = target_dir / f"{dest_filename}{extension}"
    with dest_file.open("wb") as buffer:
        upload_file.file.seek(0)
        shutil.copyfileobj(upload_file.file, buffer)
    return str(dest_file).replace("\\", "/")


def _is_delete_upload_request(file: UploadFile | str | None) -> bool:
    return file is None or (isinstance(file, str) and not file.strip()) or (
        hasattr(file, "filename") and not getattr(file, "filename", "").strip()
    )


def _ensure_upload_file(file: UploadFile | str | None) -> UploadFile:
    if hasattr(file, "filename") and hasattr(file, "file"):
        return file
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid upload request. Provide a file upload.")


def update_tutor_photo(db: Session, tutor_id: int, file: UploadFile | str | None) -> TutorOut:
    tutor = get_tutor_by_id(db, tutor_id)
    if not tutor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found")
    if _is_delete_upload_request(file):
        _delete_existing_file(tutor.tutor_photo)
        tutor.tutor_photo = None
    else:
        upload_file = _ensure_upload_file(file)
        _delete_existing_file(tutor.tutor_photo)
        base_name = _sanitize_filename_base(f"{tutor.first_name}_{tutor.last_name}")
        tutor.tutor_photo = _save_upload_file(upload_file, "uploads/tutors/photos", base_name, {".jpg", ".jpeg", ".png", ".gif"})
    db.commit()
    db.refresh(tutor)
    return _tutor_to_out(tutor)


def update_tutor_video(db: Session, tutor_id: int, file: UploadFile | str | None) -> TutorOut:
    tutor = get_tutor_by_id(db, tutor_id)
    if not tutor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found")
    if _is_delete_upload_request(file):
        _delete_existing_file(tutor.tutor_video)
        tutor.tutor_video = None
    else:
        upload_file = _ensure_upload_file(file)
        _delete_existing_file(tutor.tutor_video)
        base_name = _sanitize_filename_base(f"{tutor.first_name}_{tutor.last_name}")
        tutor.tutor_video = _save_upload_file(upload_file, "uploads/tutors/videos", base_name, {".mp4", ".mov", ".webm"})
    db.commit()
    db.refresh(tutor)
    return _tutor_to_out(tutor)


def update_tutor(db: Session, tutor_id: int, tutor_data: UpdateTutorRequest) -> TutorOut:
    tutor = get_tutor_by_id(db, tutor_id)
    if not tutor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found")

    if tutor_data.email and tutor_data.email.lower() != tutor.email:
        existing = get_tutor_by_email(db, tutor_data.email.lower())
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Tutor with email '{tutor_data.email}' already exists",
            )

    if tutor_data.first_name is not None:
        tutor.first_name = tutor_data.first_name.strip()
    if tutor_data.last_name is not None:
        tutor.last_name = tutor_data.last_name.strip()
    if tutor_data.email is not None:
        tutor.email = tutor_data.email.lower()
    if tutor_data.password is not None:
        tutor.password = hash_password(tutor_data.password)
    if tutor_data.date_birth is not None:
        tutor.date_birth = tutor_data.date_birth
    if tutor_data.phone_number is not None:
        tutor.phone_number = tutor_data.phone_number
    if tutor_data.bio is not None:
        tutor.bio = tutor_data.bio
    if tutor_data.total_experience_years is not None:
        tutor.total_experience_years = tutor_data.total_experience_years
    if tutor_data.tution_type is not None:
        tutor.tution_type = tutor_data.tution_type

    db.commit()
    db.refresh(tutor)
    return _tutor_to_out(tutor)


def delete_tutor(db: Session, tutor_id: int) -> None:
    tutor = get_tutor_by_id(db, tutor_id)
    if not tutor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found")
    db.delete(tutor)
    db.commit()


_DAY_NAMES = {
    5: "Saturday",
    6: "Sunday",
    0: "Monday",
    1: "Tuesday",
    2: "Wednesday",
    3: "Thursday",
    4: "Friday",
}
 
# Which notification types count as "recent activity" on the tutor dashboard.
# Title/body text is NOT duplicated here — it's read directly from the
# Notification row itself, so it always matches whatever notification_service.py sends.
_RECENT_ACTIVITY_TYPES = (
    NotificationType.OFFER_ACCEPTED,
    NotificationType.OFFER_REJECTED,
    NotificationType.PRIVATE_LEAD_RECEIVED,
    NotificationType.PRIVATE_LEAD_ACCEPTED,
)
 
 
def _get_new_requests_count(db: Session, tutor_id: int, since: datetime) -> int:
    """Public leads matching the tutor's subjects/levels, still open, created in the
    last 7 days, that this tutor has not already applied to."""
    subject_level_pairs = db.query(
        TutorSubject.subject_id, TutorSubject.level_id
    ).filter(TutorSubject.tutor_id == tutor_id).all()
 
    if not subject_level_pairs:
        return 0
 
    already_applied_lead_ids = {
        row[0]
        for row in db.query(LeadApplication.post_requirements_id)
        .filter(LeadApplication.tutor_id == tutor_id)
        .all()
    }
 
    count = 0
    for subject_id, level_id in subject_level_pairs:
        query = db.query(PostRequirement).filter(
            PostRequirement.subject_id == subject_id,
            PostRequirement.level_id == level_id,
            PostRequirement.is_public.is_(True),
            PostRequirement.lead_status == LeadStatusEnum.OPEN,
            PostRequirement.created_at >= since,
        )
        for lead in query.all():
            if lead.post_requirements_id not in already_applied_lead_ids:
                count += 1
 
    return count
 
 
def _get_pending_requests_count(db: Session, tutor_id: int) -> int:
    """This tutor's own offers still pending a student decision (not yet revealed)."""
    return (
        db.query(func.count(LeadApplication.lead_application_id))
        .filter(
            LeadApplication.tutor_id == tutor_id,
            LeadApplication.application_status == LeadApplicationStatusEnum.PENDING,
            LeadApplication.contact_revealed_at.is_(None),
        )
        .scalar()
        or 0
    )
 
 
def _get_accepted_requests_count(db: Session, tutor_id: int) -> int:
    """This tutor's offers where the student's contact has been revealed —
    i.e. the offer was effectively accepted."""
    return (
        db.query(func.count(LeadApplication.lead_application_id))
        .filter(
            LeadApplication.tutor_id == tutor_id,
            LeadApplication.contact_revealed_at.is_not(None),
        )
        .scalar()
        or 0
    )
 
 
def _get_average_rating(db: Session, tutor_id: int) -> float | None:
    avg = (
        db.query(func.avg(Review.number_of_stars))
        .filter(Review.tutor_id == tutor_id)
        .scalar()
    )
    return round(float(avg), 1) if avg is not None else None
 
 
def _get_weekly_activity(db: Session, tutor_id: int, since: datetime) -> list[WeeklyActivityPoint]:
    """Number of offers this tutor submitted, per day, for the last 7 days."""
    rows = (
        db.query(
            func.date(LeadApplication.created_at).label("day"),
            func.count(LeadApplication.lead_application_id).label("count"),
        )
        .filter(
            LeadApplication.tutor_id == tutor_id,
            LeadApplication.created_at >= since,
        )
        .group_by(func.date(LeadApplication.created_at))
        .all()
    )
    counts_by_date = {row.day: row.count for row in rows}
 
    today = datetime.utcnow().date()
    points: list[WeeklyActivityPoint] = []
    for offset in range(6, -1, -1):
        day_date = today - timedelta(days=offset)
        points.append(
            WeeklyActivityPoint(
                day=_DAY_NAMES[day_date.weekday()],
                count=counts_by_date.get(day_date, 0),
            )
        )
    return points
 
 
def _resolve_student_name(lead: PostRequirement) -> str | None:
    if lead.lead_target is not None and lead.student is not None:
        return f"{lead.student.first_name} {lead.student.last_name}"
    return None


def get_recent_requests(db: Session, tutor_id: int, limit: int = 3) -> TutorRecentRequestsOut:
    """Last N requests directed at this tutor (private inbox + matching public leads)."""
    subject_level_pairs = db.query(
        TutorSubject.subject_id, TutorSubject.level_id
    ).filter(TutorSubject.tutor_id == tutor_id).all()

    private_filter = PostRequirement.lead_target.has(LeadTarget.tutor_id == tutor_id)
    public_filters = [
        and_(
            PostRequirement.subject_id == subject_id,
            PostRequirement.level_id == level_id,
            PostRequirement.is_public.is_(True),
        )
        for subject_id, level_id in subject_level_pairs
    ]

    if public_filters:
        lead_filter = or_(private_filter, or_(*public_filters))
    else:
        lead_filter = private_filter

    leads = (
        db.query(PostRequirement)
        .options(
            joinedload(PostRequirement.subject),
            joinedload(PostRequirement.level),
            joinedload(PostRequirement.lead_target),
            joinedload(PostRequirement.student),
        )
        .filter(lead_filter)
        .order_by(PostRequirement.created_at.desc())
        .limit(limit)
        .all()
    )

    items = [
        TutorRecentRequestOut(
            lead_id=lead.post_requirements_id,
            title=lead.title,
            subject=lead.subject.subject_title if lead.subject else "",
            level=lead.level.level_title if lead.level else "",
            is_public=lead.is_public,
            lead_status=lead.lead_status.value,
            student_name=_resolve_student_name(lead),
            created_at=lead.created_at,
        )
        for lead in leads
    ]
    return TutorRecentRequestsOut(items=items)


def get_recent_activity(db: Session, tutor_id: int, limit: int = 3) -> RecentActivityOut:
    return RecentActivityOut(items=_get_recent_activity(db, tutor_id, limit=limit))


def _get_recent_activity(db: Session, tutor_id: int, limit: int = 5) -> list[RecentActivityItem]:
    notifications = (
        db.query(Notification)
        .filter(
            Notification.recipient_type == "tutor",
            Notification.recipient_id == tutor_id,
            Notification.notification_type.in_(_RECENT_ACTIVITY_TYPES),
        )
        .order_by(Notification.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        RecentActivityItem(
            type=notification.notification_type.value,
            text=notification.body,
            timestamp=notification.created_at,
        )
        for notification in notifications
    ]
 
 
def get_tutor_dashboard_stats(db: Session, tutor_id: int) -> TutorStatsOut:
    since = datetime.utcnow() - timedelta(days=7)
 
    return TutorStatsOut(
        new_requests=_get_new_requests_count(db, tutor_id, since),
        pending_requests=_get_pending_requests_count(db, tutor_id),
        accepted_requests=_get_accepted_requests_count(db, tutor_id),
        average_rating=_get_average_rating(db, tutor_id),
        weekly_activity=_get_weekly_activity(db, tutor_id, since),
        recent_activity=_get_recent_activity(db, tutor_id),
    )


# Aleph Rank Score (ARS): blends rating quality, experience, and review volume.
#   ARS = (0.70 × R + 0.30 × E) × B
#   R = average stars (1–5); 3.0 baseline when a tutor has no reviews yet
#   E = min(years, 25) / 25 × 5  (experience normalized to a 0–5 scale)
#   B = 1 + min(reviews_count, 50) / 50 × 0.20  (up to +20% credibility boost)
_TOP_TUTORS_SCORING_FORMULA = (
    "ARS = (0.70 × rating + 0.30 × experience_norm) × review_boost; "
    "rating defaults to 3.0 without reviews; experience_norm = min(years, 25)/25×5; "
    "review_boost = 1 + min(reviews, 50)/50×0.20"
)
_RATING_WEIGHT = 0.70
_EXPERIENCE_WEIGHT = 0.30
_NEUTRAL_RATING_BASELINE = 3.0
_EXPERIENCE_CAP_YEARS = 25
_REVIEW_BOOST_CAP = 50
_REVIEW_BOOST_MAX = 0.20


def _calculate_tutor_rank_score(
    average_rating: float | None,
    reviews_count: int,
    total_experience_years: int | None,
) -> float:
    rating_score = average_rating if average_rating is not None else _NEUTRAL_RATING_BASELINE
    years = max(total_experience_years or 0, 0)
    experience_score = min(years, _EXPERIENCE_CAP_YEARS) / _EXPERIENCE_CAP_YEARS * 5.0
    review_boost = 1.0 + min(reviews_count, _REVIEW_BOOST_CAP) / _REVIEW_BOOST_CAP * _REVIEW_BOOST_MAX
    return round(
        (_RATING_WEIGHT * rating_score + _EXPERIENCE_WEIGHT * experience_score) * review_boost,
        2,
    )


def get_top_tutors_report(db: Session, limit: int = 10) -> TopTutorsReportOut:
    """Top verified tutors ranked by Aleph Rank Score (reviews + experience)."""
    rows = (
        db.query(
            Tutor,
            func.avg(Review.number_of_stars).label("avg_rating"),
            func.count(Review.review_id).label("reviews_count"),
        )
        .outerjoin(Review, Review.tutor_id == Tutor.tutor_id)
        .filter(
            Tutor.verified.is_(True),
            Tutor.is_banned.is_(False),
        )
        .group_by(Tutor.tutor_id)
        .all()
    )

    ranked: list[tuple[Tutor, float | None, int, float]] = []
    for tutor, avg_rating, reviews_count in rows:
        avg = round(float(avg_rating), 1) if avg_rating is not None else None
        count = int(reviews_count or 0)
        score = _calculate_tutor_rank_score(avg, count, tutor.total_experience_years)
        ranked.append((tutor, avg, count, score))

    ranked.sort(
        key=lambda row: (
            -row[3],
            -(row[1] or 0),
            -row[2],
            -(row[0].total_experience_years or 0),
            -row[0].tutor_id,
        )
    )

    items = [
        TopTutorRankOut(
            rank=index,
            tutor_id=tutor.tutor_id,
            first_name=tutor.first_name,
            last_name=tutor.last_name,
            tutor_photo=tutor.tutor_photo,
            average_rating=avg,
            reviews_count=count,
            total_experience_years=tutor.total_experience_years,
            rank_score=score,
        )
        for index, (tutor, avg, count, score) in enumerate(ranked[:limit], start=1)
    ]

    return TopTutorsReportOut(
        scoring_formula=_TOP_TUTORS_SCORING_FORMULA,
        items=items,
    )
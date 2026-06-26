from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.models.students import Student
from app.schemas.students import CreateStudent, StudentOut, UpdateStudentRequest, AcceptedRequestsCountOut, RecentRequestOut, RecentRequestsOut
from app.services.tutor_service import hash_password

from app.models.lead_applications import LeadApplication
from app.models.post_requirements import PostRequirement
from app.schemas.enums import LeadApplicationStatusEnum, LeadStatusEnum
 
def get_student_by_id(db: Session, student_id: int) -> Student | None:
    return db.get(Student, student_id)


def get_student_by_email(db: Session, email: str) -> Student | None:
    return db.scalar(select(Student).where(Student.email == email.lower()))


def _student_to_out(student: Student) -> StudentOut:
    return StudentOut.model_validate(student)


def get_all_students_out(db: Session) -> list[StudentOut]:
    students = db.scalars(select(Student).order_by(Student.student_id.asc())).all()
    return [_student_to_out(student) for student in students]


def get_student_by_id_out(db: Session, student_id: int) -> StudentOut | None:
    student = get_student_by_id(db, student_id)
    if not student:
        return None
    return _student_to_out(student)


def create_student(db: Session, student_data: CreateStudent) -> StudentOut:
    existing = get_student_by_email(db, student_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Student with email '{student_data.email}' already exists",
        )

    student = Student(
        first_name=student_data.first_name.strip(),
        last_name=student_data.last_name.strip(),
        email=student_data.email.lower(),
        password=hash_password(student_data.password),
        date_birth=student_data.date_birth,
        phone_number=student_data.phone_number.strip(),
        registered_at=datetime.now(timezone.utc),
        grade_level=student_data.grade_level,
    )

    db.add(student)
    try:
        db.commit()
        db.refresh(student)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Student with this email already exists",
        ) from None

    return _student_to_out(student)


def update_student(db: Session, student_id: int, student_data: UpdateStudentRequest) -> StudentOut:
    student = get_student_by_id(db, student_id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    if student_data.email is not None and student_data.email.lower() != student.email.lower():
        existing = get_student_by_email(db, student_data.email)
        if existing and existing.student_id != student.student_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Student with email '{student_data.email}' already exists",
            )

    if student_data.first_name is not None:
        student.first_name = student_data.first_name.strip()
    if student_data.last_name is not None:
        student.last_name = student_data.last_name.strip()
    if student_data.email is not None:
        student.email = student_data.email.lower()
    if student_data.password is not None:
        student.password = hash_password(student_data.password)
    if student_data.date_birth is not None:
        student.date_birth = student_data.date_birth
    if student_data.phone_number is not None:
        student.phone_number = student_data.phone_number.strip()
    if student_data.student_photo is not None:
        student.student_photo = student_data.student_photo
    if student_data.grade_level is not None:
        student.grade_level = student_data.grade_level

    db.commit()
    db.refresh(student)
    return _student_to_out(student)


def delete_student(db: Session, student_id: int) -> None:
    student = get_student_by_id(db, student_id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    db.delete(student)
    db.commit()


_ACCEPTED_LEAD_STATUSES = (LeadStatusEnum.CLOSED_SHORTLIST, LeadStatusEnum.CLOSED_MATCHED)
 
 
def get_accepted_requests_count(db: Session, student_id: int) -> AcceptedRequestsCountOut:
    count = (
        db.query(func.count(PostRequirement.post_requirements_id))
        .filter(
            PostRequirement.student_id == student_id,
            PostRequirement.lead_status.in_(_ACCEPTED_LEAD_STATUSES),
        )
        .scalar()
        or 0
    )
    return AcceptedRequestsCountOut(accepted_requests=count)
 
 
def _resolve_matched_tutor_name(lead: PostRequirement) -> str | None:
    # Private lead, accepted -> the target tutor.
    if lead.lead_target is not None and lead.lead_status == LeadStatusEnum.CLOSED_MATCHED:
        tutor = lead.lead_target.tutor
        return f"{tutor.first_name} {tutor.last_name}" if tutor else None
 
    # Public lead, matched -> whichever tutor(s) got their contact revealed.
    # If the student accepted multiple offers, show the first one matched.
    if lead.lead_status == LeadStatusEnum.CLOSED_SHORTLIST:
        accepted_application = next(
            (
                application
                for application in lead.lead_applications
                if application.contact_revealed_at is not None
            ),
            None,
        )
        if accepted_application is not None and accepted_application.tutor is not None:
            tutor = accepted_application.tutor
            return f"{tutor.first_name} {tutor.last_name}"
 
    return None
 
 
def get_recent_requests(db: Session, student_id: int, limit: int = 5) -> RecentRequestsOut:
    leads = (
        db.query(PostRequirement)
        .options(
            joinedload(PostRequirement.subject),
            joinedload(PostRequirement.level),
            joinedload(PostRequirement.lead_target),
            joinedload(PostRequirement.lead_applications).joinedload(LeadApplication.tutor),
        )
        .filter(PostRequirement.student_id == student_id)
        .order_by(PostRequirement.created_at.desc())
        .limit(limit)
        .all()
    )
 
    items = [
        RecentRequestOut(
            lead_id=lead.post_requirements_id,
            title=lead.title,
            subject=lead.subject.subject_title if lead.subject else "",
            level=lead.level.level_title if lead.level else "",
            is_public=lead.is_public,
            lead_status=lead.lead_status.value,
            applications_count=len(
                [
                    application
                    for application in lead.lead_applications
                    if application.application_status != LeadApplicationStatusEnum.WITHDRAWN
                ]
            ),
            matched_tutor_name=_resolve_matched_tutor_name(lead),
            created_at=lead.created_at,
        )
        for lead in leads
    ]
 
    return RecentRequestsOut(items=items)
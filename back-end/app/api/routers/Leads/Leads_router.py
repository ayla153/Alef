from fastapi import APIRouter, Depends, status

from app.api.deps import DbSession, get_current_student, get_verified_tutor
from app.models.students import Student
from app.models.tutors import Tutor
from app.schemas.leads import CreatePublicLeadIn, LeadApplicationOut, LeadBrowseCardOut, LeadOut, OfferIn
from app.services import lead_service

router = APIRouter(
    prefix="/leads",
    tags=["Leads"],
)


@router.get("/health", status_code=status.HTTP_200_OK)
def leads_health() -> dict[str, str]:
    return {"status": "ok", "module": "leads"}


@router.post("/public", response_model=LeadOut, status_code=status.HTTP_201_CREATED)
def create_public_lead(
    body: CreatePublicLeadIn,
    db: DbSession,
    current_student: Student = Depends(get_current_student),
) -> LeadOut:
    return lead_service.create_public_lead(db, current_student, body)


@router.get("/me", response_model=list[LeadOut])
def list_my_leads(
    db: DbSession,
    current_student: Student = Depends(get_current_student),
) -> list[LeadOut]:
    return lead_service.list_leads_for_student(db, current_student.student_id)


@router.get("/browse", response_model=list[LeadBrowseCardOut])
def browse_leads(
    db: DbSession,
    current_tutor: Tutor = Depends(get_verified_tutor),
) -> list[LeadBrowseCardOut]:
    return lead_service.browse_public_leads(db, current_tutor)


@router.post(
    "/{lead_id}/offers",
    response_model=LeadApplicationOut,
    status_code=status.HTTP_201_CREATED,
)
def submit_offer(
    lead_id: int,
    body: OfferIn,
    db: DbSession,
    current_tutor: Tutor = Depends(get_verified_tutor),
) -> LeadApplicationOut:
    return lead_service.submit_offer(db, lead_id, current_tutor, body)


@router.get("/{lead_id}", response_model=LeadOut)
def get_lead(
    lead_id: int,
    db: DbSession,
    current_student: Student = Depends(get_current_student),
) -> LeadOut:
    lead = lead_service.get_lead_for_student(db, lead_id, current_student)
    return lead_service.lead_to_out(lead)


@router.patch("/{lead_id}/offers/{offer_id}/reject", response_model=LeadOut)
def reject_offer(
    lead_id: int,
    offer_id: int,
    db: DbSession,
    current_student: Student = Depends(get_current_student),
) -> LeadOut:
    lead = lead_service.get_lead_for_student(db, lead_id, current_student)
    return lead_service.reject_offer(db, lead, offer_id, current_student)


@router.post("/{lead_id}/close", response_model=LeadOut)
def close_lead(
    lead_id: int,
    db: DbSession,
    current_student: Student = Depends(get_current_student),
) -> LeadOut:
    lead = lead_service.get_lead_for_student(db, lead_id, current_student)
    return lead_service.close_lead_public_for_student(db, lead, current_student)

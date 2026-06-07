from fastapi import APIRouter, HTTPException, status

from app.api.deps import DbSession
from app.schemas.leads import LeadOut
from app.services import lead_service

router = APIRouter(
    prefix="/leads",
    tags=["Leads"],
)


@router.get("/health", status_code=status.HTTP_200_OK)
def leads_health() -> dict[str, str]:
    """Stub until SCRUM-60–63 wire student/tutor endpoints."""
    return {"status": "ok", "module": "leads"}


@router.get("/{lead_id}", response_model=LeadOut)
def get_lead(lead_id: int, db: DbSession) -> LeadOut:
    lead = lead_service.get_lead_by_id(db, lead_id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found.")
    return lead_service.lead_to_out(lead)

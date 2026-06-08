from typing import Optional

from fastapi import APIRouter, Depends, status

from app.api.deps import DbSession, get_current_student, get_verified_tutor
from app.models.students import Student
from app.models.tutors import Tutor
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
)
from app.services import lead_service

router = APIRouter(
    prefix="/leads",
    tags=["Leads"],
)


@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Leads module health check",
    description="Smoke test only. No auth. Use to confirm the /leads router is mounted.",
)
def leads_health() -> dict[str, str]:
    return {"status": "ok", "module": "leads"}


@router.post(
    "/public",
    response_model=LeadOut,
    status_code=status.HTTP_201_CREATED,
    summary="Student: create public marketplace lead",
    description=(
        "**Auth:** student Bearer token.\n\n"
        "**When:** Student posts a new tutoring request on the public Leads page.\n\n"
        "**Body:** `CreatePublicLeadIn` — subject, level, title, description, fee, etc.\n\n"
        "**Success:** `201` + `LeadOut` with `lead_status=open`, `is_public=true`.\n\n"
        "**Errors:** `409` if same student already created a public lead for this subject within 14 days; "
        "`404` if subject/level not found.\n\n"
        "**UI:** After create, navigate to lead detail or «my leads». Phones are hidden until close."
    ),
)
def create_public_lead(
    body: CreatePublicLeadIn,
    db: DbSession,
    current_student: Student = Depends(get_current_student),
) -> LeadOut:
    return lead_service.create_public_lead(db, current_student, body)


@router.post(
    "/private",
    response_model=LeadOut,
    status_code=status.HTTP_201_CREATED,
    summary="Student: create private lead from tutor profile",
    description=(
        "**Auth:** student Bearer token.\n\n"
        "**When:** Student taps «تواصل مع هذا المعلّم» on a tutor profile. "
        "Pass that tutor's id as `target_tutor_id`.\n\n"
        "**Body:** `CreatePrivateLeadIn` — same fields as public + `target_tutor_id` (required) "
        "and optional `publish_public_copy` (anonymized card on public browse).\n\n"
        "**Success:** `201` + `LeadOut` with `target_tutor_id` set.\n\n"
        "**Errors:** `409` if student already has one open private lead; `404` if tutor/subject/level missing.\n\n"
        "**UI:** Show inbox confirmation; if `publish_public_copy=true`, explain an anonymous copy may appear on Leads."
    ),
)
def create_private_lead(
    body: CreatePrivateLeadIn,
    db: DbSession,
    current_student: Student = Depends(get_current_student),
) -> LeadOut:
    return lead_service.create_private_lead(db, current_student, body)


@router.get(
    "/me",
    response_model=list[LeadOut],
    summary="Student: list my leads",
    description=(
        "**Auth:** student Bearer token.\n\n"
        "**When:** Student dashboard / «طلباتي» — show all leads they created (public + private).\n\n"
        "**Response:** `LeadOut[]` newest first. Each includes `applications` (offers), "
        "`pending_offer_count`, `lead_status`.\n\n"
        "**Phones:** `student_phone_number` and `applications[].tutor_phone_number` are `null` "
        "until reveal rules apply (public close shortlist, private accept, or private matched close)."
    ),
)
def list_my_leads(
    db: DbSession,
    current_student: Student = Depends(get_current_student),
) -> list[LeadOut]:
    return lead_service.list_leads_for_student(db, current_student.student_id)


@router.get(
    "/tutor/inbox",
    response_model=list[LeadOut],
    summary="Tutor: private lead inbox",
    description=(
        "**Auth:** verified tutor Bearer token.\n\n"
        "**When:** Tutor opens inbox for **private** requests sent directly to them (profile contact flow).\n\n"
        "**Response:** Private leads for this tutor: `open` (awaiting accept) and "
        "`closed_matched` (tutor already accepted). Includes requirement fields; "
        "**no student phone** until tutor accepts; after accept, mutual phones and `closed_matched`.\n\n"
        "**UI:** Open cards → «أوافق على التواصل» (`POST /leads/{id}/accept-contact`). "
        "Matched cards → show contact details (refresh-safe)."
    ),
)
def tutor_private_inbox(
    db: DbSession,
    current_tutor: Tutor = Depends(get_verified_tutor),
) -> list[LeadOut]:
    return lead_service.list_tutor_private_inbox(db, current_tutor)


@router.get(
    "/tutor/offers",
    response_model=list[TutorPublicOfferOut],
    summary="Tutor: my public lead offers",
    description=(
        "**Auth:** verified tutor Bearer token.\n\n"
        "**When:** Tutor opens «عروضي» — track every offer submitted on **public** leads.\n\n"
        "**Response:** Newest first. Each row includes the offer, lead title/status, "
        "`outcome` (`pending`, `rejected`, `contact_shared`, `lead_closed_empty`, `lead_closed_expired`), "
        "`notification_message` for UI badges, and `student_phone_number` when the student "
        "closed with shortlist (public accept = share contacts with all pending offers).\n\n"
        "**v1:** No push notifications — poll this endpoint or show unread from `student_responded_at`."
    ),
)
def tutor_public_offers(
    db: DbSession,
    current_tutor: Tutor = Depends(get_verified_tutor),
) -> list[TutorPublicOfferOut]:
    return lead_service.list_tutor_public_offers(db, current_tutor)


@router.get(
    "/browse",
    response_model=list[LeadBrowseCardOut],
    summary="Tutor: browse open public leads",
    description=(
        "**Auth:** verified tutor Bearer token.\n\n"
        "**When:** Tutor opens the public Leads marketplace to find students to apply to.\n\n"
        "**Response:** Anonymous cards only — **no student name or phone**. "
        "Filtered to leads matching tutor's subjects, `open`, and `accepting_applications=true`.\n\n"
        "**UI:** Tap card → offer form → `POST /leads/{id}/offers`. "
        "Hide or disable apply when `accepting_applications=false` (slots full)."
    ),
)
def browse_leads(
    db: DbSession,
    current_tutor: Tutor = Depends(get_verified_tutor),
) -> list[LeadBrowseCardOut]:
    return lead_service.browse_public_leads(db, current_tutor)


@router.post(
    "/{lead_id}/offers",
    response_model=LeadApplicationOut,
    status_code=status.HTTP_201_CREATED,
    summary="Tutor: submit offer on public lead",
    description=(
        "**Auth:** verified tutor Bearer token.\n\n"
        "**When:** Tutor applies to a **public** lead from browse or detail.\n\n"
        "**Body:** `OfferIn` — `proposed_fee`, `first_session_note`, `message`.\n\n"
        "**Success:** `201` + offer row. Max 5 pending offers per lead; one offer per tutor per lead.\n\n"
        "**Errors:** `409` slots full or duplicate offer; `403` tutor doesn't teach subject; "
        "`400` not a public lead.\n\n"
        "**UI:** After submit, show pending on `GET /leads/tutor/offers`. Student sees offer in shortlist (no phones yet)."
    ),
)
def submit_offer(
    lead_id: int,
    body: OfferIn,
    db: DbSession,
    current_tutor: Tutor = Depends(get_verified_tutor),
) -> LeadApplicationOut:
    return lead_service.submit_offer(db, lead_id, current_tutor, body)


@router.post(
    "/{lead_id}/accept-contact",
    response_model=LeadOut,
    summary="Tutor: accept private lead contact",
    description=(
        "**Auth:** verified tutor Bearer token (must be the **target** tutor on this private lead).\n\n"
        "**When:** Tutor taps «أوافق على التواصل» on an inbox private request.\n\n"
        "**Body:** `AcceptContactIn` — all fields optional (fee, session note, message).\n\n"
        "**Success:** Lead becomes `closed_matched` immediately. Mutual phone reveal — "
        "`student_phone_number` and tutor phone on the application. Off-platform contact allowed.\n\n"
        "**Errors:** `403` wrong tutor; `409` already accepted or lead not open."
    ),
)
def accept_private_contact(
    lead_id: int,
    db: DbSession,
    current_tutor: Tutor = Depends(get_verified_tutor),
    body: AcceptContactIn | None = None,
) -> LeadOut:
    return lead_service.accept_private_contact(
        db, lead_id, current_tutor, body or AcceptContactIn()
    )


@router.get(
    "/{lead_id}",
    response_model=LeadOut,
    summary="Student: get lead detail",
    description=(
        "**Auth:** student Bearer token (owner only).\n\n"
        "**When:** Student opens a single lead — review offers, status, and phones after reveal.\n\n"
        "**Response:** Full `LeadOut` with `applications` list.\n\n"
        "**Errors:** `404` not found; `403` not owner.\n\n"
        "**Phones:** Populated only after public `closed_shortlist`, private tutor accept, "
        "or private `closed_matched`."
    ),
)
def get_lead(
    lead_id: int,
    db: DbSession,
    current_student: Student = Depends(get_current_student),
) -> LeadOut:
    lead = lead_service.get_lead_for_student(db, lead_id, current_student)
    return lead_service.lead_to_out(lead)


@router.patch(
    "/{lead_id}/offers/{offer_id}/reject",
    response_model=LeadOut,
    summary="Student: reject an offer",
    description=(
        "**Auth:** student Bearer token (owner only).\n\n"
        "**When:** Student removes one tutor from the shortlist on a **public** open lead.\n\n"
        "**Effect:** Offer status → `rejected`; frees one slot (`accepting_applications` may become `true` again).\n\n"
        "**Errors:** `400` on private leads; `409` if offer not pending.\n\n"
        "**UI:** Do not confuse with close — reject trims list; close ends the lead and reveals phones."
    ),
)
def reject_offer(
    lead_id: int,
    offer_id: int,
    db: DbSession,
    current_student: Student = Depends(get_current_student),
) -> LeadOut:
    lead = lead_service.get_lead_for_student(db, lead_id, current_student)
    return lead_service.reject_offer(db, lead, offer_id, current_student)


@router.post(
    "/{lead_id}/close",
    response_model=LeadOut,
    summary="Student: close lead",
    description=(
        "**Auth:** student Bearer token (owner only).\n\n"
        "**Public lead** (no `target_tutor_id`): send **no body**. "
        "If ≥1 pending offer → `closed_shortlist` and phones for **all** remaining tutors (max 5). "
        "If 0 offers → `closed_empty`, no phones.\n\n"
        "**Private lead** (`target_tutor_id` set): body **required** — `ClosePrivateLeadIn`:\n"
        "- `{ \"matched\": true }` → `closed_matched` (done with target tutor; phones stay if tutor accepted)\n"
        "- `{ \"matched\": false }` → `closed_empty` (no match; revokes phones even if tutor had accepted)\n\n"
        "**UI:** Public close label e.g. «غير مهتم». Private: separate matched vs no-match actions."
    ),
)
def close_lead(
    lead_id: int,
    db: DbSession,
    current_student: Student = Depends(get_current_student),
    body: Optional[ClosePrivateLeadIn] = None,
) -> LeadOut:
    lead = lead_service.get_lead_for_student(db, lead_id, current_student)
    return lead_service.close_lead_for_student(db, lead, current_student, body)

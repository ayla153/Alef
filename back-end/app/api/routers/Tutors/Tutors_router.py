from typing import List, Optional, Tuple

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_current_tutor, get_current_user_role_id, get_optional_token_payload
from app.database import get_db
from app.models.admins import Admin
from app.models.tutors import Tutor
from app.schemas.auth import TokenPayload
from app.schemas.tutors import (
    CreateTutor,
    TutorOut,
    UpdateTutorRequest,
    TutorStatsOut,
    RecentActivityOut,
    TutorRecentRequestsOut,
)
from app.services import tutor_service

router = APIRouter(prefix="/tutors", tags=["Tutors"])


@router.post("/", response_model=TutorOut, status_code=status.HTTP_201_CREATED)
def create_tutor(
    tutor: CreateTutor,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    return tutor_service.create_tutor(db, tutor)


@router.get("/me", response_model=TutorOut)
def get_me_tutor(current_tutor: Tutor = Depends(get_current_tutor)):
    return TutorOut.model_validate(current_tutor)


@router.patch("/me", response_model=TutorOut)
def update_me_tutor(
    body: UpdateTutorRequest,
    db: Session = Depends(get_db),
    current_tutor: Tutor = Depends(get_current_tutor),
):
    return tutor_service.update_tutor(db, current_tutor.tutor_id, body)


@router.get("/me/stats", response_model=TutorStatsOut)
def get_my_stats(
    db: Session = Depends(get_db),
    current_tutor: Tutor = Depends(get_current_tutor),
):
    return tutor_service.get_tutor_dashboard_stats(db, current_tutor.tutor_id)


@router.get("/me/recent-requests", response_model=TutorRecentRequestsOut)
def get_my_recent_requests(
    db: Session = Depends(get_db),
    current_tutor: Tutor = Depends(get_current_tutor),
):
    return tutor_service.get_recent_requests(db, current_tutor.tutor_id, limit=3)


@router.get("/me/recent-activity", response_model=RecentActivityOut)
def get_my_recent_activity(
    db: Session = Depends(get_db),
    current_tutor: Tutor = Depends(get_current_tutor),
):
    return tutor_service.get_recent_activity(db, current_tutor.tutor_id, limit=3)


@router.get(
    "/{tutor_id}",
    response_model=TutorOut,
    summary="Get tutor profile (public)",
    description=(
        "Public tutor catalog. No login required. "
        "Accessible to guests, students, tutors, and admins."
    ),
)
def get_tutor_by_id(
    tutor_id: int,
    db: Session = Depends(get_db),
    payload: TokenPayload | None = Depends(get_optional_token_payload),
):
    allow_banned = payload is not None and payload.role == "admin"
    tutor = tutor_service.get_tutor_by_id_out(db, tutor_id, allow_banned=allow_banned)
    if not tutor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found")
    return tutor


@router.get(
    "/",
    response_model=List[TutorOut],
    status_code=status.HTTP_200_OK,
    summary="List tutors",
    description="Tutor catalog. Requires login as a student, tutor, or admin.",
)
def get_all_tutors(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    subject_ids: Optional[List[int]] = Query(default=None),
    stages: Optional[List[str]] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: Tuple[str, int] = Depends(get_current_user_role_id),
):
    role, _user_id = current_user
    return tutor_service.get_all_tutors(
        db,
        page,
        page_size,
        subject_ids,
        stages,
        include_banned=(role == "admin"),
    )


@router.post("/{tutor_id}/photo", response_model=TutorOut)
def upload_tutor_photo(
    tutor_id: int,
    file: UploadFile | str | None = File(default=None),
    db: Session = Depends(get_db),
    current_tutor: Tutor = Depends(get_current_tutor),
):
    if current_tutor.tutor_id != tutor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only upload a photo to your own tutor profile",
        )
    return tutor_service.update_tutor_photo(db, tutor_id, file)


@router.post("/{tutor_id}/video", response_model=TutorOut)
def upload_tutor_video(
    tutor_id: int,
    file: UploadFile | str | None = File(default=None),
    db: Session = Depends(get_db),
    current_tutor: Tutor = Depends(get_current_tutor),
):
    if current_tutor.tutor_id != tutor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only upload a video to your own tutor profile",
        )
    return tutor_service.update_tutor_video(db, tutor_id, file)


@router.patch("/{tutor_id}", response_model=TutorOut)
def update_tutor(
    tutor_id: int,
    tutor: UpdateTutorRequest,
    db: Session = Depends(get_db),
    current_user: Tuple[str, int] = Depends(get_current_user_role_id),
):
    role, user_id = current_user
    if role == "admin":
        pass
    elif role == "tutor" and user_id == tutor_id:
        pass
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own tutor profile",
        )
    return tutor_service.update_tutor(db, tutor_id, tutor)


@router.delete("/{tutor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tutor(
    tutor_id: int,
    db: Session = Depends(get_db),
    current_user: Tuple[str, int] = Depends(get_current_user_role_id),
):
    role, user_id = current_user
    if role == "admin":
        pass
    elif role == "tutor" and user_id == tutor_id:
        pass
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own tutor account",
        )
    tutor_service.delete_tutor(db, tutor_id)

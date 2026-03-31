from typing import List, Optional

from fastapi import APIRouter, Depends, status, UploadFile, File, Query
from app.api.routers.Tutors.Tutor_out import TutorOut
from app.api.routers.Tutors.Tutor_create import CreateTutor
from app.database import get_db
from sqlalchemy.orm import Session
from app.services import tutor_service


router = APIRouter(
    prefix="/tutors",
    tags=["Tutors"],
)


@router.post("/", response_model=TutorOut, status_code=status.HTTP_201_CREATED)
def create_tutor(
    tutor: CreateTutor,
    db: Session = Depends(get_db),
):
    return tutor_service.create_tutor(db, tutor)


@router.get("/{tutor_id}", response_model=TutorOut)
def get_tutor_by_id(
    tutor_id: int,
    db: Session = Depends(get_db),
):
    tutor = tutor_service.get_tutor_by_id_out(db, tutor_id)
    if not tutor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found")
    return tutor


@router.get("/me", response_model=TutorOut)
def get_me_tutor(
    tutor_id: int = Query(..., description="Your tutor ID. This should normally come from auth context."),
    db: Session = Depends(get_db),
):
    tutor = tutor_service.get_tutor_by_id_out(db, tutor_id)
    if not tutor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found")
    return tutor


@router.post("/{tutor_id}/photo", response_model=TutorOut)
def upload_tutor_photo(
    tutor_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return tutor_service.update_tutor_photo(db, tutor_id, file)


@router.post("/{tutor_id}/video", response_model=TutorOut)
def upload_tutor_video(
    tutor_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return tutor_service.update_tutor_video(db, tutor_id, file)


@router.get("/", response_model=List[TutorOut], status_code=status.HTTP_200_OK)
def get_all_tutors(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    subject_ids: Optional[List[int]] = Query(default=None),
    stages: Optional[List[str]] = Query(default=None),
    db: Session = Depends(get_db),
):
    return tutor_service.get_all_tutors(
        db=db,
        page=page,
        page_size=page_size,
        subject_ids=subject_ids,
        stages=stages,
    )


from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_tutor
from app.database import get_db
from app.models.tutors import Tutor
from app.schemas.tutors import CreateTutor, TutorOut, UpdateTutorRequest
from app.services import tutor_service

router = APIRouter(prefix="/tutors", tags=["Tutors"])


@router.post("/", response_model=TutorOut, status_code=status.HTTP_201_CREATED)
def create_tutor(tutor: CreateTutor, db: Session = Depends(get_db)):
    return tutor_service.create_tutor(db, tutor)


@router.get("/me", response_model=TutorOut)
def get_me_tutor(current_tutor: Tutor = Depends(get_current_tutor)):
    return tutor_service._tutor_to_out(current_tutor)


@router.get("/{tutor_id}", response_model=TutorOut)
def get_tutor_by_id(tutor_id: int, db: Session = Depends(get_db)):
    tutor = tutor_service.get_tutor_by_id_out(db, tutor_id)
    if not tutor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found")
    return tutor


@router.get("/", response_model=List[TutorOut], status_code=status.HTTP_200_OK)
def get_all_tutors(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    subject_ids: Optional[List[int]] = Query(default=None),
    stages: Optional[List[str]] = Query(default=None),
    db: Session = Depends(get_db),
):
    return tutor_service.get_all_tutors(db, page, page_size, subject_ids, stages)


@router.post("/{tutor_id}/photo", response_model=TutorOut)
def upload_tutor_photo(
    tutor_id: int,
    file: UploadFile | str | None = File(default=None),
    db: Session = Depends(get_db),
):
    return tutor_service.update_tutor_photo(db, tutor_id, file)


@router.post("/{tutor_id}/video", response_model=TutorOut)
def upload_tutor_video(
    tutor_id: int,
    file: UploadFile | str | None = File(default=None),
    db: Session = Depends(get_db),
):
    return tutor_service.update_tutor_video(db, tutor_id, file)


@router.patch("/{tutor_id}", response_model=TutorOut)
def update_tutor(tutor_id: int, tutor: UpdateTutorRequest, db: Session = Depends(get_db)):
    return tutor_service.update_tutor(db, tutor_id, tutor)


@router.delete("/{tutor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tutor(tutor_id: int, db: Session = Depends(get_db)):
    tutor_service.delete_tutor(db, tutor_id)

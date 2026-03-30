from fastapi import APIRouter, Depends, status, UploadFile, File
from app.routers.Tutors.Tutor_out import TutorOut
from app.routers.Tutors.Tutor_create import CreateTutor
from database import get_db
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


from fastapi import APIRouter, Depends, status, UploadFile, File, HTTPException, Query
from app.routers.Tutors.Tutor_out import TutorOut
from app.routers.Tutors.Tutor_create import CreateTutor
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


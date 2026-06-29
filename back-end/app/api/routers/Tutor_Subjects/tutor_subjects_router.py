from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_tutor
from app.database import get_db
from app.models.tutors import Tutor
from app.api.routers.Tutor_Subjects.Tutor_Subjects_out import TutorSubjectsOut
from app.schemas.tutor_subjects import CreateTutorSubject, UpdateTutorSubjectRequest
from app.services import tutor_subjects_services

router = APIRouter(
    prefix="/tutor-subjects",
    tags=["Tutor Subjects"],
)


@router.get("/me", response_model=list[TutorSubjectsOut])
def get_my_tutor_subjects(
    db: Session = Depends(get_db),
    current_tutor: Tutor = Depends(get_current_tutor),
):
    return tutor_subjects_services.get_my_tutor_subjects_out(db, current_tutor.tutor_id)


@router.post("/me", response_model=TutorSubjectsOut, status_code=status.HTTP_201_CREATED)
def create_my_tutor_subject(
    tutor_subject: CreateTutorSubject,
    db: Session = Depends(get_db),
    current_tutor: Tutor = Depends(get_current_tutor),
):
    return tutor_subjects_services.create_tutor_subject(db, current_tutor, tutor_subject)


@router.patch("/{tutor_subject_id}", response_model=TutorSubjectsOut)
def update_my_tutor_subject(
    tutor_subject_id: int,
    tutor_subject: UpdateTutorSubjectRequest,
    db: Session = Depends(get_db),
    current_tutor: Tutor = Depends(get_current_tutor),
):
    return tutor_subjects_services.update_tutor_subject(
        db, tutor_subject_id, current_tutor, tutor_subject
    )


@router.delete("/{tutor_subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_tutor_subject(
    tutor_subject_id: int,
    db: Session = Depends(get_db),
    current_tutor: Tutor = Depends(get_current_tutor),
):
    tutor_subjects_services.delete_tutor_subject(db, tutor_subject_id, current_tutor)
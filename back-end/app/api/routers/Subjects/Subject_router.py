from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_current_tutor
from app.database import get_db
from app.models.admins import Admin
from app.models.tutors import Tutor
from app.schemas.subjects import SubjectOut, CreateSubject, UpdateSubjectRequest
from app.services import subject_service

router = APIRouter(
    prefix="/subjects",
    tags=["Subjects"],
)

@router.get("/", response_model=list[SubjectOut])
def list_subjects(

    db: Session = Depends(get_db),
):
    return subject_service.get_all_subjects_out(db)


@router.post("/", response_model=SubjectOut, status_code=status.HTTP_201_CREATED)
def create_subject_endpoint(
    subject: CreateSubject,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    return subject_service.create_subject(db, subject)


@router.get("/{subject_id}", response_model=SubjectOut)
def get_subject_by_id(
    subject_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    subject = subject_service.get_subject_by_id_out(db, subject_id)
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    return subject


@router.patch("/{subject_id}", response_model=SubjectOut)
def update_subject(
    subject_id: int,
    subject: UpdateSubjectRequest,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    return subject_service.update_subject(db, subject_id, subject)


@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    subject_service.delete_subject(db, subject_id)
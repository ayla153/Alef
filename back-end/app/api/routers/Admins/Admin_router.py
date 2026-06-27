from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.database import get_db
from app.models.admins import Admin
from app.schemas.admins import AdminOut, AdminTutorReportOut, CreateAdmin, UpdateAdminRequest
from app.schemas.tutors import TutorOut
from app.services import admin_service

router = APIRouter(
    prefix="/admins",
    tags=["Admins"],
)

@router.get("/", response_model=list[AdminOut])
def list_admins(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return admin_service.get_all_admins_out(db)


@router.post("/", response_model=AdminOut, status_code=status.HTTP_201_CREATED)
def create_admin_endpoint(
    admin: CreateAdmin,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    return admin_service.create_admin(db, admin)


@router.get("/me", response_model=AdminOut)
def get_me_admin(
    current_admin: Admin = Depends(get_current_admin),
):
    return AdminOut.model_validate(current_admin)


@router.get("/tutors/{tutor_id}/report", response_model=AdminTutorReportOut)
def get_tutor_report(
    tutor_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    return admin_service.get_tutor_report(db, tutor_id)


@router.put("/tutors/{tutor_id}/ban", response_model=TutorOut)
def ban_tutor(
    tutor_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    return admin_service.ban_tutor(db, tutor_id)


@router.put("/tutors/{tutor_id}/verify", response_model=TutorOut)
def verify_tutor(
    tutor_id: int,
    verified: bool,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    return admin_service.verify_tutor(db, tutor_id, verified)


@router.get("/{admin_id}", response_model=AdminOut)
def get_admin_by_id(
    admin_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    admin = admin_service.get_admin_by_id_out(db, admin_id)
    if not admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")
    return admin


@router.patch("/{admin_id}", response_model=AdminOut)
def update_admin(
    admin_id: int,
    admin: UpdateAdminRequest,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    return admin_service.update_admin(db, admin_id, admin)


@router.delete("/{admin_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    admin_service.delete_admin(db, admin_id)

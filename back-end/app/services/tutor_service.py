from datetime import datetime
from pathlib import Path
from uuid import uuid4
import os
import shutil

from fastapi import HTTPException, status, UploadFile
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.models.tutors import Tutor
from app.api.routers.Tutors.Tutor_create import CreateTutor

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_tutor_by_email(db: Session, email: str) -> Tutor | None:
    return db.query(Tutor).filter(Tutor.email == email).first()


def get_tutor_by_id(db: Session, tutor_id: int) -> Tutor | None:
    return db.query(Tutor).filter(Tutor.tutor_id == tutor_id).first()


def _save_upload_file(upload_file: UploadFile, folder: str) -> str:
    allowed_ext = {".jpg", ".jpeg", ".png", ".gif", ".mp4", ".mov", ".webm"}
    filename = Path(upload_file.filename).name
    extension = Path(filename).suffix.lower()

    if extension not in allowed_ext:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported media type. Allowed: jpg, jpeg, png, gif, mp4, mov, webm",
        )

    target_dir = Path(folder)
    target_dir.mkdir(parents=True, exist_ok=True)

    dest_file = target_dir / f"{uuid4().hex}{extension}"
    with dest_file.open("wb") as buffer:
        upload_file.file.seek(0)
        shutil.copyfileobj(upload_file.file, buffer)

    return str(dest_file).replace('\\', '/')


def create_tutor(db: Session, tutor_data: CreateTutor) -> Tutor:
    # 1) email uniqueness check in service layer (business logic)
    existing = get_tutor_by_email(db, tutor_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Tutor with email '{tutor_data.email}' already exists",
        )

    # 2) hash password before saving to DB
    hashed_password = hash_password(tutor_data.password)

    # 3) set registered_at explicitly (or use db default if configured)
    tutor_obj = Tutor(
        first_name=tutor_data.first_name.strip(),
        last_name=tutor_data.last_name.strip(),
        email=tutor_data.email.lower(),
        password=hashed_password,
        date_birth=tutor_data.date_birth,
        phone_number=tutor_data.phone_number,
        bio=tutor_data.bio,
        total_experience_years=tutor_data.total_experience_years,
        registered_at=datetime.utcnow(),
        tution_type=tutor_data.tution_type,
        verified=False,
    )

    db.add(tutor_obj)
    db.commit()
    db.refresh(tutor_obj)
    return tutor_obj


def update_tutor_photo(db: Session, tutor_id: int, file: UploadFile) -> Tutor:
    tutor = get_tutor_by_id(db, tutor_id)
    if not tutor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found")

    photo_path = _save_upload_file(file, "uploads/tutors/photos")
    tutor.tutor_photo = photo_path
    db.commit()
    db.refresh(tutor)
    return tutor


def update_tutor_video(db: Session, tutor_id: int, file: UploadFile) -> Tutor:
    tutor = get_tutor_by_id(db, tutor_id)
    if not tutor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found")

    video_path = _save_upload_file(file, "uploads/tutors/videos")
    tutor.tutor_video = video_path
    db.commit()
    db.refresh(tutor)
    return tutor

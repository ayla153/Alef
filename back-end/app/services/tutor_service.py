from datetime import datetime
from pathlib import Path
import re
import shutil

from fastapi import HTTPException, status, UploadFile
from passlib.context import CryptContext
from sqlalchemy.orm import Session, joinedload

from app.models.tutors import Tutor
from app.schemas.tutors import CreateTutor, TutorOut, UpdateTutorRequest

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_tutor_by_email(db: Session, email: str) -> Tutor | None:
    return db.query(Tutor).filter(Tutor.email == email).first()


def get_tutor_by_id(db: Session, tutor_id: int) -> Tutor | None:
    return (
        db.query(Tutor)
        .options(
            joinedload(Tutor.reviews),
            joinedload(Tutor.address),
            joinedload(Tutor.tutor_subjects),
        )
        .filter(Tutor.tutor_id == tutor_id)
        .first()
    )


def _tutor_to_out(tutor: Tutor):

    return TutorOut.model_validate(tutor)


def get_tutor_by_id_out(db: Session, tutor_id: int):
    tutor = get_tutor_by_id(db, tutor_id)
    if not tutor:
        return None
    return _tutor_to_out(tutor)


def _sanitize_filename_base(value: str) -> str:
    sanitized = re.sub(r"[^A-Za-z0-9_-]", "_", value.strip().lower())
    sanitized = re.sub(r"_+", "_", sanitized)
    return sanitized.strip("_") or "tutor"


def _delete_existing_file(file_path: str | None) -> None:
    if not file_path:
        return
    existing = Path(file_path)
    if existing.exists() and existing.is_file():
        try:
            existing.unlink()
        except OSError:
            pass


def _save_upload_file(upload_file: UploadFile, folder: str, dest_filename: str, allowed_ext: set[str]) -> str:
    filename = Path(upload_file.filename).name
    extension = Path(filename).suffix.lower()

    if extension not in allowed_ext:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported media type. Allowed: {', '.join(sorted(allowed_ext))}",
        )

    target_dir = Path(folder)
    target_dir.mkdir(parents=True, exist_ok=True)

    dest_file = target_dir / f"{dest_filename}{extension}"
    with dest_file.open("wb") as buffer:
        upload_file.file.seek(0)
        shutil.copyfileobj(upload_file.file, buffer)

    return str(dest_file).replace('\\', '/')


def create_tutor(db: Session, tutor_data: CreateTutor) -> "TutorOut":
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
    return _tutor_to_out(tutor_obj)


def _is_delete_upload_request(file: UploadFile | str | None) -> bool:
    return file is None or (isinstance(file, str) and not file.strip()) or (
        hasattr(file, "filename") and not getattr(file, "filename", "").strip()
    )


def _ensure_upload_file(file: UploadFile | str | None) -> UploadFile:
    if hasattr(file, "filename") and hasattr(file, "file"):
        return file

    if file is None or file == "":
        return None
    
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid upload request. Provide a file upload or send an empty value to delete.",
    )


def update_tutor_photo(db: Session, tutor_id: int, file: UploadFile | str | None) -> "TutorOut":
    print("BEFORE ENSURE:", type(file), file)
    tutor = get_tutor_by_id(db, tutor_id)
    if not tutor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found")
    if _is_delete_upload_request(file):
        _delete_existing_file(tutor.tutor_photo)
        tutor.tutor_photo = None
    else:
        upload_file = _ensure_upload_file(file)
        _delete_existing_file(tutor.tutor_photo)
        base_name = _sanitize_filename_base(f"{tutor.first_name}_{tutor.last_name}")
        photo_path = _save_upload_file(
            upload_file,
            "uploads/tutors/photos",
            base_name,
            {".jpg", ".jpeg", ".png", ".gif"},
        )
        tutor.tutor_photo = photo_path

    db.commit()
    db.refresh(tutor)
    return _tutor_to_out(tutor)


def update_tutor_video(db: Session, tutor_id: int, file: UploadFile | str | None) -> TutorOut:
    tutor = get_tutor_by_id(db, tutor_id)
    if not tutor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found")

    if _is_delete_upload_request(file):
        _delete_existing_file(tutor.tutor_video)
        tutor.tutor_video = None
    else:
        upload_file = _ensure_upload_file(file)
        _delete_existing_file(tutor.tutor_video)
        base_name = _sanitize_filename_base(f"{tutor.first_name}_{tutor.last_name}")
        video_path = _save_upload_file(
            upload_file,
            "uploads/tutors/videos",
            base_name,
            {".mp4", ".mov", ".webm"},
        )
        tutor.tutor_video = video_path

    db.commit()
    db.refresh(tutor)
    return _tutor_to_out(tutor)


def update_tutor(db: Session, tutor_id: int, tutor_data: UpdateTutorRequest) -> TutorOut:
    tutor = get_tutor_by_id(db, tutor_id)
    if not tutor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found")

    if tutor_data.email and tutor_data.email.lower() != tutor.email:
        existing = get_tutor_by_email(db, tutor_data.email.lower())
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Tutor with email '{tutor_data.email}' already exists",
            )

    if tutor_data.first_name is not None:
        tutor.first_name = tutor_data.first_name.strip()
    if tutor_data.last_name is not None:
        tutor.last_name = tutor_data.last_name.strip()
    if tutor_data.email is not None:
        tutor.email = tutor_data.email.lower()
    if tutor_data.password is not None:
        tutor.password = hash_password(tutor_data.password)
    if tutor_data.date_birth is not None:
        tutor.date_birth = tutor_data.date_birth
    if tutor_data.phone_number is not None:
        tutor.phone_number = tutor_data.phone_number
    if tutor_data.bio is not None:
        tutor.bio = tutor_data.bio
    if tutor_data.total_experience_years is not None:
        tutor.total_experience_years = tutor_data.total_experience_years
    if tutor_data.tution_type is not None:
        tutor.tution_type = tutor_data.tution_type

    db.commit()
    db.refresh(tutor)
    return _tutor_to_out(tutor)


def delete_tutor(db: Session, tutor_id: int) -> None:
    tutor = get_tutor_by_id(db, tutor_id)
    if not tutor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found")

    db.delete(tutor)
    db.commit()

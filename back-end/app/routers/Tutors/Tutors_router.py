from fastapi import APIRouter, Depends
from app.routers.Tutors import Tutor_out
from app.routers.Tutors import Tutor_out
from app.routers.Tutors import Tutor_create
from app.routers.Tutors.Tutor_out import TutorOut
from app.routers.Tutors.Tutor_create import CreateTutor
from app.routers.Tutors.Tutor_update import Tutor_update
from database import get_db


router = APIRouter(
    prefix="/tutors",
    tags=["Tutors"],
)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_current_student
from app.database import get_db
from app.models.admins import Admin
from app.models.students import Student
from app.schemas.students import CreateStudent, StudentOut, UpdateStudentRequest, AcceptedRequestsCountOut, RecentRequestOut, RecentRequestsOut
from app.services import student_service

router = APIRouter(
    prefix="/students",
    tags=["Students"],
)


@router.get("/", response_model=list[StudentOut])
def list_students(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return student_service.get_all_students_out(db)


@router.post("/", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
def create_student_endpoint(
    student: CreateStudent,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    return student_service.create_student(db, student)


@router.get("/me", response_model=StudentOut)
def get_me_student(current_student: Student = Depends(get_current_student)):
    return StudentOut.model_validate(current_student)


@router.patch("/me", response_model=StudentOut)
def update_me_student(
    body: UpdateStudentRequest,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    return student_service.update_student(db, current_student.student_id, body)


@router.get("/{student_id}", response_model=StudentOut)
def get_student_by_id(
    student_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    student = student_service.get_student_by_id_out(db, student_id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student


@router.patch("/{student_id}", response_model=StudentOut)
def update_student_endpoint(
    student_id: int,
    student: UpdateStudentRequest,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    return student_service.update_student(db, student_id, student)


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student_endpoint(
    student_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    student_service.delete_student(db, student_id)

@router.get("/me/accepted-requests-count", response_model=AcceptedRequestsCountOut)
def get_my_accepted_requests_count(
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    return student_service.get_accepted_requests_count(db, current_student.student_id)
 
 
@router.get("/me/recent-requests", response_model=RecentRequestsOut)
def get_my_recent_requests(
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    return student_service.get_recent_requests(db, current_student.student_id, limit=2)
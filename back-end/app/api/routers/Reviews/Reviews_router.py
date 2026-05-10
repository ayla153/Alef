from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_student
from app.database import get_db
from app.models.students import Student
from app.schemas.reviews import CreateReview, UpdateReviewRequest, ReviewOut
from app.services import review_service

router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"],
)

@router.get("/", response_model=list[ReviewOut])
def list_reviews(
    db: Session = Depends(get_db),
):
    return review_service.get_all_reviews_out(db)


@router.post("/", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def create_review_endpoint(
    review: CreateReview,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    return review_service.create_review(db, current_student, review)


@router.get("/my-reviews", response_model=list[ReviewOut])
def get_my_reviews(
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    return review_service.get_reviews_by_student_out(db, current_student.student_id)


@router.get("/tutor/{tutor_id}", response_model=list[ReviewOut])
def get_reviews_by_tutor(
    tutor_id: int,
    db: Session = Depends(get_db),
):
    return review_service.get_reviews_by_tutor_out(db, tutor_id)


@router.get("/{review_id}", response_model=ReviewOut)
def get_review_by_id(
    review_id: int,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    review = review_service.get_review_by_id_out(db, review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    # Check if the review belongs to the current student
    if review.student_id != current_student.student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own reviews",
        )
    return review


@router.patch("/{review_id}", response_model=ReviewOut)
def update_review(
    review_id: int,
    review: UpdateReviewRequest,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    return review_service.update_review(db, review_id, current_student, review)


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    review_service.delete_review(db, review_id, current_student)
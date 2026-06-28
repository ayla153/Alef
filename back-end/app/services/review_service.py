from typing import List
from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.models.reviews import Review
from app.models.students import Student
from app.models.tutors import Tutor
from app.schemas.reviews import CreateReview, UpdateReviewRequest, ReviewOut


def get_review_by_id(db: Session, review_id: int) -> Review | None:
    return db.get(Review, review_id)


def get_reviews_by_student(db: Session, student_id: int) -> List[Review]:
    return db.scalars(
        select(Review)
        .options(joinedload(Review.student))
        .where(Review.student_id == student_id)
    ).all()


def get_reviews_by_tutor(db: Session, tutor_id: int) -> List[Review]:
    return db.scalars(
        select(Review)
        .options(joinedload(Review.student))
        .where(Review.tutor_id == tutor_id)
    ).all()


def review_to_out(review: Review) -> ReviewOut:
    student_first_name = review.student.first_name.strip() if review.student else None
    return ReviewOut(
        review_id=review.review_id,
        tutor_id=review.tutor_id,
        student_id=review.student_id,
        student_first_name=student_first_name,
        number_of_stars=review.number_of_stars,
        comment=review.comment,
        created_at=review.created_at,
    )


def get_all_reviews_out(db: Session) -> List[ReviewOut]:
    reviews = db.scalars(select(Review).options(joinedload(Review.student))).all()
    return [review_to_out(review) for review in reviews]


def get_review_by_id_out(db: Session, review_id: int) -> ReviewOut | None:
    review = get_review_by_id(db, review_id)
    if not review:
        return None
    return review_to_out(review)


def get_reviews_by_student_out(db: Session, student_id: int) -> List[ReviewOut]:
    reviews = get_reviews_by_student(db, student_id)
    return [review_to_out(review) for review in reviews]


def get_reviews_by_tutor_out(db: Session, tutor_id: int) -> List[ReviewOut]:
    reviews = get_reviews_by_tutor(db, tutor_id)
    return [review_to_out(review) for review in reviews]


def create_review(db: Session, student: Student, review_data: CreateReview) -> ReviewOut:
    # Check if tutor exists
    tutor = db.get(Tutor, review_data.tutor_id)
    if not tutor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tutor not found",
        )

    # Check if student already reviewed this tutor
    existing_review = db.scalar(
        select(Review).where(
            Review.student_id == student.student_id,
            Review.tutor_id == review_data.tutor_id
        )
    )
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already reviewed this tutor",
        )

    review = Review(
        student_id=student.student_id,
        tutor_id=review_data.tutor_id,
        number_of_stars=review_data.number_of_stars,
        comment=review_data.comment,
        created_at=datetime.utcnow(),
    )

    db.add(review)
    try:
        db.commit()
        db.refresh(review)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Failed to create review",
        )

    review = db.scalar(
        select(Review)
        .options(joinedload(Review.student))
        .where(Review.review_id == review.review_id)
    )
    assert review is not None
    return review_to_out(review)


def update_review(db: Session, review_id: int, student: Student, review_data: UpdateReviewRequest) -> ReviewOut:
    review = get_review_by_id(db, review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    # Check if the review belongs to the current student
    if review.student_id != student.student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own reviews",
        )

    if review_data.tutor_id is not None:
        # Check if tutor exists
        tutor = db.get(Tutor, review_data.tutor_id)
        if not tutor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tutor not found",
            )
        review.tutor_id = review_data.tutor_id

    if review_data.number_of_stars is not None:
        review.number_of_stars = review_data.number_of_stars

    if review_data.comment is not None:
        review.comment = review_data.comment

    db.commit()
    db.refresh(review)
    loaded = db.scalar(
        select(Review)
        .options(joinedload(Review.student))
        .where(Review.review_id == review.review_id)
    )
    assert loaded is not None
    return review_to_out(loaded)


def delete_review(db: Session, review_id: int, student: Student) -> None:
    review = get_review_by_id(db, review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    # Check if the review belongs to the current student
    if review.student_id != student.student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own reviews",
        )

    db.delete(review)
    db.commit()
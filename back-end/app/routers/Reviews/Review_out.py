from pydantic import BaseModel
from datetime import date, datetime

class ReviewOut(BaseModel):
    review_id: int
    tutor_id: int
    student_id: int
    rating: int
    comment: str
    created_at: datetime
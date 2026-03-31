from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional, List
from app.schemas.enums import TuitionTypeEnum
from app.api.routers.Reviews.Review_out import ReviewOut
from app.api.routers.Addresses.Address_out import AddressOut

class TutorOut(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        use_enum_values=True,  # Serialize enum as string
    )

    tutor_id: int
    first_name: str
    last_name: str
    email: str
    date_birth: date
    phone_number: str
    tutor_photo: Optional[str] = None
    tutor_video: Optional[str] = None
    bio: Optional[str] = None
    total_experience_years: Optional[int] = None
    registered_at: datetime
    tuition_type: TuitionTypeEnum
    verified: bool
    reviews: Optional[List[ReviewOut]] = None
    reviews_avg: float = 0.0
    reviews_count: int = 0
    Address: Optional[AddressOut] = None
    subjects: List[str] = []

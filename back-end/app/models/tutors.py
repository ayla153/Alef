from sqlalchemy import Enum, Integer, String, TIMESTAMP, Text
from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING, Optional, List
from datetime import datetime, date
from app.schemas.enums import TuitionTypeEnum, enum_values_callable, gender_enum

if TYPE_CHECKING:
    from app.models.addresses import Address
    from app.models.favorites import Favorite
    from app.models.reviews import Review
    from app.models.lead_applications import LeadApplication
    from app.models.lead_targets import LeadTarget
    from app.models.tutor_subjects import TutorSubject

class Tutor(Base):
    __tablename__ = "tutors"

    tutor_id : Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    first_name: Mapped[str] = mapped_column(String(50),nullable=False)
    last_name: Mapped[str] = mapped_column(String(50),nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)
    date_birth: Mapped[date] = mapped_column(TIMESTAMP, nullable=False)
    phone_number: Mapped[Optional[str]] = mapped_column(String(20),nullable=False)
    tutor_photo: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tutor_video: Mapped[Optional[str]] = mapped_column(String,nullable=True)
    bio: Mapped[str] = mapped_column(String(500),nullable=True)
    total_experience_years: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    registered_at: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False)
    tution_type: Mapped[TuitionTypeEnum] = mapped_column(
        Enum(TuitionTypeEnum, values_callable=enum_values_callable),
        nullable=False,
    )
    verified: Mapped[bool] = mapped_column(nullable=False, default=False)
    email_verified: Mapped[bool] = mapped_column(nullable=False, default=False)
    is_banned: Mapped[bool] = mapped_column(nullable=False, default=False)
    banned_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP, nullable=True)
    gender: Mapped[Optional[gender_enum]] = mapped_column(
        Enum(gender_enum, values_callable=enum_values_callable),
        nullable=True,
    )

    #relationships
    favorites : Mapped[List["Favorite"]] = relationship("Favorite", back_populates="tutor", cascade="all, delete-orphan")
    reviews : Mapped[List["Review"]] = relationship("Review", back_populates="tutor", cascade="all, delete-orphan")
    lead_targets: Mapped[List["LeadTarget"]] = relationship("LeadTarget", back_populates="tutor")
    lead_applications: Mapped[List["LeadApplication"]] = relationship(
        "LeadApplication",
        back_populates="tutor",
    )
    tutor_subjects : Mapped[List["TutorSubject"]] = relationship("TutorSubject", back_populates="tutor")
    address : Mapped[Optional["Address"]] = relationship("Address", back_populates="tutor", uselist=False, cascade="all, delete-orphan")
    
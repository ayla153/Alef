from sqlalchemy import Integer, String, TIMESTAMP, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from app.schemas.enums import student_grade_enum

if TYPE_CHECKING:
    from app.models.addresses import Address
    from app.models.favorites import Favorite
    from app.models.reviews import Review
    from app.models.post_requirements import PostRequirement

class Student(Base):
    __tablename__ = "students"

    student_id : Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    first_name: Mapped[str] = mapped_column(String(50),nullable=False)
    last_name: Mapped[str] = mapped_column(String(50),nullable=False)
    date_birth: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)
    phone_number: Mapped[Optional[str]] = mapped_column(String(20),nullable=False)
    student_photo:Mapped[Optional[str]] = mapped_column(String,nullable=True)
    registered_at: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False)
    grade_level: Mapped[student_grade_enum] = mapped_column(SAEnum(student_grade_enum), nullable=False)
    #relationships
    favorites : Mapped[List["Favorite"]] = relationship("Favorite", back_populates="student", cascade="all, delete-orphan")
    reviews : Mapped[List["Review"]] = relationship("Review", back_populates="student", cascade="all, delete-orphan")
    post_requirements : Mapped[List["PostRequirement"]] = relationship("PostRequirement", back_populates="student", cascade="all, delete-orphan")
    address : Mapped[Optional["Address"]] = relationship("Address", back_populates="student", uselist=False, cascade="all, delete-orphan")

from sqlalchemy import Integer, ForeignKey
from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
     from app.models.areas import Area
     from app.models.cities import City
     from app.models.students import Student
     from app.models.tutors import Tutor

class Address(Base):
    __tablename__ = "addresses"

    address_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    #foreign keys
    student_id: Mapped[Optional[int]] = mapped_column(ForeignKey("students.student_id"), nullable=True, unique=True, index=True)
    tutor_id: Mapped[Optional[int]] = mapped_column(ForeignKey("tutors.tutor_id"), nullable=True, unique=True, index=True)
    city_id: Mapped[int] = mapped_column(ForeignKey("cities.city_id"), nullable=False)
    area_id: Mapped[int] = mapped_column(ForeignKey("areas.area_id"), nullable=False)

    #relationships
    student : Mapped[Optional["Student"]] = relationship("Student", back_populates="address")
    tutor : Mapped[Optional["Tutor"]] = relationship("Tutor", back_populates="address")
    city : Mapped["City"] = relationship("City", back_populates="addresses")
    area : Mapped["Area"] = relationship("Area", back_populates="addresses")
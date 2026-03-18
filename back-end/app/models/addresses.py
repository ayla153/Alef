from sqlalchemy import Integer, ForeignKey
from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional

class Address(Base):
    __tablename__ = "addresses"

    address_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    #foreign keys
    student_id: Mapped[Optional[int]] = mapped_column(ForeignKey("students.student_id"), nullable=True)
    tutor_id: Mapped[Optional[int]] = mapped_column(ForeignKey("tutors.tutor_id"), nullable=True)
    city_id: Mapped[int] = mapped_column(ForeignKey("cities.city_id"), nullable=False)
    area_id: Mapped[int] = mapped_column(ForeignKey("areas.area_id"), nullable=False)

    #relationships
    student = relationship("Student", back_populates="address")
    tutor = relationship("Tutor", back_populates="address")
    city = relationship("City", back_populates="addresses")
    area = relationship("Area", back_populates="addresses")
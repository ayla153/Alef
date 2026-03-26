from app.database import Base
from sqlalchemy import String, Integer, UniqueConstraint , ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.addresses import Address
    from app.models.cities import City
class Area(Base):
    __tablename__ = "areas"

    area_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)

    #foreign keys
    city_id: Mapped[int] = mapped_column(ForeignKey("cities.city_id"), nullable=False)
    #relationships
    addresses : Mapped[List["Address"]] = relationship("Address", back_populates="area")
    city: Mapped["City"] = relationship("City", back_populates="areas")
    
    # Unique constraint: area title must be unique within the same city
    __table_args__ = (
            UniqueConstraint("title", "city_id", name="uq_area_title_per_city"),
        )
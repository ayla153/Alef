from app.database import Base
from sqlalchemy import String, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

class Area(Base):
    __tablename__ = "areas"

    area_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)

    #relationships
    addresses = relationship("Address", back_populates="area")

    # Unique constraint: area title must be unique within the same city
    __table_args__ = (
            UniqueConstraint("title", "city_id", name="uq_area_title_per_city"),
        )
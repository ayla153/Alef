from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class City(Base):
    __tablename__ = "cities"

    city_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)

    #relationships
    addresses = relationship("Address", back_populates="city")
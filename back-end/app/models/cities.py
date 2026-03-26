from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.addresses import Address
    from app.models.areas import Area


class City(Base):
    __tablename__ = "cities"

    city_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)

    #relationships
    addresses : Mapped[List["Address"]] = relationship("Address", back_populates="city")
    areas : Mapped[List["Area"]] = relationship("Area", back_populates="city")
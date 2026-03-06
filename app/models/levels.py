from sqlalchemy import Integer, String
from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column

class Level(Base):
    __tablename__ = "levels"

    level_id : Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    level_title: Mapped[str] = mapped_column(String(100), nullable=False)

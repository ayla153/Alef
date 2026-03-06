from sqlalchemy import Integer, String
from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column

class Subject(Base):
    __tablename__ = "subjects"

    subject_id : Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    subject_title: Mapped[str] = mapped_column(String(100), nullable=False)
    subject_description: Mapped[str] = mapped_column(String(500), nullable=True)
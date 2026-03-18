from sqlalchemy import Enum, Integer, Enum, ForeignKey
from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.schemas.enums import post_status_enum

class PostStatus(Base):
    __tablename__ = "post_status"

    post_status_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    post_status: Mapped[post_status_enum] = mapped_column(Enum(post_status_enum), nullable=False)

    #foreign keys
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.post_id"), nullable=False)
    tutor_id: Mapped[int] = mapped_column(ForeignKey("tutors.tutor_id"), nullable=False)

    #relationships
    posts = relationship("Post", back_populates="post_status")
    tutor = relationship("Tutor", back_populates="post_statuses")
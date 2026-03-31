from sqlalchemy import Enum, Integer, ForeignKey
from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.schemas.enums import post_status_enum
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.post_requirements import PostRequirement
    from app.models.tutors import Tutor

class PostStatus(Base):
    __tablename__ = "post_status"

    post_status_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    post_status: Mapped[post_status_enum] = mapped_column(Enum(post_status_enum), nullable=False)

    #foreign keys
    post_requirements_id: Mapped[int] = mapped_column(
        ForeignKey("post_requirements.post_requirements_id"),
        nullable=False,
        unique=True,
    )
    tutor_id: Mapped[int] = mapped_column(ForeignKey("tutors.tutor_id"), nullable=False)

    #relationships
    post : Mapped["PostRequirement"] = relationship("PostRequirement", back_populates="post_status")
    tutor : Mapped["Tutor"] = relationship("Tutor", back_populates="post_statuses")
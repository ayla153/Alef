from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from app.database import Base

if TYPE_CHECKING:
    from app.models.post_requirements import PostRequirement
    from app.models.tutors import Tutor


class LeadTarget(Base):
    """Private lead only: one row links a lead to the single tutor from «تواصل مع هذا المعلّم».

    If a post_requirements row has lead_target, it is a private lead (not a public marketplace post).
    Public leads have no lead_targets row. Endpoints in SCRUM-62 create and manage this flow.
    """

    __tablename__ = "lead_targets"

    lead_target_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    post_requirements_id: Mapped[int] = mapped_column(
        ForeignKey("post_requirements.post_requirements_id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    tutor_id: Mapped[int] = mapped_column(
        ForeignKey("tutors.tutor_id", ondelete="CASCADE"),
        nullable=False,
    )

    lead: Mapped["PostRequirement"] = relationship("PostRequirement", back_populates="lead_target")
    tutor: Mapped["Tutor"] = relationship("Tutor", back_populates="lead_targets")

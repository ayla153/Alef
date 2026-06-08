from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Enum, Float, ForeignKey, Integer, String, TIMESTAMP, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.schemas.enums import LeadApplicationStatusEnum, enum_values_callable

if TYPE_CHECKING:
    from app.models.post_requirements import PostRequirement
    from app.models.tutors import Tutor


class LeadApplication(Base):
    __tablename__ = "lead_applications"
    __table_args__ = (
        UniqueConstraint("post_requirements_id", "tutor_id", name="uq_lead_application_tutor"),
    )

    lead_application_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    proposed_fee: Mapped[float] = mapped_column(Float, nullable=False)
    first_session_note: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(String(500), nullable=False)
    application_status: Mapped[LeadApplicationStatusEnum] = mapped_column(
        Enum(LeadApplicationStatusEnum, values_callable=enum_values_callable),
        nullable=False,
        default=LeadApplicationStatusEnum.PENDING,
    )
    contact_revealed_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP, nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False)

    post_requirements_id: Mapped[int] = mapped_column(
        ForeignKey("post_requirements.post_requirements_id", ondelete="CASCADE"),
        nullable=False,
    )
    tutor_id: Mapped[int] = mapped_column(
        ForeignKey("tutors.tutor_id", ondelete="CASCADE"),
        nullable=False,
    )

    lead: Mapped["PostRequirement"] = relationship("PostRequirement", back_populates="lead_applications")
    tutor: Mapped["Tutor"] = relationship("Tutor", back_populates="lead_applications")

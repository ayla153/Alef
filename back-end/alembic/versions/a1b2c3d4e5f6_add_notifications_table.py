"""Add notifications table

Revision ID: a1b2c3d4e5f6
Revises: f3a1b2c4d5e6
Create Date: 2026-06-21 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "f3a1b2c4d5e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


NOTIFICATION_TYPE_ENUM = postgresql.ENUM(
    "public_lead_created",
    "public_lead_slots_full",
    "public_lead_expired",
    "public_lead_closed_matched",
    "public_lead_closed_no_match",
    "new_offer_received",
    "offer_accepted",
    "offer_rejected",
    "offer_slot_opened",
    "private_lead_received",
    "private_lead_accepted",
    "private_lead_rejected",
    "new_tutor_pending",
    "tutor_verified",
    "tutor_verification_rejected",
    name="notificationtypeenum",
    create_type=False,
)


def upgrade() -> None:
    bind = op.get_bind()
    op.execute(
        """
        DO $$ BEGIN
            CREATE TYPE notificationtypeenum AS ENUM (
                'public_lead_created',
                'public_lead_slots_full',
                'public_lead_expired',
                'public_lead_closed_matched',
                'public_lead_closed_no_match',
                'new_offer_received',
                'offer_accepted',
                'offer_rejected',
                'offer_slot_opened',
                'private_lead_received',
                'private_lead_accepted',
                'private_lead_rejected',
                'new_tutor_pending',
                'tutor_verified',
                'tutor_verification_rejected'
            );
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
        """
    )

    inspector = sa.inspect(bind)
    if "notifications" in inspector.get_table_names():
        return

    op.create_table(
        "notifications",
        sa.Column("notification_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("recipient_type", sa.String(length=20), nullable=False),
        sa.Column("recipient_id", sa.Integer(), nullable=False),
        sa.Column("notification_type", NOTIFICATION_TYPE_ENUM, nullable=False),
        sa.Column("title", sa.String(length=120), nullable=False),
        sa.Column("body", sa.String(length=500), nullable=False),
        sa.Column("data", sa.JSON(), nullable=True),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.text("FALSE")),
        sa.Column("read_at", sa.TIMESTAMP(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(), nullable=False, server_default=sa.text("NOW()")),
        sa.PrimaryKeyConstraint("notification_id"),
    )


def downgrade() -> None:
    op.drop_table("notifications")
    op.execute("DROP TYPE IF EXISTS notificationtypeenum CASCADE")

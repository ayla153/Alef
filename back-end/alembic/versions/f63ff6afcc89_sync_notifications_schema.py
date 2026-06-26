"""sync notifications schema

Revision ID: f63ff6afcc89
Revises: a1b2c3d4e5f6
Create Date: 2026-06-22 14:43:34.631848

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f63ff6afcc89'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _notification_column_names(bind) -> set[str]:
    inspector = sa.inspect(bind)
    return {column["name"] for column in inspector.get_columns("notifications")}


def _notification_type_needs_enum_migration(bind) -> bool:
    udt_name = bind.execute(
        sa.text(
            """
            SELECT udt_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'notifications'
              AND column_name = 'notification_type'
            """
        )
    ).scalar()
    return udt_name == "varchar"


def _notification_type_is_varchar(bind) -> bool:
    return _notification_type_needs_enum_migration(bind)


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    columns = _notification_column_names(bind)

    if "recipient_type" not in columns:
        op.add_column(
            "notifications",
            sa.Column("recipient_type", sa.String(length=20), nullable=False),
        )
    if "body" not in columns:
        op.add_column(
            "notifications",
            sa.Column("body", sa.String(length=500), nullable=False),
        )
    if "data" not in columns:
        op.add_column("notifications", sa.Column("data", sa.JSON(), nullable=True))
    if "read_at" not in columns:
        op.add_column("notifications", sa.Column("read_at", sa.TIMESTAMP(), nullable=True))

    if _notification_type_needs_enum_migration(bind):
        op.execute(
            """
            DO $$ BEGIN
                CREATE TYPE notificationtype AS ENUM (
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
        op.alter_column(
            "notifications",
            "notification_type",
            existing_type=sa.VARCHAR(length=60),
            type_=sa.Enum(
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
                name="notificationtype",
            ),
            existing_nullable=False,
            postgresql_using="notification_type::notificationtype",
        )

    columns = _notification_column_names(bind)
    for legacy_column in (
        "related_type",
        "actor_id",
        "actor_role",
        "related_id",
        "message",
        "recipient_role",
    ):
        if legacy_column in columns:
            op.drop_column("notifications", legacy_column)


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    columns = _notification_column_names(bind)

    if "recipient_role" not in columns:
        op.add_column(
            "notifications",
            sa.Column("recipient_role", sa.VARCHAR(length=20), autoincrement=False, nullable=False),
        )
    if "message" not in columns:
        op.add_column(
            "notifications",
            sa.Column("message", sa.TEXT(), autoincrement=False, nullable=False),
        )
    if "related_id" not in columns:
        op.add_column(
            "notifications",
            sa.Column("related_id", sa.INTEGER(), autoincrement=False, nullable=True),
        )
    if "actor_role" not in columns:
        op.add_column(
            "notifications",
            sa.Column("actor_role", sa.VARCHAR(length=20), autoincrement=False, nullable=True),
        )
    if "actor_id" not in columns:
        op.add_column(
            "notifications",
            sa.Column("actor_id", sa.INTEGER(), autoincrement=False, nullable=True),
        )
    if "related_type" not in columns:
        op.add_column(
            "notifications",
            sa.Column("related_type", sa.VARCHAR(length=40), autoincrement=False, nullable=True),
        )

    if not _notification_type_is_varchar(bind):
        op.alter_column(
            "notifications",
            "notification_type",
            existing_type=sa.Enum(
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
                name="notificationtype",
            ),
            type_=sa.VARCHAR(length=60),
            existing_nullable=False,
        )

    columns = _notification_column_names(bind)
    for new_column in ("read_at", "data", "body", "recipient_type"):
        if new_column in columns:
            op.drop_column("notifications", new_column)

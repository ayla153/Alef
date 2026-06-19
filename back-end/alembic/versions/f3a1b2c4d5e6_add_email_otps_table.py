"""Add email_otps table for OTP verification

Revision ID: f3a1b2c4d5e6
Revises: e7b2c4d91f05
Create Date: 2026-06-19 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "f3a1b2c4d5e6"
down_revision: Union[str, Sequence[str], None] = "e7b2c4d91f05"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

OTP_PURPOSE_ENUM = postgresql.ENUM(
    "registration",
    "password_reset",
    name="otppurposeenum",
    create_type=False,
)
AUTH_USER_ROLE_ENUM = postgresql.ENUM(
    "student",
    "tutor",
    name="authuserroleenum",
    create_type=False,
)


def upgrade() -> None:
    bind = op.get_bind()
    op.execute(
        """
        DO $$ BEGIN
            CREATE TYPE otppurposeenum AS ENUM ('registration', 'password_reset');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
        """
    )
    op.execute(
        """
        DO $$ BEGIN
            CREATE TYPE authuserroleenum AS ENUM ('student', 'tutor');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
        """
    )

    inspector = sa.inspect(bind)
    if "email_otps" in inspector.get_table_names():
        return

    op.create_table(
        "email_otps",
        sa.Column("otp_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("email", sa.String(length=100), nullable=False),
        sa.Column("code_hash", sa.String(), nullable=False),
        sa.Column("purpose", OTP_PURPOSE_ENUM, nullable=False),
        sa.Column("role", AUTH_USER_ROLE_ENUM, nullable=False),
        sa.Column("expires_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("used_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("otp_id"),
    )
    op.create_index(op.f("ix_email_otps_email"), "email_otps", ["email"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_email_otps_email"), table_name="email_otps")
    op.drop_table("email_otps")
    op.execute("DROP TYPE IF EXISTS otppurposeenum CASCADE")
    op.execute("DROP TYPE IF EXISTS authuserroleenum CASCADE")

"""Add email_otps table for OTP verification

Revision ID: f3a1b2c4d5e6
Revises: e7b2c4d91f05
Create Date: 2026-06-19 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f3a1b2c4d5e6"
down_revision: Union[str, Sequence[str], None] = "e7b2c4d91f05"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        sa.text(
            """
            DO $$ BEGIN
                CREATE TYPE otppurposeenum AS ENUM ('registration', 'password_reset');
            EXCEPTION
                WHEN duplicate_object THEN NULL;
            END $$;
            """
        )
    )
    op.execute(
        sa.text(
            """
            DO $$ BEGIN
                CREATE TYPE authuserroleenum AS ENUM ('student', 'tutor');
            EXCEPTION
                WHEN duplicate_object THEN NULL;
            END $$;
            """
        )
    )
    op.execute(
        sa.text(
            """
            CREATE TABLE IF NOT EXISTS email_otps (
                otp_id SERIAL PRIMARY KEY,
                email VARCHAR(100) NOT NULL,
                code_hash VARCHAR NOT NULL,
                purpose otppurposeenum NOT NULL,
                role authuserroleenum NOT NULL,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                used_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL
            );
            """
        )
    )
    op.execute(
        sa.text(
            """
            CREATE INDEX IF NOT EXISTS ix_email_otps_email ON email_otps (email);
            """
        )
    )


def downgrade() -> None:
    op.execute(sa.text("DROP INDEX IF EXISTS ix_email_otps_email"))
    op.execute(sa.text("DROP TABLE IF EXISTS email_otps"))
    op.execute(sa.text("DROP TYPE IF EXISTS otppurposeenum"))
    op.execute(sa.text("DROP TYPE IF EXISTS authuserroleenum"))

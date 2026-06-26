"""Add pending tutor registrations and tutor email_verified

Revision ID: a1b2c3d4e5f7
Revises: f3a1b2c4d5e6
Create Date: 2026-06-26 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f7"
down_revision: Union[str, Sequence[str], None] = "f3a1b2c4d5e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        sa.text(
            """
            CREATE TABLE IF NOT EXISTS pending_tutor_registrations (
                pending_id SERIAL PRIMARY KEY,
                email VARCHAR(100) NOT NULL UNIQUE,
                password_hash VARCHAR NOT NULL,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                date_birth DATE NOT NULL,
                phone_number VARCHAR(20) NOT NULL,
                step2_data JSONB,
                step3_data JSONB,
                step4_data JSONB,
                current_step INTEGER NOT NULL DEFAULT 1,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL
            );
            """
        )
    )
    op.execute(
        sa.text(
            """
            ALTER TABLE tutors
            ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;
            """
        )
    )
    op.execute(sa.text("UPDATE tutors SET email_verified = true"))


def downgrade() -> None:
    op.execute(sa.text("ALTER TABLE tutors DROP COLUMN IF EXISTS email_verified"))
    op.execute(sa.text("DROP TABLE IF EXISTS pending_tutor_registrations"))

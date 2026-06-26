"""Add gender to tutors and pending tutor registrations

Revision ID: d1e2f3a4b5c6
Revises: c3d4e5f6a9b0, dcc2f2d129c3
Create Date: 2026-06-26 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d1e2f3a4b5c6"
down_revision: Union[str, Sequence[str], None] = ("c3d4e5f6a9b0", "dcc2f2d129c3")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        sa.text(
            """
            DO $$ BEGIN
                CREATE TYPE gender_enum AS ENUM ('male', 'female');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
            """
        )
    )
    op.execute(
        sa.text(
            """
            ALTER TABLE tutors
            ADD COLUMN IF NOT EXISTS gender gender_enum;
            """
        )
    )
    op.execute(
        sa.text(
            """
            ALTER TABLE pending_tutor_registrations
            ADD COLUMN IF NOT EXISTS gender gender_enum;
            """
        )
    )


def downgrade() -> None:
    op.execute(sa.text("ALTER TABLE pending_tutor_registrations DROP COLUMN IF EXISTS gender"))
    op.execute(sa.text("ALTER TABLE tutors DROP COLUMN IF EXISTS gender"))

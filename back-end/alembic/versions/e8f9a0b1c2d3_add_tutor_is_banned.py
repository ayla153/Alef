"""Add tutor is_banned soft-delete flag

Revision ID: e8f9a0b1c2d3
Revises: e2f3a4b5c6d7
Create Date: 2026-06-26 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e8f9a0b1c2d3"
down_revision: Union[str, Sequence[str], None] = "e2f3a4b5c6d7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        sa.text(
            """
            ALTER TABLE tutors
            ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT false;
            """
        )
    )
    op.execute(
        sa.text(
            """
            ALTER TABLE tutors
            ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP NULL;
            """
        )
    )


def downgrade() -> None:
    op.execute(sa.text("ALTER TABLE tutors DROP COLUMN IF EXISTS banned_at;"))
    op.execute(sa.text("ALTER TABLE tutors DROP COLUMN IF EXISTS is_banned;"))

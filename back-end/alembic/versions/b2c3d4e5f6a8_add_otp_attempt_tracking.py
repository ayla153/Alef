"""Add OTP attempt tracking and lockout columns

Revision ID: b2c3d4e5f6a8
Revises: a1b2c3d4e5f7
Create Date: 2026-06-26 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b2c3d4e5f6a8"
down_revision: Union[str, Sequence[str], None] = "a1b2c3d4e5f7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        sa.text(
            """
            ALTER TABLE email_otps
            ADD COLUMN IF NOT EXISTS attempt_count INTEGER NOT NULL DEFAULT 0;
            """
        )
    )
    op.execute(
        sa.text(
            """
            ALTER TABLE email_otps
            ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;
            """
        )
    )


def downgrade() -> None:
    op.execute(sa.text("ALTER TABLE email_otps DROP COLUMN IF EXISTS locked_until"))
    op.execute(sa.text("ALTER TABLE email_otps DROP COLUMN IF EXISTS attempt_count"))

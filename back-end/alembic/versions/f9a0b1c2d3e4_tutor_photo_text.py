"""Store tutor profile photos in DB (TEXT for base64 data URLs)

Revision ID: f9a0b1c2d3e4
Revises: e8f9a0b1c2d3
Create Date: 2026-06-26 23:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f9a0b1c2d3e4"
down_revision: Union[str, Sequence[str], None] = "e8f9a0b1c2d3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        sa.text(
            """
            ALTER TABLE tutors
            ALTER COLUMN tutor_photo TYPE TEXT
            USING tutor_photo::text;
            """
        )
    )


def downgrade() -> None:
    op.execute(
        sa.text(
            """
            ALTER TABLE tutors
            ALTER COLUMN tutor_photo TYPE VARCHAR
            USING LEFT(tutor_photo, 255);
            """
        )
    )

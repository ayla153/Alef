"""Add lead wizard fields: help_type, fee range, weekly_classes

Revision ID: e2f3a4b5c6d7
Revises: d1e2f3a4b5c6
Create Date: 2026-06-26 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e2f3a4b5c6d7"
down_revision: Union[str, Sequence[str], None] = "d1e2f3a4b5c6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        sa.text(
            """
            DO $$ BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'post_requirements'
                      AND column_name = 'expected_fee'
                ) AND NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'post_requirements'
                      AND column_name = 'max_expected_fee'
                ) THEN
                    ALTER TABLE post_requirements
                    RENAME COLUMN expected_fee TO max_expected_fee;
                END IF;
            END $$;
            """
        )
    )

    op.execute(
        sa.text(
            """
            ALTER TABLE post_requirements
            ADD COLUMN IF NOT EXISTS help_type VARCHAR(100);
            """
        )
    )
    op.execute(
        sa.text(
            """
            UPDATE post_requirements
            SET help_type = 'غير محدد'
            WHERE help_type IS NULL;
            """
        )
    )
    op.execute(
        sa.text(
            """
            ALTER TABLE post_requirements
            ALTER COLUMN help_type SET NOT NULL;
            """
        )
    )

    op.execute(
        sa.text(
            """
            ALTER TABLE post_requirements
            ADD COLUMN IF NOT EXISTS min_expected_fee DOUBLE PRECISION;
            """
        )
    )
    op.execute(
        sa.text(
            """
            UPDATE post_requirements
            SET min_expected_fee = 50
            WHERE min_expected_fee IS NULL;
            """
        )
    )
    op.execute(
        sa.text(
            """
            ALTER TABLE post_requirements
            ALTER COLUMN min_expected_fee SET NOT NULL;
            """
        )
    )

    op.execute(
        sa.text(
            """
            ALTER TABLE post_requirements
            ADD COLUMN IF NOT EXISTS weekly_classes INTEGER;
            """
        )
    )
    op.execute(
        sa.text(
            """
            UPDATE post_requirements
            SET weekly_classes = 1
            WHERE weekly_classes IS NULL;
            """
        )
    )
    op.execute(
        sa.text(
            """
            ALTER TABLE post_requirements
            ALTER COLUMN weekly_classes SET NOT NULL;
            """
        )
    )


def downgrade() -> None:
    op.execute(sa.text("ALTER TABLE post_requirements DROP COLUMN IF EXISTS weekly_classes"))
    op.execute(sa.text("ALTER TABLE post_requirements DROP COLUMN IF EXISTS min_expected_fee"))
    op.execute(sa.text("ALTER TABLE post_requirements DROP COLUMN IF EXISTS help_type"))

    op.execute(
        sa.text(
            """
            DO $$ BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'post_requirements'
                      AND column_name = 'max_expected_fee'
                ) AND NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'post_requirements'
                      AND column_name = 'expected_fee'
                ) THEN
                    ALTER TABLE post_requirements
                    RENAME COLUMN max_expected_fee TO expected_fee;
                END IF;
            END $$;
            """
        )
    )

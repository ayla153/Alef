"""Leads platform foundation

Revision ID: d4e8f1a20b33
Revises: ca6c04f12319
Create Date: 2026-06-05 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from migration_helpers import column_exists, table_exists


# revision identifiers, used by Alembic.
revision: str = "d4e8f1a20b33"
down_revision: Union[str, Sequence[str], None] = "ca6c04f12319"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

LEAD_STATUS_ENUM = sa.Enum(
    "open",
    "closed_shortlist",
    "closed_empty",
    "closed_matched",
    "closed_expired",
    name="leadstatusenum",
)
LEAD_APPLICATION_STATUS_ENUM = sa.Enum(
    "pending",
    "rejected",
    "withdrawn",
    name="leadapplicationstatusenum",
)


def upgrade() -> None:
    bind = op.get_bind()

    if column_exists("post_requirements", "lead_status"):
        if table_exists("post_status"):
            op.drop_table("post_status")
        return

    # Base.metadata.create_all() may have created lead tables with
    # UPPERCASE enum labels (OPEN, PENDING). This migration uses lowercase
    # values (open, pending) matching LeadStatusEnum.value.
    if table_exists("lead_applications"):
        op.execute("DROP TABLE IF EXISTS lead_applications CASCADE")
    if table_exists("lead_targets"):
        op.execute("DROP TABLE IF EXISTS lead_targets CASCADE")
    op.execute("DROP TYPE IF EXISTS leadapplicationstatusenum CASCADE")
    op.execute("DROP TYPE IF EXISTS leadstatusenum CASCADE")

    LEAD_STATUS_ENUM.create(bind, checkfirst=False)

    if not column_exists("post_requirements", "lead_status"):
        op.add_column(
            "post_requirements",
            sa.Column(
                "lead_status",
                LEAD_STATUS_ENUM,
                nullable=False,
                server_default=sa.text("'open'::leadstatusenum"),
            ),
        )
    if not column_exists("post_requirements", "is_public"):
        op.add_column(
            "post_requirements",
            sa.Column("is_public", sa.Boolean(), nullable=False, server_default=sa.true()),
        )
    if not column_exists("post_requirements", "accepting_applications"):
        op.add_column(
            "post_requirements",
            sa.Column(
                "accepting_applications",
                sa.Boolean(),
                nullable=False,
                server_default=sa.true(),
            ),
        )
    if not column_exists("post_requirements", "closed_at"):
        op.add_column(
            "post_requirements",
            sa.Column("closed_at", sa.TIMESTAMP(), nullable=True),
        )
    if not column_exists("post_requirements", "max_applications"):
        op.add_column(
            "post_requirements",
            sa.Column(
                "max_applications",
                sa.Integer(),
                nullable=False,
                server_default="5",
            ),
        )

    if not table_exists("lead_targets"):
        op.create_table(
            "lead_targets",
            sa.Column("lead_target_id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("post_requirements_id", sa.Integer(), nullable=False),
            sa.Column("tutor_id", sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(
                ["post_requirements_id"],
                ["post_requirements.post_requirements_id"],
                ondelete="CASCADE",
            ),
            sa.ForeignKeyConstraint(["tutor_id"], ["tutors.tutor_id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("lead_target_id"),
            sa.UniqueConstraint("post_requirements_id"),
        )

    if not table_exists("lead_applications"):
        op.create_table(
            "lead_applications",
            sa.Column("lead_application_id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("proposed_fee", sa.Float(), nullable=False),
            sa.Column("first_session_note", sa.String(length=200), nullable=False),
            sa.Column("message", sa.String(length=500), nullable=False),
            sa.Column(
                "application_status",
                LEAD_APPLICATION_STATUS_ENUM,
                nullable=False,
                server_default=sa.text("'pending'::leadapplicationstatusenum"),
            ),
            sa.Column("contact_revealed_at", sa.TIMESTAMP(), nullable=True),
            sa.Column("created_at", sa.TIMESTAMP(), nullable=False, server_default=sa.text("NOW()")),
            sa.Column("post_requirements_id", sa.Integer(), nullable=False),
            sa.Column("tutor_id", sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(
                ["post_requirements_id"],
                ["post_requirements.post_requirements_id"],
                ondelete="CASCADE",
            ),
            sa.ForeignKeyConstraint(["tutor_id"], ["tutors.tutor_id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("lead_application_id"),
            sa.UniqueConstraint(
                "post_requirements_id",
                "tutor_id",
                name="uq_lead_application_tutor",
            ),
        )

    if table_exists("post_status"):
        op.execute(
            """
            INSERT INTO lead_applications (
                proposed_fee,
                first_session_note,
                message,
                application_status,
                created_at,
                post_requirements_id,
                tutor_id
            )
            SELECT
                pr.expected_fee,
                'Migrated from legacy post_status',
                'Migrated from legacy post_status',
                CASE ps.post_status::text
                    WHEN 'REJECTED' THEN 'rejected'::leadapplicationstatusenum
                    ELSE 'pending'::leadapplicationstatusenum
                END,
                NOW(),
                ps.post_requirements_id,
                ps.tutor_id
            FROM post_status ps
            JOIN post_requirements pr ON pr.post_requirements_id = ps.post_requirements_id
            """
        )
        op.execute(
            """
            UPDATE post_requirements pr
            SET lead_status = 'closed_empty'::leadstatusenum,
                closed_at = NOW(),
                accepting_applications = FALSE
            FROM post_status ps
            WHERE pr.post_requirements_id = ps.post_requirements_id
              AND ps.post_status::text = 'CLOSED'
            """
        )
        op.drop_table("post_status")

    if column_exists("post_requirements", "lead_status"):
        op.alter_column("post_requirements", "lead_status", server_default=None)
    if column_exists("post_requirements", "is_public"):
        op.alter_column("post_requirements", "is_public", server_default=None)
    if column_exists("post_requirements", "accepting_applications"):
        op.alter_column("post_requirements", "accepting_applications", server_default=None)
    if column_exists("post_requirements", "max_applications"):
        op.alter_column("post_requirements", "max_applications", server_default=None)
    if table_exists("lead_applications") and column_exists("lead_applications", "application_status"):
        op.alter_column("lead_applications", "application_status", server_default=None)
    if table_exists("lead_applications") and column_exists("lead_applications", "created_at"):
        op.alter_column("lead_applications", "created_at", server_default=None)


def downgrade() -> None:
    legacy_post_status_enum = sa.Enum(
        "no_response",
        "accepted",
        "rejected",
        "closed",
        name="post_status_enum",
    )
    bind = op.get_bind()
    legacy_post_status_enum.create(bind, checkfirst=True)

    op.create_table(
        "post_status",
        sa.Column("post_status_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("post_status", legacy_post_status_enum, nullable=False),
        sa.Column("post_requirements_id", sa.Integer(), nullable=False),
        sa.Column("tutor_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["post_requirements_id"],
            ["post_requirements.post_requirements_id"],
        ),
        sa.ForeignKeyConstraint(["tutor_id"], ["tutors.tutor_id"]),
        sa.PrimaryKeyConstraint("post_status_id"),
        sa.UniqueConstraint("post_requirements_id"),
    )

    op.execute(
        """
        INSERT INTO post_status (post_status, post_requirements_id, tutor_id)
        SELECT
            CASE la.application_status::text
                WHEN 'rejected' THEN 'rejected'::post_status_enum
                WHEN 'pending' THEN 'no_response'::post_status_enum
                ELSE 'no_response'::post_status_enum
            END,
            la.post_requirements_id,
            la.tutor_id
        FROM lead_applications la
        """
    )

    op.drop_table("lead_applications")
    op.drop_table("lead_targets")

    op.drop_column("post_requirements", "max_applications")
    op.drop_column("post_requirements", "closed_at")
    op.drop_column("post_requirements", "accepting_applications")
    op.drop_column("post_requirements", "is_public")
    op.drop_column("post_requirements", "lead_status")

    LEAD_APPLICATION_STATUS_ENUM.drop(bind, checkfirst=True)
    LEAD_STATUS_ENUM.drop(bind, checkfirst=True)

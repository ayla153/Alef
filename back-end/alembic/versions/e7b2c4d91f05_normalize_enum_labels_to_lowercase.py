"""Normalize enum labels to lowercase values

Revision ID: e7b2c4d91f05
Revises: d4e8f1a20b33
Create Date: 2026-06-05 18:00:00.000000

Base.metadata.create_all() stores Python enum member names (HIGH_3, ONLINE).
Application code and seed SQL use enum .value (high_3, online).
"""
from typing import Sequence, Union

from alembic import op


revision: str = "e7b2c4d91f05"
down_revision: Union[str, Sequence[str], None] = "d4e8f1a20b33"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _rename_enum_values(enum_type: str, renames: list[tuple[str, str]]) -> None:
    for old, new in renames:
        op.execute(f"ALTER TYPE {enum_type} RENAME VALUE '{old}' TO '{new}'")


def upgrade() -> None:
    _rename_enum_values(
        "student_grade_enum",
        [
            ("PRIMARY_1", "primary_1"),
            ("PRIMARY_2", "primary_2"),
            ("PRIMARY_3", "primary_3"),
            ("PRIMARY_4", "primary_4"),
            ("PRIMARY_5", "primary_5"),
            ("PRIMARY_6", "primary_6"),
            ("MIDDLE_1", "middle_1"),
            ("MIDDLE_2", "middle_2"),
            ("MIDDLE_3", "middle_3"),
            ("HIGH_1", "high_1"),
            ("HIGH_2", "high_2"),
            ("HIGH_3", "high_3"),
        ],
    )
    _rename_enum_values(
        "tuitiontypeenum",
        [
            ("ONLINE", "online"),
            ("OFFLINE", "offline"),
            ("BOTH", "both"),
        ],
    )
    _rename_enum_values(
        "gender_enum",
        [
            ("MALE", "male"),
            ("FEMALE", "female"),
        ],
    )


def downgrade() -> None:
    _rename_enum_values(
        "gender_enum",
        [
            ("male", "MALE"),
            ("female", "FEMALE"),
        ],
    )
    _rename_enum_values(
        "tuitiontypeenum",
        [
            ("online", "ONLINE"),
            ("offline", "OFFLINE"),
            ("both", "BOTH"),
        ],
    )
    _rename_enum_values(
        "student_grade_enum",
        [
            ("primary_1", "PRIMARY_1"),
            ("primary_2", "PRIMARY_2"),
            ("primary_3", "PRIMARY_3"),
            ("primary_4", "PRIMARY_4"),
            ("primary_5", "PRIMARY_5"),
            ("primary_6", "PRIMARY_6"),
            ("middle_1", "MIDDLE_1"),
            ("middle_2", "MIDDLE_2"),
            ("middle_3", "MIDDLE_3"),
            ("high_1", "HIGH_1"),
            ("high_2", "HIGH_2"),
            ("high_3", "HIGH_3"),
        ],
    )

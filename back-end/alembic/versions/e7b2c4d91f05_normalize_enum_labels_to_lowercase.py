"""Normalize enum labels to lowercase values

Revision ID: e7b2c4d91f05
Revises: d4e8f1a20b33
Create Date: 2026-06-05 18:00:00.000000

Base.metadata.create_all() stores Python enum member names (HIGH_3, ONLINE).
Application code and seed SQL use enum .value (high_3, online).
"""
from typing import Sequence, Union

from migration_helpers import rename_enum_value_if_exists


revision: str = "e7b2c4d91f05"
down_revision: Union[str, Sequence[str], None] = "d4e8f1a20b33"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    for old, new in [
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
    ]:
        rename_enum_value_if_exists("student_grade_enum", old, new)

    for old, new in [
        ("ONLINE", "online"),
        ("OFFLINE", "offline"),
        ("BOTH", "both"),
    ]:
        rename_enum_value_if_exists("tuitiontypeenum", old, new)

    for old, new in [
        ("MALE", "male"),
        ("FEMALE", "female"),
    ]:
        rename_enum_value_if_exists("gender_enum", old, new)


def downgrade() -> None:
    for old, new in [
        ("male", "MALE"),
        ("female", "FEMALE"),
    ]:
        rename_enum_value_if_exists("gender_enum", old, new)

    for old, new in [
        ("online", "ONLINE"),
        ("offline", "OFFLINE"),
        ("both", "BOTH"),
    ]:
        rename_enum_value_if_exists("tuitiontypeenum", old, new)

    for old, new in [
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
    ]:
        rename_enum_value_if_exists("student_grade_enum", old, new)

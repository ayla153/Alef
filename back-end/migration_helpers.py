"""Shared helpers for idempotent Alembic upgrades."""

from __future__ import annotations

from alembic import op
from sqlalchemy import inspect, text


def table_exists(name: str) -> bool:
    return name in inspect(op.get_bind()).get_table_names()


def column_exists(table: str, column: str) -> bool:
    if not table_exists(table):
        return False
    columns = {col["name"] for col in inspect(op.get_bind()).get_columns(table)}
    return column in columns


def enum_value_exists(enum_type: str, value: str) -> bool:
    return (
        op.get_bind()
        .execute(
            text(
                """
                SELECT 1
                FROM pg_enum e
                JOIN pg_type t ON e.enumtypid = t.oid
                WHERE t.typname = :enum_type
                  AND e.enumlabel = :value
                """
            ),
            {"enum_type": enum_type, "value": value},
        )
        .scalar()
        is not None
    )


def fk_on_delete_cascade(table: str, column: str) -> bool:
    return (
        op.get_bind()
        .execute(
            text(
                """
                SELECT c.confdeltype = 'c'
                FROM pg_constraint c
                JOIN pg_class rel ON rel.oid = c.conrelid
                JOIN pg_attribute att
                  ON att.attrelid = c.conrelid
                 AND att.attnum = ANY (c.conkey)
                WHERE c.contype = 'f'
                  AND rel.relname = :table
                  AND att.attname = :column
                LIMIT 1
                """
            ),
            {"table": table, "column": column},
        )
        .scalar()
        is True
    )


def rename_enum_value_if_exists(enum_type: str, old: str, new: str) -> None:
    if enum_value_exists(enum_type, old) and not enum_value_exists(enum_type, new):
        op.execute(f"ALTER TYPE {enum_type} RENAME VALUE '{old}' TO '{new}'")

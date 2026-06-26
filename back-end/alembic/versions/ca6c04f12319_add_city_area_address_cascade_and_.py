"""Add city/area/address cascade and validation

Revision ID: ca6c04f12319
Revises: 
Create Date: 2026-05-09 00:46:44.453180

"""
from typing import Sequence, Union

from alembic import op
from sqlalchemy.exc import ProgrammingError

from migration_helpers import fk_on_delete_cascade, table_exists


# revision identifiers, used by Alembic.
revision: str = 'ca6c04f12319'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _replace_fk(table: str, column: str, referred_table: str, referred_column: str) -> None:
    if fk_on_delete_cascade(table, column):
        return
    constraint_name = f"{table}_{column}_fkey"
    try:
        op.drop_constraint(constraint_name, table, type_="foreignkey")
    except ProgrammingError:
        pass
    op.create_foreign_key(
        None,
        table,
        referred_table,
        [column],
        [referred_column],
        ondelete="CASCADE",
    )


def upgrade() -> None:
    """Upgrade schema."""
    if not table_exists("addresses") or not table_exists("areas"):
        return

    _replace_fk("addresses", "area_id", "areas", "area_id")
    _replace_fk("addresses", "city_id", "cities", "city_id")
    _replace_fk("areas", "city_id", "cities", "city_id")


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(None, 'areas', type_='foreignkey')
    op.create_foreign_key(op.f('areas_city_id_fkey'), 'areas', 'cities', ['city_id'], ['city_id'])
    op.drop_constraint(None, 'addresses', type_='foreignkey')
    op.drop_constraint(None, 'addresses', type_='foreignkey')
    op.create_foreign_key(op.f('addresses_area_id_fkey'), 'addresses', 'areas', ['area_id'], ['area_id'])
    op.create_foreign_key(op.f('addresses_city_id_fkey'), 'addresses', 'cities', ['city_id'], ['city_id'])

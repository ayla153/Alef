"""update notifications table

Revision ID: dcc2f2d129c3
Revises: f63ff6afcc89
Create Date: 2026-06-22 14:47:41.719373

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dcc2f2d129c3'
down_revision: Union[str, Sequence[str], None] = 'f63ff6afcc89'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

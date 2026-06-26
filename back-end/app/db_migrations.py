import logging
from pathlib import Path

from alembic import command
from alembic.config import Config
from alembic.runtime.migration import MigrationContext
from alembic.script import ScriptDirectory
from sqlalchemy import inspect
from sqlalchemy.engine import Engine
from sqlalchemy.exc import ProgrammingError

logger = logging.getLogger(__name__)

_BACKEND_ROOT = Path(__file__).resolve().parent.parent
_ALEMBIC_INI = _BACKEND_ROOT / "alembic.ini"
_VERSIONS_DIR = _BACKEND_ROOT / "alembic" / "versions"

_MIGRATION_FAILURE_MSG = """\
Database migration failed. If tables were created outside Alembic (e.g. create_all),
try: cd back-end && uv run alembic upgrade head
Or if schema already matches: uv run alembic stamp head
"""


def _has_pending_migrations(script: ScriptDirectory, current: str | None) -> bool:
    heads = script.get_heads()
    if not heads:
        return False
    if current is None:
        return True
    for head in heads:
        for rev in script.iterate_revisions(head, current):
            if rev.revision != current:
                return True
    return False


def _log_untracked_schema(conn, current: str | None) -> None:
    if current is not None:
        return
    inspector = inspect(conn)
    if inspector.has_table("students") or inspector.has_table("tutors"):
        logger.info(
            "Database has tables but no Alembic revision; running idempotent migrations."
        )


def upgrade_database_if_needed(engine: Engine) -> None:
    """Run pending Alembic migrations when the DB is behind head(s)."""
    if not _ALEMBIC_INI.is_file() or not _VERSIONS_DIR.is_dir():
        logger.warning("Alembic not configured; skipping migrations.")
        return

    if not any(_VERSIONS_DIR.glob("*.py")):
        logger.warning("No Alembic migration files found; skipping migrations.")
        return

    cfg = Config(str(_ALEMBIC_INI))
    script = ScriptDirectory.from_config(cfg)
    heads = script.get_heads()
    upgrade_target = "heads" if len(heads) > 1 else "head"
    heads_label = ", ".join(heads)

    with engine.connect() as conn:
        current = MigrationContext.configure(conn).get_current_revision()
        _log_untracked_schema(conn, current)

    if not _has_pending_migrations(script, current):
        logger.info(
            "Database schema is up to date (revision %s).",
            current or heads_label,
        )
        return

    logger.info(
        "Upgrading database from %s to %s.",
        current or "(none)",
        heads_label,
    )

    try:
        command.upgrade(cfg, upgrade_target)
    except ProgrammingError as exc:
        if "already exists" in str(exc).lower():
            raise RuntimeError(_MIGRATION_FAILURE_MSG) from exc
        raise

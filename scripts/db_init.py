#!/usr/bin/env python3
"""Database initialization and management script for Local AI Studio.

Run from apps/api directory with: uv run python ../../scripts/db_init.py <command>
"""
import argparse
import subprocess
import sys
from pathlib import Path

API_DIR = Path(__file__).parent.parent / "apps" / "api"


def run_uv_command(args: list[str]) -> int:
    """Run a command inside the uv-managed API environment."""
    result = subprocess.run(
        ["uv", "run", "python", "-c", args[0]],
        cwd=API_DIR,
        capture_output=True,
        text=True,
    )
    print(result.stdout, end="")
    if result.stderr and result.returncode != 0:
        print(result.stderr, file=sys.stderr, end="")
    return result.returncode


COMMANDS = {
    "init": """
import asyncio, sys
sys.path.insert(0, '.')
from src.config.settings import get_settings
from src.core.database.session import init_db, close_db

async def main():
    settings = get_settings()
    await init_db(settings)
    await close_db()
    print('OK: Database initialized')

sys.exit(0 if asyncio.run(main()) is not None else 1)
""",
    "backup": """
import sys, sqlite3, shutil
sys.path.insert(0, '.')
from src.config.settings import get_settings

settings = get_settings()
db_path = settings.database_url.replace('sqlite+aiosqlite:///', '').replace('sqlite:///', '')
from pathlib import Path
from datetime import datetime
backup_dir = Path('../../backups')
backup_dir.mkdir(parents=True, exist_ok=True)
backup_file = backup_dir / f'local_ai_studio_{datetime.now().strftime(\"%Y%m%d_%H%M%S\")}.db'
source = sqlite3.connect(db_path)
dest = sqlite3.connect(str(backup_file))
source.backup(dest)
dest.close(); source.close()
print(f'OK: Backup created: {backup_file}')
""",
    "vacuum": """
import sys, sqlite3
sys.path.insert(0, '.')
from src.config.settings import get_settings

settings = get_settings()
db_path = settings.database_url.replace('sqlite+aiosqlite:///', '').replace('sqlite:///', '')
conn = sqlite3.connect(db_path)
conn.execute('VACUUM')
conn.close()
print('OK: Database vacuumed')
""",
    "integrity": """
import sys, sqlite3
sys.path.insert(0, '.')
from src.config.settings import get_settings

settings = get_settings()
db_path = settings.database_url.replace('sqlite+aiosqlite:///', '').replace('sqlite:///', '')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute('PRAGMA integrity_check')
result = cursor.fetchone()
conn.close()
if result[0] == 'ok':
    print('OK: Integrity check passed')
else:
    print(f'FAILED: {result[0]}')
    sys.exit(1)
""",
    "migrations": """
import sys, sqlite3
sys.path.insert(0, '.')
from src.config.settings import get_settings

settings = get_settings()
db_path = settings.database_url.replace('sqlite+aiosqlite:///', '').replace('sqlite:///', '')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
try:
    cursor.execute('SELECT version_num FROM alembic_version')
    rows = cursor.fetchall()
    for row in rows:
        print(f'Applied revision: {row[0]}')
except sqlite3.OperationalError:
    print('No migrations applied yet')
conn.close()
""",
}


def main():
    parser = argparse.ArgumentParser(description="Local AI Studio Database Management")
    parser.add_argument(
        "command",
        choices=list(COMMANDS.keys()),
        help="Command to execute",
    )
    args = parser.parse_args()
    return run_uv_command([COMMANDS[args.command]])


if __name__ == "__main__":
    sys.exit(main())
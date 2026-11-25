#!/usr/bin/env python3
"""Database backup script for Local AI Studio."""
import asyncio
import argparse
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "apps" / "api"))

from src.config.settings import Settings
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine


async def backup_database(db_url: str, backup_dir: Path) -> bool:
    """Create a timestamped SQLite backup."""
    if not db_url.startswith("sqlite"):
        print("✗ Backup only supported for SQLite")
        return False

    try:
        source_db = db_url.replace("sqlite+aiosqlite:///", "")
        source_db = source_db.replace("sqlite:///", "")

        backup_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = backup_dir / f"local_ai_studio_{timestamp}.db"

        import sqlite3
        source = sqlite3.connect(source_db)
        dest = sqlite3.connect(str(backup_file))

        source.backup(dest)
        dest.close()
        source.close()

        # Verify backup
        verify = sqlite3.connect(str(backup_file))
        cursor = verify.cursor()
        cursor.execute("PRAGMA integrity_check")
        result = cursor.fetchone()
        verify.close()

        if result[0] == "ok":
            print(f"✓ Backup created: {backup_file} ({backup_file.stat().st_size} bytes)")
            return True
        else:
            print(f"✗ Backup verification failed: {result[0]}")
            return False
    except Exception as e:
        print(f"✗ Backup failed: {e}")
        return False


async def main():
    parser = argparse.ArgumentParser(description="Local AI Studio Database Backup")
    parser.add_argument("--db-url", default="sqlite+aiosqlite:///./data/local_ai_studio.db", help="Database URL")
    parser.add_argument("--backup-dir", type=Path, default=Path("./backups"), help="Backup directory")
    args = parser.parse_args()

    success = await backup_database(args.db_url, args.backup_dir)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    asyncio.run(main())
# Database Management Skill

## Overview

This skill provides guidance for database operations in Local AI Studio using SQLAlchemy 2.x, Alembic, SQLite (local), and PostgreSQL (production).

## Schema Design

### Model Conventions

```python
# src/core/database/models/job.py
from sqlalchemy import String, Integer, Float, ForeignKey, Enum, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.core.database.base import Base, UUIDMixin, TimestampMixin, JSONColumn

class Job(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "jobs"

    type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    module_id: Mapped[str | None] = mapped_column(ForeignKey("modules.id", ondelete="SET NULL"))
    status: Mapped[JobStatus] = mapped_column(Enum(JobStatus), default=JobStatus.PENDING, index=True)
    priority: Mapped[int] = mapped_column(Integer, default=JobPriority.NORMAL)
    payload: Mapped[dict] = mapped_column(JSONColumn(), default=dict)
    result: Mapped[dict | None] = mapped_column(JSONColumn(), nullable=True)
    error: Mapped[str | None] = mapped_column(String(5000), nullable=True)
    progress: Mapped[float] = mapped_column(Float, default=0.0)
    started_at: Mapped[datetime | None] = mapped_column(nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(nullable=True)

    user: Mapped["User"] = relationship(back_populates="jobs")
    module: Mapped["Module"] = relationship(back_populates="jobs")

    __table_args__ = (
        Index("ix_jobs_user_status", "user_id", "status"),
        Index("ix_jobs_module_status", "module_id", "status"),
        Index("ix_jobs_created_status", "created_at", "status"),
    )
```

### Dialect-Agnostic Types

```python
# src/core/database/base.py
from sqlalchemy.dialects.sqlite import JSON as SQLiteJSON
from sqlalchemy.dialects.postgresql import JSONB as PGJSONB
from sqlalchemy import Dialect
from sqlalchemy.types import TypeDecorator, Text

class JSONType(TypeDecorator):
    impl = Text
    cache_ok = True

    def load_dialect_impl(self, dialect: Dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PGJSONB())
        return dialect.type_descriptor(SQLiteJSON())

    def process_bind_param(self, value, dialect):
        if value is None: return None
        import json
        return json.dumps(value)

    def process_result_value(self, value, dialect):
        if value is None: return None
        import json
        return json.loads(value)

def JSONColumn():
    return JSONType()
```

### UUID Handling

```python
# SQLite: String(36), PostgreSQL: native UUID
class DialectUUID(TypeDecorator):
    impl = String(36)
    cache_ok = True

    def load_dialect_impl(self, dialect: Dialect):
        if dialect.name == "postgresql":
            from sqlalchemy.dialects.postgresql import UUID as PGUUID
            return dialect.type_descriptor(PGUUID(as_uuid=False))
        return dialect.type_descriptor(String(36))
```

## SQLAlchemy Conventions

### Async Session

```python
# src/core/database/session.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool, QueuePool

engine = None
async_session_maker = None

async def init_db(settings=None):
    global engine, async_session_maker
    if settings.database_url.startswith("sqlite"):
        engine = create_async_engine(
            settings.database_url,
            poolclass=NullPool,
            connect_args={"check_same_thread": False},
        )
    else:
        engine = create_async_engine(
            settings.database_url,
            poolclass=QueuePool,
            pool_size=settings.database_pool_size,
            max_overflow=settings.database_max_overflow,
            pool_pre_ping=True,
        )
    async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@asynccontextmanager
async def get_session():
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
```

### Query Patterns

```python
# Select with relationships
stmt = select(Job).options(selectinload(Job.user)).where(Job.user_id == user_id)

# Pagination
stmt = select(Job).where(Job.status == JobStatus.PENDING).offset(skip).limit(limit)

# Aggregation
stmt = select(func.count()).select_from(Job).where(Job.user_id == user_id)

# Bulk insert
await session.execute(insert(Job).values([{"type": "t1"}, {"type": "t2"}]))
```

## Alembic Migrations

### Configuration

```ini
# alembic.ini
[alembic]
script_location = src/core/database/migrations
prepend_sys_path = .
file_template = %%(year)d%%(month).2d%%(day).2d_%%(hour).2d%%(minute).2d_%%(rev)s_%%(slug)s
```

### Environment

```python
# src/core/database/migrations/env.py
import asyncio
from alembic import context
from sqlalchemy.ext.asyncio import async_engine_from_config
from sqlalchemy import pool

from src.core.database.base import Base
from src.config.settings import get_settings

target_metadata = Base.metadata

async def run_async_migrations():
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = get_settings().database_url
    connectable = async_engine_from_config(configuration, prefix="sqlalchemy.", poolclass=pool.NullPool)
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()

def run_migrations_online():
    asyncio.run(run_async_migrations())
```

### Creating Migrations

```bash
# Auto-generate from model changes
uv run alembic revision --autogenerate -m "add user preferences"

# Manual migration
uv run alembic revision -m "add custom index"

# Review generated file before applying!
```

### Applying Migrations

```bash
# Upgrade to latest
uv run alembic upgrade head

# Upgrade specific revision
uv run alembic upgrade <revision>

# Downgrade one
uv run alembic downgrade -1

# Downgrade to specific
uv run alembic downgrade <revision>
```

### Migration Best Practices

1. **Review auto-generated** — check for data loss
2. **Test on both dialects** — SQLite and PostgreSQL
3. **Idempotent operations** — use `IF NOT EXISTS`
4. **Batch data changes** — separate schema/data migrations
5. **Reversible** — implement `downgrade()` when possible

### Handling Dialect Differences

```python
# In migration
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql, sqlite

def upgrade():
    if op.get_context().dialect.name == "postgresql":
        op.add_column("table", sa.Column("data", postgresql.JSONB()))
    else:
        op.add_column("table", sa.Column("data", sqlite.JSON()))
```

## SQLite Optimization

### WAL Mode (Enable for Concurrency)

```python
# In engine creation
connect_args={"check_same_thread": False}

# Or via PRAGMA
async with engine.begin() as conn:
    await conn.execute(text("PRAGMA journal_mode=WAL"))
    await conn.execute(text("PRAGMA synchronous=NORMAL"))
    await conn.execute(text("PRAGMA cache_size=-32768"))  # 32MB cache
```

### Indexes

```python
# Composite indexes for query patterns
__table_args__ = (
    Index("ix_jobs_user_status", "user_id", "status"),
    Index("ix_jobs_module_status", "module_id", "status"),
    # Partial indexes (PostgreSQL only)
    # Index("ix_jobs_pending", "created_at", postgresql_where=Job.status == "pending"),
)
```

### Vacuum

```python
# Periodic maintenance
async with engine.begin() as conn:
    await conn.execute(text("VACUUM"))
    await conn.execute(text("ANALYZE"))
```

## Data Integrity

### Constraints

```python
# Foreign keys with cascades
user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))

# Unique constraints
__table_args__ = (
    UniqueConstraint("user_id", "module_id", name="uq_user_module"),
)

# Check constraints
CheckConstraint("progress >= 0 AND progress <= 1", name="ck_job_progress"),
```

### Transactions

```python
# Automatic via session context manager
async with get_session() as session:
    repo = JobRepository(session)
    job = await repo.create(...)
    # Auto-commit on success, rollback on exception

# Manual control when needed
async with get_session() as session:
    try:
        await session.execute(...)
        await session.flush()  # Get IDs without commit
        await session.commit()
    except Exception:
        await session.rollback()
        raise
```

## Backup and Recovery

### SQLite Backup

```python
# tools/backup_db.py
import shutil
from datetime import datetime
from pathlib import Path
from src.config.settings import get_settings

def backup_database():
    settings = get_settings()
    db_path = Path(settings.database_url.replace("sqlite+aiosqlite:///", ""))
    if not db_path.exists():
        return

    backup_dir = Path("./backups")
    backup_dir.mkdir(exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = backup_dir / f"local_ai_studio_{timestamp}.db"

    # Use SQLite backup API for consistency
    import sqlite3
    source = sqlite3.connect(db_path)
    dest = sqlite3.connect(backup_path)
    source.backup(dest)
    source.close()
    dest.close()

    # Keep last 7
    backups = sorted(backup_dir.glob("local_ai_studio_*.db"))
    for old in backups[:-7]:
        old.unlink()
```

### PostgreSQL Backup (Production)

```bash
# pg_dump
pg_dump -h localhost -U user -d local_ai_studio > backup_$(date +%Y%m%d).sql

# Restore
psql -h localhost -U user -d local_ai_studio < backup_20240101.sql
```

## Future PostgreSQL Compatibility

### Model Compatibility Checklist

- [ ] Use `JSONColumn()` not `JSON`/`JSONB` directly
- [ ] Use `DialectUUID` not `String(36)` or `UUID`
- [ ] Use `SQLEnum(Enum)` not raw strings
- [ ] Avoid SQLite-specific functions
- [ ] Test migrations on both dialects

### Connection Pooling

```python
# SQLite: NullPool
# PostgreSQL: QueuePool with sizing
if url.startswith("sqlite"):
    poolclass = NullPool
else:
    poolclass = QueuePool
    pool_size = 10
    max_overflow = 20
```

### Production Settings

```python
# .env.production
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=40
DATABASE_ECHO=false
```

---

**Reference:** `apps/api/CLAUDE.md`, `docs/architecture/database-architecture.md`, `docs/decisions/ADR-002-database.md`
# Local AI Studio — Database Architecture

## Overview

The database layer uses **SQLAlchemy 2.x** with **async support** over **SQLite** for local development, with a clear migration path to **PostgreSQL** for production deployment. **Alembic** manages schema migrations. The design follows repository patterns for clean separation of data access logic.

## Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Local-first** | SQLite file-based, zero-config, portable |
| **Async-first** | All DB operations async via `aiosqlite` |
| **Type-safe** | Pydantic v2 + SQLAlchemy 2.x typed models |
| **Migratable** | Alembic migrations version-controlled |
| **PostgreSQL-ready** | Dialect-agnostic models, minimal SQLite-specific code |
| **Performance** | Connection pooling, prepared statements, indexes |

## Database Schema

```mermaid
erDiagram
    USER ||--o{ MODULE_CONFIG : has
    USER ||--o{ JOB : creates
    USER ||--o{ FILE : uploads
    USER ||--o{ AI_USAGE_LOG : generates

    MODULE ||--o{ MODULE_CONFIG : configures
    MODULE ||--o{ JOB : executes

    JOB ||--o{ JOB_LOG : has
    JOB ||--o{ FILE : produces

    FILE ||--o{ FILE_TAG : tagged

    SETTINGS ||--o{ SETTING_VALUE : contains

    USER {
        uuid id PK
        string email UK
        string hashed_password
        string full_name
        boolean is_active
        boolean is_superuser
        datetime created_at
        datetime updated_at
        datetime last_login
    }

    MODULE {
        string id PK
        string name
        string description
        string version
        boolean enabled
        jsonb config_schema
        datetime created_at
        datetime updated_at
    }

    MODULE_CONFIG {
        uuid id PK
        uuid user_id FK
        string module_id FK
        jsonb config
        datetime created_at
        datetime updated_at
    }

    JOB {
        uuid id PK
        string type
        uuid user_id FK
        string module_id FK
        string status
        integer priority
        jsonb payload
        jsonb result
        string error
        float progress
        datetime created_at
        datetime started_at
        datetime completed_at
    }

    JOB_LOG {
        uuid id PK
        uuid job_id FK
        string level
        string message
        jsonb context
        datetime created_at
    }

    FILE {
        uuid id PK
        string filename
        string path
        integer size
        string mime_type
        string checksum
        uuid user_id FK
        uuid job_id FK
        string module_id
        datetime created_at
    }

    FILE_TAG {
        uuid id PK
        uuid file_id FK
        string tag
    }

    AI_USAGE_LOG {
        uuid id PK
        uuid user_id FK
        string provider
        string model
        integer prompt_tokens
        integer completion_tokens
        integer total_tokens
        float estimated_cost
        string request_type
        datetime created_at
    }

    SETTINGS {
        string id PK
        string category
        string description
        datetime updated_at
    }

    SETTING_VALUE {
        uuid id PK
        string settings_id FK
        string key
        string value
        string value_type
    }
```

## SQLAlchemy Models

### Base & Mixins

```python
# src/core/database/base.py
from datetime import datetime
from uuid import uuid4
from sqlalchemy import DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.dialects.sqlite import JSON as SQLiteJSON
from sqlalchemy.dialects.postgresql import JSONB as PGJSONB
from typing import Any


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class UUIDMixin:
    id: Mapped[str] = mapped_column(
        primary_key=True,
        default=lambda: str(uuid4()),
    )


def JSONColumn() -> Any:
    """Dialect-agnostic JSON column."""
    from sqlalchemy import Dialect
    from sqlalchemy.ext.compiler import compiles
    from sqlalchemy.types import TypeDecorator, TEXT

    class JSONType(TypeDecorator):
        impl = TEXT
        cache_ok = True

        def load_dialect_impl(self, dialect: Dialect):
            if dialect.name == "postgresql":
                return dialect.type_descriptor(PGJSONB())
            return dialect.type_descriptor(SQLiteJSON())

        def process_bind_param(self, value, dialect):
            if value is None:
                return None
            import json
            return json.dumps(value)

        def process_result_value(self, value, dialect):
            if value is None:
                return None
            import json
            return json.loads(value)

    return JSONType()
```

### Core Models

```python
# src/core/database/models/user.py
from sqlalchemy import String, Boolean, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.core.database.base import Base, UUIDMixin, TimestampMixin


class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_login: Mapped[datetime | None] = mapped_column(nullable=True)

    # Relationships
    module_configs: Mapped[list["ModuleConfig"]] = relationship(back_populates="user")
    jobs: Mapped[list["Job"]] = relationship(back_populates="user")
    files: Mapped[list["File"]] = relationship(back_populates="user")
    ai_usage_logs: Mapped[list["AIUsageLog"]] = relationship(back_populates="user")

    __table_args__ = (Index("ix_users_email_active", "email", "is_active"),)
```

```python
# src/core/database/models/module.py
from sqlalchemy import String, Boolean, Index, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.core.database.base import Base, UUIDMixin, TimestampMixin, JSONColumn


class Module(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "modules"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)  # Not UUID, use module_id
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    version: Mapped[str] = mapped_column(String(50), nullable=False, default="0.1.0")
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    config_schema: Mapped[dict] = mapped_column(JSONColumn(), default=dict, nullable=False)

    # Relationships
    configs: Mapped[list["ModuleConfig"]] = relationship(back_populates="module")
    jobs: Mapped[list["Job"]] = relationship(back_populates="module")


class ModuleConfig(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "module_configs"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    module_id: Mapped[str] = mapped_column(ForeignKey("modules.id", ondelete="CASCADE"), nullable=False)
    config: Mapped[dict] = mapped_column(JSONColumn(), default=dict, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="module_configs")
    module: Mapped["Module"] = relationship(back_populates="configs")

    __table_args__ = (
        Index("ix_module_configs_user_module", "user_id", "module_id", unique=True),
    )
```

```python
# src/core/database/models/job.py
from enum import Enum as PyEnum
from sqlalchemy import String, Integer, Float, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.core.database.base import Base, UUIDMixin, TimestampMixin, JSONColumn


class JobStatus(str, PyEnum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class JobPriority(int, PyEnum):
    LOW = 0
    NORMAL = 50
    HIGH = 100


class Job(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "jobs"

    type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    module_id: Mapped[str | None] = mapped_column(ForeignKey("modules.id", ondelete="SET NULL"), nullable=True)
    status: Mapped[JobStatus] = mapped_column(
        SQLEnum(JobStatus), default=JobStatus.PENDING, nullable=False, index=True
    )
    priority: Mapped[int] = mapped_column(Integer, default=JobPriority.NORMAL, nullable=False)
    payload: Mapped[dict] = mapped_column(JSONColumn(), default=dict, nullable=False)
    result: Mapped[dict | None] = mapped_column(JSONColumn(), nullable=True)
    error: Mapped[str | None] = mapped_column(String(5000), nullable=True)
    progress: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    started_at: Mapped[datetime | None] = mapped_column(nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(nullable=True)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="jobs")
    module: Mapped["Module"] = relationship(back_populates="jobs")
    logs: Mapped[list["JobLog"]] = relationship(back_populates="job", cascade="all, delete-orphan")
    files: Mapped[list["File"]] = relationship(back_populates="job")

    __table_args__ = (
        Index("ix_jobs_user_status", "user_id", "status"),
        Index("ix_jobs_module_status", "module_id", "status"),
        Index("ix_jobs_created_status", "created_at", "status"),
    )


class JobLog(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "job_logs"

    job_id: Mapped[str] = mapped_column(ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    level: Mapped[str] = mapped_column(String(20), nullable=False)  # DEBUG, INFO, WARNING, ERROR
    message: Mapped[str] = mapped_column(String(5000), nullable=False)
    context: Mapped[dict] = mapped_column(JSONColumn(), default=dict, nullable=False)

    # Relationships
    job: Mapped["Job"] = relationship(back_populates="logs")

    __table_args__ = (Index("ix_job_logs_job_level", "job_id", "level"),)
```

```python
# src/core/database/models/file.py
from sqlalchemy import String, Integer, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.core.database.base import Base, UUIDMixin, TimestampMixin


class File(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "files"

    filename: Mapped[str] = mapped_column(String(500), nullable=False)
    path: Mapped[str] = mapped_column(String(1000), nullable=False)
    size: Mapped[int] = mapped_column(Integer, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    checksum: Mapped[str] = mapped_column(String(64), nullable=False, index=True)  # SHA256
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_id: Mapped[str | None] = mapped_column(ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    module_id: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="files")
    job: Mapped["Job"] = relationship(back_populates="files")
    tags: Mapped[list["FileTag"]] = relationship(back_populates="file", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_files_user_module", "user_id", "module_id"),
        Index("ix_files_checksum", "checksum"),
    )


class FileTag(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "file_tags"

    file_id: Mapped[str] = mapped_column(ForeignKey("files.id", ondelete="CASCADE"), nullable=False, index=True)
    tag: Mapped[str] = mapped_column(String(100), nullable=False, index=True)

    # Relationships
    file: Mapped["File"] = relationship(back_populates="tags")

    __table_args__ = (Index("ix_file_tags_file_tag", "file_id", "tag", unique=True),)
```

```python
# src/core/database/models/ai_usage.py
from sqlalchemy import String, Integer, Float, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.core.database.base import Base, UUIDMixin, TimestampMixin


class AIUsageLog(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "ai_usage_logs"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    provider: Mapped[str] = mapped_column(String(50), nullable=False)  # ollama, freellmapi
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    prompt_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completion_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    estimated_cost: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # USD
    request_type: Mapped[str] = mapped_column(String(50), nullable=False)  # chat, completion, embedding, vision

    # Relationships
    user: Mapped["User"] = relationship(back_populates="ai_usage_logs")

    __table_args__ = (
        Index("ix_ai_usage_user_provider", "user_id", "provider"),
        Index("ix_ai_usage_user_model", "user_id", "model"),
        Index("ix_ai_usage_created", "created_at"),
    )
```

```python
# src/core/database/models/settings.py
from sqlalchemy import String, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.core.database.base import Base, UUIDMixin, TimestampMixin


class Settings(Base):
    __tablename__ = "settings"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)  # e.g., "general", "ai", "storage"
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    values: Mapped[list["SettingValue"]] = relationship(back_populates="settings", cascade="all, delete-orphan")


class SettingValue(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "setting_values"

    settings_id: Mapped[str] = mapped_column(ForeignKey("settings.id", ondelete="CASCADE"), nullable=False, index=True)
    key: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[str] = mapped_column(String(5000), nullable=False)
    value_type: Mapped[str] = mapped_column(String(20), nullable=False)  # string, int, float, bool, json

    # Relationships
    settings: Mapped["Settings"] = relationship(back_populates="values")

    __table_args__ = (Index("ix_setting_values_settings_key", "settings_id", "key", unique=True),)
```

## Repository Pattern

```python
# src/core/database/repositories/base.py
from typing import Generic, TypeVar, Sequence
from sqlalchemy import select, update, delete, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import InstrumentedAttribute
from src.core.database.base import Base


ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(self, session: AsyncSession, model: type[ModelType]):
        self.session = session
        self.model = model

    async def get(self, id: str) -> ModelType | None:
        return await self.session.get(self.model, id)

    async def get_by(self, **kwargs) -> ModelType | None:
        stmt = select(self.model).filter_by(**kwargs)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        order_by: InstrumentedAttribute | None = None,
        **filters,
    ) -> Sequence[ModelType]:
        stmt = select(self.model).filter_by(**filters)
        if order_by is not None:
            stmt = stmt.order_by(order_by)
        stmt = stmt.offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def count(self, **filters) -> int:
        stmt = select(func.count()).select_from(self.model).filter_by(**filters)
        result = await self.session.execute(stmt)
        return result.scalar_one()

    async def create(self, **kwargs) -> ModelType:
        obj = self.model(**kwargs)
        self.session.add(obj)
        await self.session.flush()
        return obj

    async def update(self, id: str, **kwargs) -> ModelType | None:
        obj = await self.get(id)
        if not obj:
            return None
        for key, value in kwargs.items():
            setattr(obj, key, value)
        await self.session.flush()
        return obj

    async def delete(self, id: str) -> bool:
        obj = await self.get(id)
        if not obj:
            return False
        await self.session.delete(obj)
        await self.session.flush()
        return True

    async def exists(self, **filters) -> bool:
        stmt = select(func.count()).select_from(self.model).filter_by(**filters).limit(1)
        result = await self.session.execute(stmt)
        return result.scalar_one() > 0
```

```python
# src/core/database/repositories/job.py
from typing import Sequence
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.database.models.job import Job, JobStatus
from src.core.database.repositories.base import BaseRepository


class JobRepository(BaseRepository[Job]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Job)

    async def get_pending_jobs(self, limit: int = 10) -> Sequence[Job]:
        stmt = (
            select(Job)
            .where(Job.status == JobStatus.PENDING)
            .order_by(desc(Job.priority), Job.created_at)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_user_jobs(
        self, user_id: str, status: JobStatus | None = None, skip: int = 0, limit: int = 50
    ) -> Sequence[Job]:
        stmt = select(Job).where(Job.user_id == user_id)
        if status:
            stmt = stmt.where(Job.status == status)
        stmt = stmt.order_by(desc(Job.created_at)).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def update_progress(self, job_id: str, progress: float) -> Job | None:
        return await self.update(job_id, progress=progress)

    async def complete_job(self, job_id: str, result: dict, error: str | None = None) -> Job | None:
        from datetime import datetime
        from src.core.database.models.job import JobStatus
        status = JobStatus.COMPLETED if error is None else JobStatus.FAILED
        return await self.update(
            job_id,
            status=status,
            result=result,
            error=error,
            progress=1.0,
            completed_at=datetime.utcnow(),
        )
```

## Alembic Migrations

### Configuration

```ini
# alembic.ini
[alembic]
script_location = src/core/database/migrations
prepend_sys_path = .
version_path_separator = os
file_template = %%(year)d%%(month).2d%%(day).2d_%%(hour).2d%%(minute).2d_%%(rev)s_%%(slug)s

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stdout,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

### Migration Environment

```python
# src/core/database/migrations/env.py
import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context

from src.core.database.base import Base
from src.config.settings import get_settings

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def get_url():
    return get_settings().database_url


def run_migrations_offline() -> None:
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = get_url()
    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

### Initial Migration

```python
# src/core/database/migrations/versions/20240101_000000_initial.py
"""Initial migration

Revision ID: 20240101_000000
Revises:
Create Date: 2024-01-01 00:00:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql, sqlite


revision = "20240101_000000"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Users
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=True),
        sa.Column("is_active", sa.Boolean(), default=True, nullable=False),
        sa.Column("is_superuser", sa.Boolean(), default=False, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.Column("last_login", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_users_email_active", "users", ["email", "is_active"])

    # Modules
    op.create_table(
        "modules",
        sa.Column("id", sa.String(100), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.String(1000), nullable=True),
        sa.Column("version", sa.String(50), default="0.1.0", nullable=False),
        sa.Column("enabled", sa.Boolean(), default=True, nullable=False),
        sa.Column("config_schema", sa.JSON(), default={}, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # Module Configs
    op.create_table(
        "module_configs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("module_id", sa.String(100), sa.ForeignKey("modules.id", ondelete="CASCADE"), nullable=False),
        sa.Column("config", sa.JSON(), default={}, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index("ix_module_configs_user_module", "module_configs", ["user_id", "module_id"], unique=True)

    # Jobs
    op.create_table(
        "jobs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("type", sa.String(100), nullable=False),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("module_id", sa.String(100), sa.ForeignKey("modules.id", ondelete="SET NULL"), nullable=True),
        sa.Column("status", sa.String(20), default="pending", nullable=False),
        sa.Column("priority", sa.Integer(), default=50, nullable=False),
        sa.Column("payload", sa.JSON(), default={}, nullable=False),
        sa.Column("result", sa.JSON(), nullable=True),
        sa.Column("error", sa.String(5000), nullable=True),
        sa.Column("progress", sa.Float(), default=0.0, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_jobs_user_status", "jobs", ["user_id", "status"])
    op.create_index("ix_jobs_module_status", "jobs", ["module_id", "status"])
    op.create_index("ix_jobs_created_status", "jobs", ["created_at", "status"])
    op.create_index("ix_jobs_type", "jobs", ["type"])

    # Job Logs
    op.create_table(
        "job_logs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("job_id", sa.String(36), sa.ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("level", sa.String(20), nullable=False),
        sa.Column("message", sa.String(5000), nullable=False),
        sa.Column("context", sa.JSON(), default={}, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_job_logs_job_level", "job_logs", ["job_id", "level"])

    # Files
    op.create_table(
        "files",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("filename", sa.String(500), nullable=False),
        sa.Column("path", sa.String(1000), nullable=False),
        sa.Column("size", sa.Integer(), nullable=False),
        sa.Column("mime_type", sa.String(100), nullable=False),
        sa.Column("checksum", sa.String(64), nullable=False),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("job_id", sa.String(36), sa.ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True),
        sa.Column("module_id", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index("ix_files_user_module", "files", ["user_id", "module_id"])
    op.create_index("ix_files_checksum", "files", ["checksum"])

    # File Tags
    op.create_table(
        "file_tags",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("file_id", sa.String(36), sa.ForeignKey("files.id", ondelete="CASCADE"), nullable=False),
        sa.Column("tag", sa.String(100), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_file_tags_file_tag", "file_tags", ["file_id", "tag"], unique=True)

    # AI Usage Logs
    op.create_table(
        "ai_usage_logs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("provider", sa.String(50), nullable=False),
        sa.Column("model", sa.String(100), nullable=False),
        sa.Column("prompt_tokens", sa.Integer(), default=0, nullable=False),
        sa.Column("completion_tokens", sa.Integer(), default=0, nullable=False),
        sa.Column("total_tokens", sa.Integer(), default=0, nullable=False),
        sa.Column("estimated_cost", sa.Float(), default=0.0, nullable=False),
        sa.Column("request_type", sa.String(50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_ai_usage_user_provider", "ai_usage_logs", ["user_id", "provider"])
    op.create_index("ix_ai_usage_user_model", "ai_usage_logs", ["user_id", "model"])
    op.create_index("ix_ai_usage_created", "ai_usage_logs", ["created_at"])

    # Settings
    op.create_table(
        "settings",
        sa.Column("id", sa.String(100), primary_key=True),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("description", sa.String(500), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    op.create_table(
        "setting_values",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("settings_id", sa.String(100), sa.ForeignKey("settings.id", ondelete="CASCADE"), nullable=False),
        sa.Column("key", sa.String(100), nullable=False),
        sa.Column("value", sa.String(5000), nullable=False),
        sa.Column("value_type", sa.String(20), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index("ix_setting_values_settings_key", "setting_values", ["settings_id", "key"], unique=True)


def downgrade() -> None:
    op.drop_table("setting_values")
    op.drop_table("settings")
    op.drop_table("ai_usage_logs")
    op.drop_table("file_tags")
    op.drop_table("files")
    op.drop_table("job_logs")
    op.drop_table("jobs")
    op.drop_table("module_configs")
    op.drop_table("modules")
    op.drop_table("users")
```

## SQLite vs PostgreSQL Differences

| Feature | SQLite (Local) | PostgreSQL (Production) |
|---------|----------------|-------------------------|
| **JSON** | `JSON` type (TEXT storage) | `JSONB` (binary, indexed) |
| **UUID** | `String(36)` | `UUID` native type |
| **Concurrency** | Single writer, multiple readers | Full MVCC |
| **Full-text Search** | FTS5 extension | `tsvector`/`tsquery` |
| **JSON Indexing** | Limited (generated columns) | GIN indexes on JSONB |
| **Array Types** | Not supported | Native arrays |
| **ENUM** | CHECK constraint | Native ENUM type |
| **Advisory Locks** | Not supported | `pg_advisory_lock` |

### Handling Differences

```python
# src/core/database/base.py (additions)
from sqlalchemy import CheckConstraint, event
from sqlalchemy.dialects.sqlite import JSON as SQLiteJSON
from sqlalchemy.dialects.postgresql import JSONB as PGJSONB, UUID as PGUUID


# SQLite-specific: add CHECK constraints for ENUM-like columns
@event.listens_for(Job.__table__, "after_create")
def add_sqlite_check_constraints(target, connection, **kw):
    if connection.dialect.name == "sqlite":
        connection.execute(sa.text("""
            CREATE TRIGGER check_job_status
            BEFORE INSERT ON jobs
            FOR EACH ROW
            WHEN NEW.status NOT IN ('pending', 'running', 'completed', 'failed', 'cancelled')
            BEGIN
                SELECT RAISE(ABORT, 'Invalid job status');
            END;
        """))


# PostgreSQL-specific: use native types
def get_dialect_specific_types():
    from sqlalchemy import Dialect
    from sqlalchemy.ext.compiler import compiles

    class DialectUUID(sa.types.TypeDecorator):
        impl = sa.String(36)
        cache_ok = True

        def load_dialect_impl(self, dialect: Dialect):
            if dialect.name == "postgresql":
                return dialect.type_descriptor(PGUUID())
            return dialect.type_descriptor(sa.String(36))

    class DialectJSON(sa.types.TypeDecorator):
        impl = sa.Text
        cache_ok = True

        def load_dialect_impl(self, dialect: Dialect):
            if dialect.name == "postgresql":
                return dialect.type_descriptor(PGJSONB())
            return dialect.type_descriptor(SQLiteJSON())

    return DialectUUID, DialectJSON
```

## Migration to PostgreSQL

### Production Settings

```python
# .env.production
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/local_ai_studio
DATABASE_POOL_SIZE=10
DATABASE_MAX_OVERFLOW=20
```

### Connection Pool Config

```python
# src/core/database/session.py (updated)
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool, QueuePool
from src.config.settings import get_settings


def create_engine(settings):
    if settings.database_url.startswith("sqlite"):
        # SQLite: no pooling, NullPool
        return create_async_engine(
            settings.database_url,
            echo=settings.database_echo,
            poolclass=NullPool,
            connect_args={"check_same_thread": False},
        )
    else:
        # PostgreSQL: QueuePool with sizing
        return create_async_engine(
            settings.database_url,
            echo=settings.database_echo,
            poolclass=QueuePool,
            pool_size=settings.database_pool_size,
            max_overflow=settings.database_max_overflow,
            pool_pre_ping=True,
            pool_recycle=3600,
        )
```

## Performance Considerations

| Optimization | Implementation |
|--------------|----------------|
| **Connection Pooling** | NullPool (SQLite), QueuePool (PostgreSQL) |
| **Prepared Statements** | SQLAlchemy automatic caching |
| **Indexes** | Composite indexes on query patterns |
| **Pagination** | Keyset pagination for large datasets |
| **Batch Operations** | `session.bulk_insert_mappings()` |
| **Read Replicas** | Not needed locally; ready for prod |

## Backup Strategy (Local)

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
        print(f"Database not found at {db_path}")
        return

    backup_dir = Path("./backups")
    backup_dir.mkdir(exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = backup_dir / f"local_ai_studio_{timestamp}.db"

    shutil.copy2(db_path, backup_path)
    print(f"Backup created: {backup_path}")

    # Keep last 7 backups
    backups = sorted(backup_dir.glob("local_ai_studio_*.db"))
    for old in backups[:-7]:
        old.unlink()
        print(f"Removed old backup: {old}")


if __name__ == "__main__":
    backup_database()
```

## Testing Database

```python
# src/tests/conftest.py
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from src.core.database.base import Base
from src.core.database.session import get_session


@pytest_asyncio.fixture
async def test_db():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async def override_get_session():
        async with async_session() as session:
            yield session

    yield override_get_session

    await engine.dispose()
```

---

**Next:** [AI Provider Architecture](./ai-provider-architecture.md) | [ADR-002: Database](./../decisions/ADR-002-database.md)
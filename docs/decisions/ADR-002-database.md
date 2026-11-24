# ADR-002: Database Selection and Architecture

**Status:** Accepted  
**Date:** 2026-11-24  
**Deciders:** Principal Software Architect  
**Technical Story:** Choose database technology and design data architecture for Local AI Studio

## Context

Local AI Studio requires persistent storage for:
- User accounts and authentication
- Module configurations
- Background job queue and history
- File metadata and tags
- AI usage metrics and cost tracking
- Application settings

Constraints:
- **8 GB RAM** — Database must be lightweight
- **Local-first** — Zero external dependencies for development
- **Single developer** — No concurrent write contention initially
- **Future PostgreSQL migration** — Production deployment path required
- **Type safety** — End-to-end typed models (Pydantic ↔ SQLAlchemy)

## Decision

**Primary Database: SQLite (with aiosqlite async driver)**  
**Migration Target: PostgreSQL (with asyncpg driver)**  
**ORM: SQLAlchemy 2.x (async, 2.0 style)**  
**Migrations: Alembic**

## Rationale

### Why SQLite for Local Development

| Factor | SQLite | PostgreSQL (local) |
|--------|--------|-------------------|
| **Memory** | ~few MB | 100-500 MB |
| **Setup** | Zero (file) | Docker/service install |
| **Portability** | Single file | Dump/restore |
| **Concurrency** | Single writer | Full MVCC |
| **8 GB Fit** | ✅ Excellent | ❌ Heavy |
| **Dev Speed** | Instant | Minutes |

### Why PostgreSQL for Production

| Requirement | SQLite | PostgreSQL |
|-------------|--------|------------|
| Concurrent users | ❌ | ✅ |
| Connection pooling | ❌ | ✅ |
| JSONB indexing | Limited | ✅ GIN |
| Full-text search | FTS5 extension | ✅ Native |
| Read replicas | ❌ | ✅ |
| Advisory locks | ❌ | ✅ |
| Point-in-time recovery | ❌ | ✅ |

### Why SQLAlchemy 2.x

| Feature | Benefit |
|---------|---------|
| **Async native** | `AsyncSession`, `async_engine`, no greenlets |
| **2.0 style** | `select()`, `insert()`, typed results |
| **Pydantic integration** | `from_orm` → `model_validate` seamless |
| **Dialect agnostic** | Same models work on SQLite/PostgreSQL |
| **Migration support** | Alembic first-class |

### Why Alembic

- Version-controlled schema changes
- Auto-generation from SQLAlchemy models
- Upgrade/downgrade scripts
- Works with async engines
- Industry standard

## Schema Design Principles

### 1. Dialect-Agnostic Models

```python
# Use custom JSON column that adapts to dialect
def JSONColumn():
    class JSONType(TypeDecorator):
        impl = TEXT
        cache_ok = True
        def load_dialect_impl(self, dialect):
            if dialect.name == "postgresql":
                return dialect.type_descriptor(PGJSONB())
            return dialect.type_descriptor(SQLiteJSON())
    return JSONType()
```

### 2. UUID as String (SQLite) / Native UUID (PostgreSQL)

```python
class DialectUUID(TypeDecorator):
    impl = String(36)
    cache_ok = True
    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PGUUID())
        return dialect.type_descriptor(String(36))
```

### 3. ENUM as String with CHECK Constraints (SQLite) / Native ENUM (PostgreSQL)

```python
# SQLite: CHECK constraint via trigger
# PostgreSQL: Native ENUM type
class JobStatus(str, PyEnum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

# In model:
status: Mapped[JobStatus] = mapped_column(
    SQLEnum(JobStatus),  # SQLAlchemy handles dialect differences
    default=JobStatus.PENDING,
)
```

### 4. Indexes for Query Patterns

```python
__table_args__ = (
    Index("ix_jobs_user_status", "user_id", "status"),
    Index("ix_jobs_module_status", "module_id", "status"),
    Index("ix_jobs_created_status", "created_at", "status"),
)
```

## Core Tables

| Table | Purpose | Key Indexes |
|-------|---------|-------------|
| `users` | Authentication | `email` (unique), `is_active` |
| `modules` | Module registry | `id` (PK), `enabled` |
| `module_configs` | User-module settings | `(user_id, module_id)` unique |
| `jobs` | Background job queue | `(user_id, status)`, `(module_id, status)`, `(created_at, status)` |
| `job_logs` | Job execution logs | `(job_id, level)` |
| `files` | File metadata | `(user_id, module_id)`, `checksum` |
| `file_tags` | File tagging | `(file_id, tag)` unique |
| `ai_usage_logs` | AI cost tracking | `(user_id, provider)`, `(user_id, model)`, `created_at` |
| `settings` | App settings | `id` (PK) |
| `setting_values` | Key-value settings | `(settings_id, key)` unique |

## Migration Strategy

### Local Development (SQLite)

```bash
# Create migration
uv run alembic revision --autogenerate -m "add user preferences"

# Apply
uv run alembic upgrade head

# Rollback
uv run alembic downgrade -1
```

### Production (PostgreSQL)

```bash
# Same commands, different DATABASE_URL
DATABASE_URL=postgresql+asyncpg://user:pass@host/db uv run alembic upgrade head
```

### Handling Dialect Differences in Migrations

```python
# In migration script
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql, sqlite


def upgrade() -> None:
    # JSON column - dialect specific
    if op.get_context().dialect.name == "postgresql":
        op.add_column("table", sa.Column("data", postgresql.JSONB()))
    else:
        op.add_column("table", sa.Column("data", sqlite.JSON()))

    # UUID column
    if op.get_context().dialect.name == "postgresql":
        op.add_column("table", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True))
    else:
        op.add_column("table", sa.Column("id", sa.String(36), primary_key=True))
```

## Connection Configuration

### SQLite (Local)

```python
engine = create_async_engine(
    "sqlite+aiosqlite:///./data/local_ai_studio.db",
    echo=False,
    poolclass=NullPool,  # SQLite doesn't benefit from pooling
    connect_args={"check_same_thread": False},
)
```

### PostgreSQL (Production)

```python
engine = create_async_engine(
    "postgresql+asyncpg://user:pass@host:5432/db",
    echo=False,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600,
)
```

## Repository Pattern

```python
class BaseRepository(Generic[ModelType]):
    def __init__(self, session: AsyncSession, model: type[ModelType]):
        self.session = session
        self.model = model

    async def get(self, id: str) -> ModelType | None:
        return await self.session.get(self.model, id)

    async def list(self, **filters) -> Sequence[ModelType]:
        stmt = select(self.model).filter_by(**filters)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def create(self, **kwargs) -> ModelType:
        obj = self.model(**kwargs)
        self.session.add(obj)
        await self.session.flush()
        return obj
```

## Consequences

### Positive

- **Zero-config local dev**: `sqlite+aiosqlite:///data.db` just works
- **Type-safe**: Pydantic ↔ SQLAlchemy ↔ Database
- **Migratable**: Same models, Alembic handles dialect differences
- **Lightweight**: < 10 MB RAM for SQLite
- **Portable**: Single file backup/restore

### Negative

- **No concurrent writes**: Single writer (mitigated by job queue serialization)
- **Limited JSON querying**: SQLite JSON1 extension only (mitigated by denormalization)
- **No native UUID/ENUM**: Workarounds needed (handled by custom types)
- **Migration testing**: Must test on both dialects

### Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Schema drift between dialects | CI runs migrations on both SQLite and PostgreSQL |
| JSON query performance | Denormalize frequently queried JSON fields |
| SQLite locking under load | Job queue ensures single writer; WAL mode enabled |
| Data loss | Automated daily backups; WAL mode for durability |

## Implementation Checklist

- [ ] SQLAlchemy 2.x async models with dialect-agnostic types
- [ ] Alembic configured for async with auto-generation
- [ ] Repository pattern for all data access
- [ ] SQLite WAL mode enabled for durability
- [ ] CI pipeline tests migrations on SQLite + PostgreSQL
- [ ] Backup script for local development
- [ ] Connection pool config per environment

## References

- [SQLAlchemy 2.0 Async Tutorial](https://docs.sqlalchemy.org/en/20/tutorial/asyncio.html)
- [Alembic Async Migrations](https://alembic.sqlalchemy.org/en/latest/cookbook.html#async-support)
- [SQLite JSON1 Extension](https://www.sqlite.org/json1.html)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [SQLite WAL Mode](https://www.sqlite.org/wal.html)
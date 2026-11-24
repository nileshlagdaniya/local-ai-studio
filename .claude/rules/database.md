# Database Rules

## Scope

Applies to: `apps/api/src/core/database/**`, `apps/api/src/core/database/migrations/**`

## Rules

### Models

- All models inherit `Base`, `UUIDMixin`, `TimestampMixin`
- Use `Mapped[Type]` annotations on all columns
- Use `mapped_column()` with explicit types
- Use `JSONColumn()` for JSON data (dialect-agnostic)
- Use `DialectUUID()` for UUIDs (dialect-agnostic)
- Define `__table_args__` with indexes for query patterns
- Use `relationship()` with `back_populates`

### Migrations

- All schema changes via Alembic migrations
- Run `uv run alembic revision --autogenerate -m "description"` for changes
- **Review** auto-generated migrations before applying
- Test migrations on SQLite and PostgreSQL
- Implement `downgrade()` when possible
- No data loss in downgrade without approval

### Sessions

- One session per request via `get_session()` dependency
- Auto-commit on success, rollback on exception
- No manual `session.commit()` in services/repositories
- Use `session.flush()` for ID generation

### Repositories

- Use `BaseRepository[ModelType]` for common operations
- Custom repositories for complex queries
- Session injected via dependency
- Type-safe methods with proper return types

### SQLite Specific

- Enable WAL mode: `PRAGMA journal_mode=WAL`
- Use `NullPool` for connection pooling
- `connect_args={"check_same_thread": False}`

### PostgreSQL Compatibility

- All models work on both dialects
- Test migrations on both SQLite and PostgreSQL
- Use dialect-agnostic types only
- Connection pooling: `QueuePool` with sizing

---

**References:** `docs/architecture/database-architecture.md`, `docs/decisions/ADR-002-database.md`, `apps/api/CLAUDE.md`
# Backend — Claude Code Instructions

## FastAPI Architecture

### App Factory Pattern
```python
# src/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await module_registry.initialize()
    await ai_gateway.initialize()
    job_worker.start()
    yield
    job_worker.stop()
    await close_db()

def create_app() -> FastAPI:
    app = FastAPI(lifespan=lifespan, ...)
    app.include_router(...)
    return app
```

### Structure
```
src/
├── main.py                    # App factory
├── config/                    # Settings, logging
├── api/
│   ├── routes/                # Endpoint definitions
│   ├── deps.py                # FastAPI dependencies
│   └── middleware.py          # Custom middleware
├── core/
│   ├── ai_gateway/            # Provider abstraction
│   ├── jobs/                  # Background processing
│   ├── storage/               # File storage
│   └── database/              # SQLAlchemy + Alembic
├── modules/                   # Business logic modules
└── shared/                    # Exceptions, schemas, utils
```

## API Versioning

- **Prefix**: `/api/v1/` (future-proofing)
- **Current**: `/api/` (implicit v1)
- **Version in OpenAPI**: `version="0.1.0"`
- **Breaking changes**: New version prefix, deprecate old

## Pydantic Schemas

### Version 2 Conventions
```python
# schemas.py
from pydantic import BaseModel, Field, ConfigDict
from typing import Annotated

class JobCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    type: Annotated[str, Field(min_length=1, max_length=100)]
    payload: dict = Field(default_factory=dict)
    priority: JobPriority = JobPriority.NORMAL
    module_id: str | None = None

class JobResponse(JobCreate):
    id: str
    status: JobStatus
    progress: float
    result: dict | None = None
    error: str | None = None
    created_at: datetime
    # ...
```

### Rules
- **`ConfigDict`** for all models
- **`extra="forbid"`** by default
- **`Annotated`** with `Field` for validation
- **Type hints** required everywhere
- **Separate** request/response schemas

## SQLAlchemy Models

### 2.0 Style (Async)
```python
# models/job.py
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

    user: Mapped["User"] = relationship(back_populates="jobs")
    module: Mapped["Module"] = relationship(back_populates="jobs")

    __table_args__ = (
        Index("ix_jobs_user_status", "user_id", "status"),
        Index("ix_jobs_module_status", "module_id", "status"),
    )
```

### Rules
- **Inherit** `Base`, `UUIDMixin`, `TimestampMixin`
- **`Mapped`** type annotations required
- **`mapped_column`** with explicit types
- **Dialect-agnostic** `JSONColumn()` for JSON
- **Indexes** for query patterns
- **Relationships** with `back_populates`

## Repository Pattern

```python
# repositories/job.py
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.database.repositories.base import BaseRepository
from src.core.database.models.job import Job, JobStatus

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

    async def complete_job(self, job_id: str, result: dict, error: str | None = None):
        from src.core.database.models.job import JobStatus
        status = JobStatus.COMPLETED if error is None else JobStatus.FAILED
        return await self.update(
            job_id, status=status, result=result, error=error,
            progress=1.0, completed_at=datetime.utcnow()
        )
```

### Rules
- **Generic** `BaseRepository[ModelType]`
- **Session injected** via dependency
- **Type-safe** methods
- **No raw SQL** unless necessary

## Service Layer

```python
# modules/stock_content_factory/service.py
from src.core.jobs.models import Job
from src.core.ai_gateway.facade import ai_gateway

class StockContentFactoryService:
    def __init__(self):
        pass

    async def execute_generate_content(self, job: Job) -> dict:
        payload = job.payload
        response = await ai_gateway.generate(
            prompt=payload["prompt"],
            model=payload.get("model", "qwen2.5-coder:3b"),
            provider=payload.get("provider", "ollama"),
            stream=False,
            user_id=job.user_id,
            request_type="content_generation",
        )
        return {"content": response.content, "usage": response.usage.__dict__}
```

### Rules
- **Pure business logic** — no HTTP, no DB
- **Dependencies injected** (AI gateway, storage)
- **Single responsibility** per service
- **Async** throughout

## Dependency Injection

```python
# api/deps.py
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.database.session import get_session
from src.core.ai_gateway.facade import ai_gateway

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async for session in get_session():
        yield session

def get_ai_gateway() -> AIGateway:
    return ai_gateway
```

### Usage in Routes
```python
@router.post("/jobs")
async def create_job(
    request: CreateJobRequest,
    db: AsyncSession = Depends(get_db),
    ai: AIGateway = Depends(get_ai_gateway),
):
    ...
```

## Database Transactions

### Automatic (Session Context Manager)
```python
# src/core/database/session.py
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

### Rules
- **One session per request** via dependency
- **Auto-commit** on success, rollback on exception
- **No manual** `session.commit()` in services
- **Flush** for ID generation: `await session.flush()`

## Alembic Migrations

### Creating
```bash
# Auto-generate from model changes
uv run alembic revision --autogenerate -m "add user preferences"

# Manual migration
uv run alembic revision -m "add custom index"
```

### Applying
```bash
# Upgrade to latest
uv run alembic upgrade head

# Downgrade one
uv run alembic downgrade -1
```

### Rules
- **Review** auto-generated migrations
- **Test** on SQLite and PostgreSQL
- **No data loss** in downgrade when possible
- **Idempotent** where possible

## Error Handling

### Custom Exceptions
```python
# shared/exceptions.py
class APIError(Exception):
    def __init__(self, status_code: int, detail: str, headers: dict | None = None):
        self.status_code = status_code
        self.detail = detail
        self.headers = headers

class NotFoundError(APIError):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(404, detail)

class ValidationError(APIError):
    def __init__(self, detail: str, errors: list[dict] | None = None):
        super().__init__(422, detail)
        self.errors = errors
```

### Global Handler
```python
# api/middleware.py
class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        try:
            return await call_next(request)
        except APIError as e:
            return JSONResponse(
                status_code=e.status_code,
                content={"error": e.detail, "request_id": request.state.request_id},
                headers=e.headers,
            )
        except Exception:
            logger.exception("unhandled_error")
            return JSONResponse(500, {"error": "Internal server error"})
```

## Logging

### Structured Logging
```python
# config/logging.py
import structlog

def setup_logging():
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.JSONRenderer(),
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
    )
```

### Usage
```python
from src.config.logging import get_logger

logger = get_logger(__name__)

logger.info("job_started", job_id=job.id, type=job.type)
logger.error("generation_failed", job_id=job.id, error=str(e))
```

## Configuration

### Pydantic Settings
```python
# config/settings.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=False
    )

    app_name: str = "Local AI Studio"
    debug: bool = False
    database_url: str = "sqlite+aiosqlite:///./data/local_ai_studio.db"
    ollama_base_url: str = "http://localhost:11434"
    freellmapi_api_key: str = ""
    secret_key: str = "dev-secret"
    # ...
```

### Rules
- **Single source** of truth
- **Type-safe** with validation
- **Environment-specific** via `.env` files
- **Cached** with `@lru_cache`

## Security

### Authentication
- JWT via `python-jose`
- Password hashing via `passlib[bcrypt]`
- Token expiry: 30 days (configurable)

### CORS
```python
app.add_middleware(CORSMiddleware, **settings.cors_config)
# cors_config from Settings: allow_origins, allow_credentials, allow_methods, allow_headers
```

### Input Validation
- **Pydantic** on all request bodies
- **Field constraints**: min/max length, regex, enums
- **Extra forbidden**: `extra="forbid"`

### File Uploads
- **Size limit**: `MAX_FILE_SIZE` (default 100 MB)
- **MIME validation**: `ALLOWED_EXTENSIONS`
- **Path traversal**: sanitize filenames

## HTTP Client Conventions

### HTTPX Async Client
```python
# In providers
self._client = httpx.AsyncClient(
    timeout=timeout,
    headers={"Authorization": f"Bearer {api_key}"},
)

async with self.client.stream("POST", url, json=payload) as response:
    async for line in response.aiter_lines():
        ...
```

### Rules
- **Reuse** client instances
- **Timeouts** on all requests
- **Stream** for large responses
- **Retry** with tenacity for transient failures

## Testing

### Pytest Conventions
```python
# tests/conftest.py
@pytest_asyncio.fixture
async def test_db():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async_session = async_sessionmaker(engine, class_=AsyncSession)
    async with async_session() as session:
        yield session
    await engine.dispose()

# tests/test_jobs.py
async def test_create_job(test_db):
    repo = JobRepository(test_db)
    job = await repo.create(type="test", user_id="user1")
    assert job.status == JobStatus.PENDING
```

### Rules
- **Async fixtures** for database
- **Unit tests** for services/repositories
- **Integration tests** for API routes
- **Mock** external dependencies (Ollama, FreeLLMAPI)
- **Coverage**: `uv run pytest --cov=src`

## Background Job Architecture

### Queue + Worker
```python
# core/jobs/queue.py
class JobQueue:
    async def enqueue(self, job: Job) -> str: ...
    async def dequeue(self) -> Job | None: ...
    async def complete(self, job_id: str, result: dict = None, error: str = None): ...

# core/jobs/worker.py
class JobWorker:
    def register_executor(self, job_type: str, executor: Callable): ...
    async def _execute_job(self, job: Job): ...
```

### Rules
- **In-process** priority queue (no Redis)
- **Sequential** execution (`max_concurrent=1`)
- **Module registers** executors at startup
- **Progress updates** via `queue.update_progress()`

## Provider Abstraction

### Base Provider
```python
# core/ai_gateway/base.py
class AIProvider(ABC):
    @property
    @abstractmethod
    def name(self) -> ProviderName: ...
    @abstractmethod
    async def generate(self, request: GenerationRequest) -> GenerationResponse: ...
    @abstractmethod
    async def stream_generate(self, request: GenerationRequest) -> AsyncGenerator[StreamChunk, None]: ...
```

### Registry + Facade
```python
# core/ai_gateway/registry.py
class ProviderRegistry:
    def get(self, name: ProviderName) -> AIProvider | None: ...

# core/ai_gateway/facade.py
class AIGateway:
    async def generate(self, ..., stream: bool = True) -> GenerationResponse | AsyncGenerator: ...
```

### Rules
- **Unified interface** for all providers
- **Streaming** via async generators
- **Metrics** recorded per request
- **Health checks** at startup

---

**See also:** Root `CLAUDE.md`, `.claude/skills/backend-development/SKILL.md`
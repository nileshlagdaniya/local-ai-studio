# Backend Development Skill

## Overview

This skill provides guidance for backend development in Local AI Studio using FastAPI, Python 3.12, Pydantic v2, SQLAlchemy 2.x, and Alembic.

## API Endpoint Creation

### Route Structure

```python
# src/api/routes/jobs.py
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from src.core.jobs.queue import JobQueue
from src.core.jobs.models import Job, JobStatus, JobPriority

router = APIRouter(prefix="/jobs", tags=["jobs"])

class CreateJobRequest(BaseModel):
    type: str
    payload: dict = {}
    priority: JobPriority = JobPriority.NORMAL
    module_id: str | None = None

@router.post("", response_model=JobResponse, status_code=202)
async def create_job(request: CreateJobRequest, user_id: str = Depends(get_current_user)):
    job = Job(type=request.type, payload=request.payload, priority=request.priority, module_id=request.module_id, user_id=user_id)
    await job_queue.enqueue(job)
    return job
```

### Conventions

- **Router prefix**: `/api/{resource}` (e.g., `/api/jobs`, `/api/ai`)
- **Tags**: Lowercase plural (e.g., `["jobs"]`, `["ai"]`)
- **Status codes**: 200 (GET), 201 (POST create), 202 (async), 204 (DELETE)
- **Response models**: Always define `response_model`
- **Dependencies**: Use `Depends()` for DB, auth, services

### Request/Response Schemas

```python
# Separate request/response schemas
class JobCreate(BaseModel):
    type: str
    payload: dict = Field(default_factory=dict)

class JobResponse(JobCreate):
    id: str
    status: JobStatus
    progress: float
    created_at: datetime
    # ...
```

## Service Implementation

### Service Template

```python
# src/modules/{module_name}/service.py
from src.core.jobs.models import Job
from src.core.ai_gateway.facade import ai_gateway

class ModuleNameService:
    def __init__(self):
        self.storage = LocalStorage()

    async def execute_job_type(self, job: Job) -> dict:
        # 1. Validate payload
        payload = job.payload
        # 2. Call AI gateway or other services
        response = await ai_gateway.generate(...)
        # 3. Process result
        # 4. Save files if needed
        file_meta = await self.storage.save(...)
        # 5. Return structured result
        return {"result": response.content, "file_id": file_meta.id}
```

### Rules

- **Pure business logic** — no HTTP handling
- **Dependencies injected** via constructor
- **Single responsibility** per method
- **Async** throughout
- **Return typed dicts** or Pydantic models

## Repository Implementation

### Base Repository

```python
# src/core/database/repositories/base.py
from typing import Generic, TypeVar, Sequence
from sqlalchemy import select, func
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

    async def list(self, **filters) -> Sequence[ModelType]:
        stmt = select(self.model).filter_by(**filters)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def create(self, **kwargs) -> ModelType:
        obj = self.model(**kwargs)
        self.session.add(obj)
        await self.session.flush()
        return obj

    async def update(self, id: str, **kwargs) -> ModelType | None:
        obj = await self.get(id)
        if not obj: return None
        for k, v in kwargs.items(): setattr(obj, k, v)
        await self.session.flush()
        return obj
```

### Custom Repository

```python
# src/core/database/repositories/job.py
from sqlalchemy import select, desc
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
```

## Pydantic Validation

### Model Config

```python
from pydantic import BaseModel, Field, ConfigDict
from typing import Annotated

class JobCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    type: Annotated[str, Field(min_length=1, max_length=100)]
    payload: dict = Field(default_factory=dict)
    priority: JobPriority = JobPriority.NORMAL
    module_id: str | None = None
```

### Common Patterns

```python
# Email
email: Annotated[str, Field(pattern=r"^[^@]+@[^@]+\.[^@]+$")]

# UUID
id: Annotated[str, Field(pattern=r"^[0-9a-f-]{36}$")]

# Enum
status: JobStatus = Field(default=JobStatus.PENDING)

# Optional with default
max_tokens: int = Field(default=4096, ge=1, le=32768)

# List of strings
tags: list[str] = Field(default_factory=list)
```

## Exception Handling

### Custom Exceptions

```python
# src/shared/exceptions.py
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

### Usage in Services

```python
async def get_module(module_id: str) -> Module:
    module = await repo.get(module_id)
    if not module:
        raise NotFoundError(f"Module {module_id} not found")
    return module
```

### Global Handler

Errors caught in `ErrorHandlingMiddleware` — no try/except in routes.

## Unit Testing

### Test Structure

```
tests/
├── conftest.py              # Fixtures
├── unit/
│   ├── test_repositories/   # Repository tests
│   ├── test_services/       # Service tests
│   └── test_utils/          # Utility tests
└── integration/
    └── test_api/            # API route tests
```

### Fixtures

```python
# tests/conftest.py
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from src.core.database.base import Base

@pytest_asyncio.fixture
async def test_db():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session
    await engine.dispose()

@pytest.fixture
def job_repo(test_db):
    return JobRepository(test_db)
```

### Test Example

```python
# tests/unit/test_repositories/test_job.py
import pytest
from src.core.database.models.job import Job, JobStatus, JobPriority

class TestJobRepository:
    async def test_create_job(self, job_repo):
        job = await job_repo.create(
            type="test",
            payload={"key": "value"},
            user_id="user1",
            priority=JobPriority.HIGH,
        )
        assert job.id is not None
        assert job.status == JobStatus.PENDING
        assert job.priority == JobPriority.HIGH

    async def test_get_pending_jobs(self, job_repo):
        await job_repo.create(type="a", user_id="u1", priority=JobPriority.LOW)
        await job_repo.create(type="b", user_id="u1", priority=JobPriority.HIGH)
        pending = await job_repo.get_pending_jobs(limit=1)
        assert len(pending) == 1
        assert pending[0].priority == JobPriority.HIGH
```

### Running Tests

```bash
# All tests
uv run pytest

# With coverage
uv run pytest --cov=src --cov-report=term-missing

# Specific module
uv run pytest tests/unit/test_repositories/ -v

# Async tests
uv run pytest -k "async" -v
```

---

**Reference:** `apps/api/CLAUDE.md` for complete rules
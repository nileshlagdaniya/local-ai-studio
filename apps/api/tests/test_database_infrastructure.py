"""Tests for database infrastructure layer."""
import pytest
import pytest_asyncio
from datetime import datetime, timedelta
from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.core.database.models.infrastructure import (
    JobStatus,
    JobPriority,
    AppSettings,
    AIProvider,
    AIProviderModel,
    AutomationJob,
    ActivityLog,
)
from src.core.database.repositories.infrastructure import (
    AppSettingsRepository,
    AIProviderRepository,
    AIProviderModelRepository,
    AutomationJobRepository,
    ActivityLogRepository,
)


class TestAppSettings:
    """Tests for AppSettings model and repository."""

    @pytest_asyncio.fixture
    async def repo(self, test_session: AsyncSession) -> AppSettingsRepository:
        return AppSettingsRepository(test_session)

    async def test_create_and_get(self, repo: AppSettingsRepository):
        setting = await repo.create(
            id=str(uuid4()),
            category="test",
            key="test_key",
            value="test_value",
            value_type="string",
            description="Test setting",
        )
        assert setting.category == "test"
        assert setting.key == "test_key"
        assert setting.value == "test_value"

        fetched = await repo.get_by_id(setting.id)
        assert fetched is not None
        assert fetched.category == "test"

    async def test_get_by_category(self, repo: AppSettingsRepository):
        await repo.create(
            id=str(uuid4()),
            category="ai",
            key="model",
            value="qwen",
            value_type="string",
        )
        await repo.create(
            id=str(uuid4()),
            category="ai",
            key="temperature",
            value="0.7",
            value_type="float",
        )
        await repo.create(
            id=str(uuid4()),
            category="storage",
            key="path",
            value="/data",
            value_type="string",
        )

        ai_settings = await repo.get_by_category("ai")
        assert len(ai_settings) == 2

        storage_settings = await repo.get_by_category("storage")
        assert len(storage_settings) == 1

    async def test_set_value_upsert(self, repo: AppSettingsRepository):
        await repo.set_value("test", "key1", "value1", "string")
        setting = await repo.get_by_category_and_key("test", "key1")
        assert setting.value == "value1"

        # Update
        updated = await repo.set_value("test", "key1", "value2", "string")
        assert updated.value == "value2"

    async def test_unique_constraint(self, repo: AppSettingsRepository):
        await repo.create(
            id=str(uuid4()),
            category="test",
            key="unique_key",
            value="value1",
            value_type="string",
        )
        # Duplicate should fail
        with pytest.raises(Exception):
            await repo.create(
                id=str(uuid4()),
                category="test",
                key="unique_key",
                value="value2",
                value_type="string",
            )


class TestAIProvider:
    """Tests for AIProvider model and repository."""

    @pytest_asyncio.fixture
    async def repo(self, test_session: AsyncSession) -> AIProviderRepository:
        return AIProviderRepository(test_session)

    async def test_create_ollama_provider(self, repo: AIProviderRepository):
        provider = await repo.create(
            id=str(uuid4()),
            name="ollama",
            display_name="Ollama (Local)",
            provider_type="ollama",
            base_url="http://localhost:11434",
            is_enabled=True,
            is_default=True,
            priority=10,
            timeout_seconds=300,
            max_concurrent_requests=1,
            config={},
        )
        assert provider.provider_type == "ollama"
        assert provider.is_enabled is True

    async def test_create_freellmapi_provider(self, repo: AIProviderRepository):
        provider = await repo.create(
            id=str(uuid4()),
            name="freellmapi",
            display_name="FreeLLMAPI (Cloud)",
            provider_type="freellmapi",
            base_url="https://api.freellmapi.xyz",
            api_key="encrypted_key_here",
            is_enabled=True,
            is_default=False,
            priority=20,
            timeout_seconds=120,
            max_concurrent_requests=1,
            config={},
        )
        assert provider.provider_type == "freellmapi"

    async def test_get_enabled(self, repo: AIProviderRepository):
        await repo.create(
            id=str(uuid4()),
            name="ollama",
            display_name="Ollama",
            provider_type="ollama",
            is_enabled=True,
        )
        await repo.create(
            id=str(uuid4()),
            name="freellmapi",
            display_name="FreeLLMAPI",
            provider_type="freellmapi",
            is_enabled=False,
        )

        enabled = await repo.get_enabled()
        assert len(enabled) == 1
        assert enabled[0].name == "ollama"

    async def test_get_default(self, repo: AIProviderRepository):
        await repo.create(
            id=str(uuid4()),
            name="ollama",
            display_name="Ollama",
            provider_type="ollama",
            is_enabled=True,
            is_default=True,
        )
        await repo.create(
            id=str(uuid4()),
            name="freellmapi",
            display_name="FreeLLMAPI",
            provider_type="freellmapi",
            is_enabled=True,
            is_default=False,
        )

        default = await repo.get_default()
        assert default is not None
        assert default.is_default is True

    async def test_update_health_status(self, repo: AIProviderRepository):
        provider = await repo.create(
            id=str(uuid4()),
            name="ollama",
            display_name="Ollama",
            provider_type="ollama",
            is_enabled=True,
        )

        updated = await repo.update_health_status(provider.id, "healthy")
        assert updated.last_health_status == "healthy"
        assert updated.last_health_check is not None


class TestAIProviderModel:
    """Tests for AIProviderModel model and repository."""

    @pytest_asyncio.fixture
    async def provider_repo(self, test_session: AsyncSession) -> AIProviderRepository:
        return AIProviderRepository(test_session)

    @pytest_asyncio.fixture
    async def model_repo(self, test_session: AsyncSession) -> AIProviderModelRepository:
        return AIProviderModelRepository(test_session)

    async def test_create_model(self, provider_repo: AIProviderRepository, model_repo: AIProviderModelRepository):
        provider = await provider_repo.create(
            id=str(uuid4()),
            name="ollama",
            display_name="Ollama",
            provider_type="ollama",
            is_enabled=True,
        )

        model = await model_repo.create(
            id=str(uuid4()),
            provider_id=provider.id,
            model_id="qwen2.5-coder:3b",
            display_name="Qwen 2.5 Coder 3B",
            capabilities={"chat": True, "completion": True},
            max_tokens=4096,
            context_length=8192,
            is_enabled=True,
            is_default=True,
            size_gb=1.9,
        )
        assert model.provider_id == provider.id
        assert model.model_id == "qwen2.5-coder:3b"

    async def test_get_default_model(self, provider_repo: AIProviderRepository, model_repo: AIProviderModelRepository):
        provider = await provider_repo.create(
            id=str(uuid4()),
            name="ollama",
            display_name="Ollama",
            provider_type="ollama",
            is_enabled=True,
        )

        await model_repo.create(
            id=str(uuid4()),
            provider_id=provider.id,
            model_id="qwen2.5-coder:3b",
            is_enabled=True,
            is_default=True,
        )
        await model_repo.create(
            id=str(uuid4()),
            provider_id=provider.id,
            model_id="llama3.2:3b",
            is_enabled=True,
            is_default=False,
        )

        default = await model_repo.get_default_model(provider.id)
        assert default is not None
        assert default.is_default is True
        assert default.model_id == "qwen2.5-coder:3b"


class TestAutomationJob:
    """Tests for AutomationJob model and repository."""

    @pytest_asyncio.fixture
    async def repo(self, test_session: AsyncSession) -> AutomationJobRepository:
        return AutomationJobRepository(test_session)

    async def test_create_job(self, repo: AutomationJobRepository):
        job = await repo.create(
            id=str(uuid4()),
            job_type="stock_content_generation",
            user_id="user123",
            module_id="stock_factory",
            status=JobStatus.PENDING,
            priority=JobPriority.NORMAL,
            payload={"prompt": "Generate analysis", "symbols": ["AAPL", "GOOGL"]},
        )
        assert job.job_type == "stock_content_generation"
        assert job.status == JobStatus.PENDING
        assert job.priority == JobPriority.NORMAL
        assert job.progress == 0.0

    async def test_update_status(self, repo: AutomationJobRepository):
        job = await repo.create(
            id=str(uuid4()),
            job_type="test",
            status=JobStatus.PENDING,
            priority=JobPriority.NORMAL,
            payload={},
        )

        # Update to running
        updated = await repo.update_status(job.id, JobStatus.RUNNING)
        assert updated.status == JobStatus.RUNNING
        assert updated.started_at is not None

        # Update to completed
        updated = await repo.update_status(
            job.id, JobStatus.COMPLETED, result={"output": "done"}, progress=1.0
        )
        assert updated.status == JobStatus.COMPLETED
        assert updated.completed_at is not None
        assert updated.progress == 1.0

        # Update to failed
        job2 = await repo.create(
            id=str(uuid4()),
            job_type="test2",
            status=JobStatus.RUNNING,
            priority=JobPriority.NORMAL,
            payload={},
        )
        updated = await repo.update_status(job2.id, JobStatus.FAILED, error="Timeout")
        assert updated.status == JobStatus.FAILED
        assert updated.error == "Timeout"
        assert updated.completed_at is not None

    async def test_get_pending_jobs(self, repo: AutomationJobRepository):
        await repo.create(
            id=str(uuid4()),
            job_type="type1",
            status=JobStatus.PENDING,
            priority=JobPriority.HIGH,
            payload={},
        )
        await repo.create(
            id=str(uuid4()),
            job_type="type2",
            status=JobStatus.PENDING,
            priority=JobPriority.NORMAL,
            payload={},
        )
        await repo.create(
            id=str(uuid4()),
            job_type="type3",
            status=JobStatus.RUNNING,
            priority=JobPriority.NORMAL,
            payload={},
        )

        pending = await repo.get_pending_jobs(limit=10)
        assert len(pending) == 2
        # High priority first
        assert pending[0].priority == JobPriority.HIGH

    async def test_get_jobs_for_retry(self, repo: AutomationJobRepository):
        # Job with retries left
        await repo.create(
            id=str(uuid4()),
            job_type="retry1",
            status=JobStatus.FAILED,
            priority=JobPriority.NORMAL,
            payload={},
            retry_count=1,
            max_retries=3,
            next_retry_at=datetime.utcnow(),
        )
        # Job at max retries
        await repo.create(
            id=str(uuid4()),
            job_type="retry2",
            status=JobStatus.FAILED,
            priority=JobPriority.NORMAL,
            payload={},
            retry_count=3,
            max_retries=3,
            next_retry_at=datetime.utcnow(),
        )
        # Job not due yet
        await repo.create(
            id=str(uuid4()),
            job_type="retry3",
            status=JobStatus.FAILED,
            priority=JobPriority.NORMAL,
            payload={},
            retry_count=1,
            max_retries=3,
            next_retry_at=datetime.utcnow() + timedelta(hours=1),
        )

        for_retry = await repo.get_jobs_for_retry()
        assert len(for_retry) == 1

    async def test_increment_retry(self, repo: AutomationJobRepository):
        job = await repo.create(
            id=str(uuid4()),
            job_type="retry",
            status=JobStatus.FAILED,
            priority=JobPriority.NORMAL,
            payload={},
            retry_count=1,
            max_retries=3,
        )

        next_retry = datetime.utcnow() + timedelta(minutes=5)
        updated = await repo.increment_retry(job.id, next_retry)
        assert updated.retry_count == 2
        assert updated.next_retry_at == next_retry
        assert updated.status == JobStatus.PENDING


class TestActivityLog:
    """Tests for ActivityLog model and repository."""

    @pytest_asyncio.fixture
    async def repo(self, test_session: AsyncSession) -> ActivityLogRepository:
        return ActivityLogRepository(test_session)

    async def test_log_activity(self, repo: ActivityLogRepository):
        log = await repo.log(
            event_type="job_completed",
            event_category="job",
            title="Job finished",
            message="Stock content generation completed",
            severity="info",
            user_id="user123",
            job_id="job456",
            details={"duration_ms": 12345},
        )
        assert log.event_type == "job_completed"
        assert log.severity == "info"

    async def test_get_by_user(self, repo: ActivityLogRepository):
        await repo.log(
            event_type="login",
            event_category="user",
            title="User logged in",
            message="User logged in from Chrome",
            severity="info",
            user_id="user1",
        )
        await repo.log(
            event_type="job_started",
            event_category="job",
            title="Job started",
            message="Job started",
            severity="info",
            user_id="user2",
        )
        await repo.log(
            event_type="job_completed",
            event_category="job",
            title="Job completed",
            message="Job completed",
            severity="info",
            user_id="user1",
        )

        user1_logs = await repo.get_by_user("user1", limit=10)
        assert len(user1_logs) == 2

    async def test_get_by_category_and_severity(self, repo: ActivityLogRepository):
        await repo.log(
            event_type="error",
            event_category="ai",
            title="AI error",
            message="Ollama connection failed",
            severity="error",
        )
        await repo.log(
            event_type="warning",
            event_category="ai",
            title="AI warning",
            message="Slow response",
            severity="warning",
        )

        ai_errors = await repo.get_by_category("ai", severity="error", limit=10)
        assert len(ai_errors) == 1
        assert ai_errors[0].severity == "error"

    async def test_count_by_severity(self, repo: ActivityLogRepository):
        await repo.log(event_type="e1", event_category="system", title="t1", message="m1", severity="info")
        await repo.log(event_type="e2", event_category="system", title="t2", message="m2", severity="error")
        await repo.log(event_type="e3", event_category="system", title="t3", message="m3", severity="error")

        counts = await repo.count_by_severity()
        assert counts.get("info") == 1
        assert counts.get("error") == 2


class TestModelRelationships:
    """Tests for model relationships and constraints."""

    async def test_ai_provider_model_cascade_delete(self, test_session: AsyncSession):
        from src.core.database.models.infrastructure import AIProvider, AIProviderModel

        provider = AIProvider(
            id=str(uuid4()),
            name="ollama",
            display_name="Ollama",
            provider_type="ollama",
            is_enabled=True,
        )
        test_session.add(provider)

        model = AIProviderModel(
            id=str(uuid4()),
            provider_id=provider.id,
            model_id="qwen2.5-coder:3b",
            is_enabled=True,
        )
        test_session.add(model)
        await test_session.commit()

        # Delete provider should cascade
        await test_session.delete(provider)
        await test_session.commit()

        # Model should be gone
        result = await test_session.execute(
            select(AIProviderModel).where(AIProviderModel.provider_id == provider.id)
        )
        assert result.scalar_one_or_none() is None

    async def test_job_progress_constraint(self, test_session: AsyncSession):
        from src.core.database.models.infrastructure import AutomationJob, JobStatus, JobPriority

        job = AutomationJob(
            id=str(uuid4()),
            job_type="test",
            status=JobStatus.PENDING,
            priority=JobPriority.NORMAL,
            payload={},
            progress=1.5,  # Invalid - > 1.0
        )
        test_session.add(job)
        with pytest.raises(Exception):
            await test_session.commit()

    async def test_settings_value_type_constraint(self, test_session: AsyncSession):
        from src.core.database.models.infrastructure import AppSettings

        setting = AppSettings(
            id=str(uuid4()),
            category="test",
            key="test",
            value="value",
            value_type="invalid_type",  # Should fail
        )
        test_session.add(setting)
        with pytest.raises(Exception):
            await test_session.commit()

    async def test_unique_provider_model(self, test_session: AsyncSession):
        from src.core.database.models.infrastructure import AIProvider, AIProviderModel

        provider = AIProvider(
            id=str(uuid4()),
            name="ollama",
            display_name="Ollama",
            provider_type="ollama",
            is_enabled=True,
        )
        test_session.add(provider)

        model1 = AIProviderModel(
            id=str(uuid4()),
            provider_id=provider.id,
            model_id="qwen2.5-coder:3b",
            is_enabled=True,
        )
        test_session.add(model1)
        await test_session.commit()

        # Duplicate should fail
        model2 = AIProviderModel(
            id=str(uuid4()),
            provider_id=provider.id,
            model_id="qwen2.5-coder:3b",
            is_enabled=True,
        )
        test_session.add(model2)
        with pytest.raises(Exception):
            await test_session.commit()


# Import timedelta
from datetime import timedelta
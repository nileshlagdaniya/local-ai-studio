"""Repository layer for infrastructure tables."""
from collections.abc import Sequence
from datetime import datetime
from uuid import uuid4

from sqlalchemy import asc, desc, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database.models.infrastructure import (
    ActivityLog,
    AIProvider,
    AIProviderModel,
    AppSettings,
    AutomationJob,
    JobStatus,
)
from src.core.database.repositories.base import BaseRepository


class AppSettingsRepository(BaseRepository[AppSettings]):
    """Repository for app_settings table."""

    def __init__(self, session: AsyncSession):
        super().__init__(session, AppSettings)

    async def get_by_category(self, category: str) -> Sequence[AppSettings]:
        stmt = select(AppSettings).where(AppSettings.category == category).order_by(AppSettings.key)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_by_category_and_key(self, category: str, key: str) -> AppSettings | None:
        stmt = select(AppSettings).where(
            AppSettings.category == category, AppSettings.key == key
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def set_value(
        self, category: str, key: str, value: str, value_type: str = "string", description: str | None = None
    ) -> AppSettings:
        existing = await self.get_by_category_and_key(category, key)
        if existing:
            return await self.update(
                existing.id,
                value=value,
                value_type=value_type,
                description=description,
            )
        return await self.create(
            id=str(uuid4()),
            category=category,
            key=key,
            value=value,
            value_type=value_type,
            description=description,
        )


class AIProviderRepository(BaseRepository[AIProvider]):
    """Repository for ai_providers table."""

    def __init__(self, session: AsyncSession):
        super().__init__(session, AIProvider)

    async def get_enabled(self) -> Sequence[AIProvider]:
        stmt = select(AIProvider).where(AIProvider.is_enabled).order_by(AIProvider.priority)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_default(self) -> AIProvider | None:
        stmt = select(AIProvider).where(AIProvider.is_default, AIProvider.is_enabled)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_type(self, provider_type: str) -> Sequence[AIProvider]:
        stmt = select(AIProvider).where(AIProvider.provider_type == provider_type)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def update_health_status(
        self,
        provider_id: str,
        status: str,
        checked_at: datetime | None = None,
    ) -> AIProvider | None:
        return await self.update(
            provider_id,
            last_health_status=status,
            last_health_check=checked_at or datetime.utcnow(),
        )


class AIProviderModelRepository(BaseRepository[AIProviderModel]):
    """Repository for ai_provider_models table."""

    def __init__(self, session: AsyncSession):
        super().__init__(session, AIProviderModel)

    async def get_by_provider(self, provider_id: str, enabled_only: bool = False) -> Sequence[AIProviderModel]:
        stmt = select(AIProviderModel).where(AIProviderModel.provider_id == provider_id)
        if enabled_only:
            stmt = stmt.where(AIProviderModel.is_enabled)
        stmt = stmt.order_by(AIProviderModel.is_default.desc(), AIProviderModel.model_id)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_default_model(self, provider_id: str) -> AIProviderModel | None:
        stmt = select(AIProviderModel).where(
            AIProviderModel.provider_id == provider_id,
            AIProviderModel.is_default,
            AIProviderModel.is_enabled,
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def set_default_model(self, provider_id: str, model_id: str) -> None:
        # Clear existing default
        await self.session.execute(
            update(AIProviderModel)
            .where(AIProviderModel.provider_id == provider_id)
            .values(is_default=False)
        )
        # Set new default
        stmt = (
            update(AIProviderModel)
            .where(AIProviderModel.provider_id == provider_id, AIProviderModel.model_id == model_id)
            .values(is_default=True)
        )
        await self.session.execute(stmt)
        await self.session.flush()


class AutomationJobRepository(BaseRepository[AutomationJob]):
    """Repository for automation_jobs table."""

    def __init__(self, session: AsyncSession):
        super().__init__(session, AutomationJob)

    async def get_pending_jobs(self, limit: int = 10) -> Sequence[AutomationJob]:
        stmt = (
            select(AutomationJob)
            .where(AutomationJob.status == JobStatus.PENDING)
            .order_by(asc(AutomationJob.priority), AutomationJob.created_at)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_running_jobs(self) -> Sequence[AutomationJob]:
        stmt = select(AutomationJob).where(AutomationJob.status == JobStatus.RUNNING)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_jobs_for_retry(self) -> Sequence[AutomationJob]:
        stmt = select(AutomationJob).where(
            AutomationJob.status == JobStatus.FAILED,
            AutomationJob.retry_count < AutomationJob.max_retries,
            (AutomationJob.next_retry_at.is_(None)) | (AutomationJob.next_retry_at <= datetime.utcnow()),
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_by_user(
        self, user_id: str, status: JobStatus | None = None, limit: int = 50
    ) -> Sequence[AutomationJob]:
        stmt = select(AutomationJob).where(AutomationJob.user_id == user_id)
        if status:
            stmt = stmt.where(AutomationJob.status == status)
        stmt = stmt.order_by(desc(AutomationJob.created_at)).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_by_module(
        self, module_id: str, status: JobStatus | None = None, limit: int = 50
    ) -> Sequence[AutomationJob]:
        stmt = select(AutomationJob).where(AutomationJob.module_id == module_id)
        if status:
            stmt = stmt.where(AutomationJob.status == status)
        stmt = stmt.order_by(desc(AutomationJob.created_at)).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def update_status(
        self,
        job_id: str,
        status: JobStatus,
        error: str | None = None,
        result: dict | None = None,
        progress: float | None = None,
    ) -> AutomationJob | None:
        update_data = {"status": status, "updated_at": datetime.utcnow()}
        if error is not None:
            update_data["error"] = error
        if result is not None:
            update_data["result"] = result
        if progress is not None:
            update_data["progress"] = progress

        if status == JobStatus.RUNNING:
            update_data["started_at"] = datetime.utcnow()
        elif status in (JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.CANCELLED):
            update_data["completed_at"] = datetime.utcnow()

        return await self.update(job_id, **update_data)

    async def increment_retry(self, job_id: str, next_retry_at: datetime) -> AutomationJob | None:
        stmt = (
            update(AutomationJob)
            .where(AutomationJob.id == job_id)
            .values(retry_count=AutomationJob.retry_count + 1, next_retry_at=next_retry_at, status=JobStatus.PENDING)
            .returning(AutomationJob)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def add_token_usage(self, job_id: str, usage: dict) -> AutomationJob | None:
        job = await self.get_by_id(job_id)
        if not job:
            return None
        current = job.token_usage or {}
        for k, v in usage.items():
            current[k] = current.get(k, 0) + v
        return await self.update(job_id, token_usage=current)


class ActivityLogRepository(BaseRepository[ActivityLog]):
    """Repository for activity_logs table."""

    def __init__(self, session: AsyncSession):
        super().__init__(session, ActivityLog)

    async def log(
        self,
        event_type: str,
        event_category: str,
        title: str,
        message: str,
        severity: str = "info",
        user_id: str | None = None,
        job_id: str | None = None,
        module_id: str | None = None,
        resource_type: str | None = None,
        resource_id: str | None = None,
        details: dict | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
        correlation_id: str | None = None,
    ) -> ActivityLog:
        return await self.create(
            event_type=event_type,
            event_category=event_category,
            severity=severity,
            user_id=user_id,
            job_id=job_id,
            module_id=module_id,
            resource_type=resource_type,
            resource_id=resource_id,
            title=title,
            message=message,
            details=details or {},
            ip_address=ip_address,
            user_agent=user_agent,
            correlation_id=correlation_id,
        )

    async def get_by_user(
        self, user_id: str, limit: int = 100, offset: int = 0
    ) -> Sequence[ActivityLog]:
        stmt = (
            select(ActivityLog)
            .where(ActivityLog.user_id == user_id)
            .order_by(desc(ActivityLog.created_at))
            .limit(limit)
            .offset(offset)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_by_job(
        self, job_id: str, limit: int = 50
    ) -> Sequence[ActivityLog]:
        stmt = (
            select(ActivityLog)
            .where(ActivityLog.job_id == job_id)
            .order_by(desc(ActivityLog.created_at))
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_by_category(
        self,
        event_category: str,
        severity: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> Sequence[ActivityLog]:
        stmt = select(ActivityLog).where(ActivityLog.event_category == event_category)
        if severity:
            stmt = stmt.where(ActivityLog.severity == severity)
        stmt = stmt.order_by(desc(ActivityLog.created_at)).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_recent(
        self,
        severity: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> Sequence[ActivityLog]:
        stmt = select(ActivityLog)
        if severity:
            stmt = stmt.where(ActivityLog.severity == severity)
        stmt = stmt.order_by(desc(ActivityLog.created_at)).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def count_by_severity(self, since: datetime | None = None) -> dict[str, int]:
        stmt = select(ActivityLog.severity, func.count())
        if since:
            stmt = stmt.where(ActivityLog.created_at >= since)
        stmt = stmt.group_by(ActivityLog.severity)
        result = await self.session.execute(stmt)
        return {row[0]: row[1] for row in result}

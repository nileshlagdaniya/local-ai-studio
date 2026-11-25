"""Base repository class for database operations."""
from typing import Any
from collections.abc import Sequence
from uuid import UUID, uuid4

from sqlalchemy import select, update, delete, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import DeclarativeBase

from src.core.database.base import Base


class BaseRepository[ModelType: Base]:
    """Generic base repository for CRUD operations."""

    def __init__(self, session: AsyncSession, model: type[ModelType]):
        self.session = session
        self.model = model

    async def get_by_id(self, id: str | UUID) -> ModelType | None:
        """Get a single record by ID."""
        stmt = select(self.model).where(self.model.id == str(id))
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all(
        self, limit: int = 100, offset: int = 0, order_by: str = "created_at", desc_order: bool = True
    ) -> Sequence[ModelType]:
        """Get all records with pagination."""
        stmt = select(self.model)
        order_col = getattr(self.model, order_by, None)
        if order_col is not None:
            stmt = stmt.order_by(desc(order_col) if desc_order else asc(order_col))
        stmt = stmt.limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def create(self, **kwargs: Any) -> ModelType:
        """Create a new record."""
        instance = self.model(**kwargs)
        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)
        return instance

    async def update(self, id: str | UUID, **kwargs: Any) -> ModelType | None:
        """Update a record by ID."""
        stmt = (
            update(self.model)
            .where(self.model.id == str(id))
            .values(**kwargs)
            .returning(self.model)
        )
        result = await self.session.execute(stmt)
        instance = result.scalar_one_or_none()
        if instance:
            await self.session.refresh(instance)
        return instance

    async def delete(self, id: str | UUID) -> bool:
        """Delete a record by ID."""
        stmt = delete(self.model).where(self.model.id == str(id))
        result = await self.session.execute(stmt)
        return result.rowcount > 0

    async def count(self, **filters: Any) -> int:
        """Count records matching filters."""
        stmt = select(func.count()).select_from(self.model)
        for key, value in filters.items():
            col = getattr(self.model, key, None)
            if col is not None:
                stmt = stmt.where(col == value)
        result = await self.session.execute(stmt)
        return result.scalar() or 0

    async def exists(self, **filters: Any) -> bool:
        """Check if any record matches filters."""
        return (await self.count(**filters)) > 0
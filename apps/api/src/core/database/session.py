"""Database session management."""
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool, QueuePool

from src.config.settings import get_settings
from src.core.database.base import Base

engine = None
async_session_maker = None


async def init_db(settings=None):
    """Initialize database engine and create tables."""
    global engine, async_session_maker
    if settings is None:
        settings = get_settings()

    if settings.database_url.startswith("sqlite"):
        engine = create_async_engine(
            settings.database_url,
            echo=settings.database_echo,
            poolclass=NullPool,
            connect_args={"check_same_thread": False},
        )
    else:
        engine = create_async_engine(
            settings.database_url,
            echo=settings.database_echo,
            poolclass=QueuePool,
            pool_size=settings.database_pool_size,
            max_overflow=settings.database_max_overflow,
            pool_pre_ping=True,
            pool_recycle=3600,
        )

    async_session_maker = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db():
    """Close database connections."""
    global engine
    if engine:
        await engine.dispose()


@asynccontextmanager
async def get_session():
    """Get database session."""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

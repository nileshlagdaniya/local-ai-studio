"""Pytest configuration and fixtures for database tests."""
import asyncio
import sys
from collections.abc import AsyncGenerator
from pathlib import Path

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.config.settings import Settings
from src.core.database.base import Base

# Import all models to register them with Base.metadata


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def test_engine():
    """Create test database engine."""
    from sqlalchemy.pool import StaticPool

    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
        poolclass=StaticPool,
        connect_args={"check_same_thread": False},
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    await engine.dispose()


@pytest_asyncio.fixture
async def test_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create a new database session for each test."""
    async_session = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


@pytest_asyncio.fixture
async def test_db_file():
    """Create a test database file."""
    test_db_path = Path("data/test_local_ai_studio.db")
    test_db_path.parent.mkdir(parents=True, exist_ok=True)

    # Clean up any existing test database
    if test_db_path.exists():
        test_db_path.unlink()

    test_settings = Settings(
        database_url=f"sqlite+aiosqlite:///{test_db_path}",
        database_echo=False,
    )

    from src.core.database.session import close_db, init_db
    await init_db(test_settings)
    yield str(test_db_path)
    await close_db()

    # Clean up
    if test_db_path.exists():
        test_db_path.unlink()

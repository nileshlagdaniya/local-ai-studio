"""FastAPI application factory."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.middleware import ErrorHandlingMiddleware, LoggingMiddleware
from src.api.routes import ai, files, health, jobs, modules
from src.api.routes import settings as settings_routes
from src.config.logging import setup_logging
from src.config.settings import get_settings
from src.core.ai_gateway.facade import ai_gateway
from src.core.database.session import close_db, init_db
from src.core.jobs.worker import job_worker
from src.modules.registry import module_registry


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_logging()
    settings = get_settings()
    await init_db(settings)
    await module_registry.initialize()
    await ai_gateway.initialize()
    job_worker.start()
    yield
    # Shutdown
    job_worker.stop()
    await close_db()


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="Local AI Studio API",
        description="Local-first AI automation platform backend",
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
    )

    # Middleware
    app.add_middleware(CORSMiddleware, **settings.cors_config)
    app.add_middleware(LoggingMiddleware)
    app.add_middleware(ErrorHandlingMiddleware)

    # Routes
    app.include_router(health.router, tags=["health"])
    app.include_router(modules.router, prefix="/api/modules", tags=["modules"])
    app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
    app.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"])
    app.include_router(files.router, prefix="/api/files", tags=["files"])
    app.include_router(settings_routes.router, prefix="/api/settings", tags=["settings"])

    return app


app = create_app()

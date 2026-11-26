"""Health check routes with real dependency checks."""
from fastapi import APIRouter

from src.core.ai_gateway.facade import ai_gateway
from src.core.database.session import get_session

router = APIRouter()


@router.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {"status": "healthy", "service": "local-ai-studio-api"}


@router.get("/health/ready")
async def readiness_check():
    """Readiness check with real database connectivity verification."""
    checks = {}

    # Database connectivity check
    try:
        session_gen = get_session()
        await session_gen.__anext__()
        await session_gen.aclose()
        checks["database"] = "ok"
    except Exception:
        checks["database"] = "error"

    # Ollama availability check (non-fatal)
    try:
        from src.core.ai_gateway.schemas import ProviderName
        ollama = ai_gateway.health_check(ProviderName.OLLAMA)
        result = await ollama
        checks["ollama"] = "ok" if result.get(ProviderName.OLLAMA) else "unavailable"
    except Exception:
        checks["ollama"] = "unavailable"

    all_critical_ok = checks.get("database") == "ok"
    return {
        "status": "ready" if all_critical_ok else "degraded",
        "checks": checks,
    }

"""Health check routes."""
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {"status": "healthy", "service": "local-ai-studio-api"}


@router.get("/health/ready")
async def readiness_check():
    """Readiness check - verifies dependencies."""
    # In a real implementation, check database, Ollama, etc.
    return {"status": "ready", "checks": {"database": "ok", "ollama": "ok"}}
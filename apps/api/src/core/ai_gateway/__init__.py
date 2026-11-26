"""AI Gateway package."""
from src.core.ai_gateway.base import (
    AIProvider,
    GenerationRequest,
    GenerationResponse,
    ModelInfo,
    StreamChunk,
)
from src.core.ai_gateway.facade import ai_gateway
from src.core.ai_gateway.registry import provider_registry
from src.core.ai_gateway.schemas import ModelCapability, ProviderName

__all__ = [
    "AIProvider",
    "GenerationRequest",
    "GenerationResponse",
    "StreamChunk",
    "ModelInfo",
    "ProviderName",
    "ModelCapability",
    "provider_registry",
    "ai_gateway",
]

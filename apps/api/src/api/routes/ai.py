"""AI generation routes."""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import AsyncGenerator

from src.core.ai_gateway.facade import ai_gateway
from src.core.ai_gateway.schemas import ProviderName, ModelInfo
from src.core.ai_gateway.base import GenerationRequest, GenerationResponse, StreamChunk
from src.config.settings import get_settings

router = APIRouter(prefix="/v1", tags=["ai"])


class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=100000)
    model: str = Field(..., min_length=1)
    provider: ProviderName = ProviderName.OLLAMA
    system_prompt: str | None = None
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(default=4096, ge=1, le=32768)
    top_p: float = Field(default=0.9, ge=0.0, le=1.0)
    top_k: int = Field(default=40, ge=1, le=100)
    repeat_penalty: float = Field(default=1.1, ge=0.0, le=2.0)
    stream: bool = True
    stop_sequences: list[str] = Field(default_factory=list)
    options: dict = Field(default_factory=dict)


class ProviderTestRequest(BaseModel):
    model: str | None = None
    test_prompt: str = "Hello, this is a test."


class ProviderTestResponse(BaseModel):
    provider: ProviderName
    success: bool
    latency_ms: int | None = None
    error: str | None = None
    model_tested: str | None = None


@router.get("/providers")
async def list_providers():
    """List available AI providers."""
    providers = await ai_gateway.list_providers()
    return {"providers": [p.value for p in providers]}


@router.get("/providers/status")
async def providers_status():
    """Get health status of all providers."""
    settings = get_settings()
    statuses = {}
    for provider_name in ProviderName:
        # Check if provider is configured
        if provider_name == ProviderName.OLLAMA:
            # Ollama is always configured
            pass
        elif provider_name == ProviderName.FREELLM:
            if not settings.freellmapi_api_key:
                statuses[provider_name.value] = {"configured": False, "healthy": False}
                continue

    return await ai_gateway.health_check()


@router.post("/providers/{provider}/test", response_model=ProviderTestResponse)
async def test_provider(provider: ProviderName, request: ProviderTestRequest):
    """Test a specific provider connection."""
    import time
    from src.core.ai_gateway.base import GenerationRequest

    if not await ai_gateway._initialized:
        await ai_gateway.initialize()

    from src.core.ai_gateway import registry
    prov = registry.provider_registry.get(provider)

    if not prov:
        return ProviderTestResponse(
            provider=provider,
            success=False,
            error=f"Provider '{provider.value}' not configured or available",
        )

    model = request.model
    if not model:
        models = await prov.list_models()
        if not models:
            return ProviderTestResponse(
                provider=provider,
                success=False,
                error="No models available",
            )
        model = models[0].id

    start = time.time()
    try:
        response = await prov.generate(
            GenerationRequest(
                prompt=request.test_prompt,
                model=model,
                provider=provider,
                stream=False,
            )
        )
        latency = int((time.time() - start) * 1000)
        return ProviderTestResponse(
            provider=provider,
            success=True,
            latency_ms=latency,
            model_tested=model,
        )
    except Exception as e:
        latency = int((time.time() - start) * 1000)
        return ProviderTestResponse(
            provider=provider,
            success=False,
            latency_ms=latency,
            model_tested=model,
            error=str(e),
        )


@router.get("/models")
async def list_models():
    """List available models from all providers."""
    models = await ai_gateway.list_models()
    return {k.value: [m.id for m in v] for k, v in models.items()}


@router.post("/ai/chat")
async def chat(request: GenerateRequest):
    """Generate AI response (streaming or non-streaming)."""
    if not await ai_gateway._initialized:
        await ai_gateway.initialize()

    if not request.stream:
        response = await ai_gateway.generate(
            prompt=request.prompt,
            model=request.model,
            provider=request.provider,
            system_prompt=request.system_prompt,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
        )
        return {
            "content": response.content,
            "model": response.model,
            "provider": response.provider.value,
            "usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens,
            },
            "finish_reason": response.finish_reason,
            "latency_ms": response.latency_ms,
        }

    async def sse_generator():
        async for chunk in await ai_gateway.generate(
            prompt=request.prompt,
            model=request.model,
            provider=request.provider,
            system_prompt=request.system_prompt,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            stream=True,
        ):
            if chunk.done:
                yield "data: [DONE]\n\n"
            else:
                content = chunk.content.replace("\n", "\\n").replace("\r", "")
                yield f"data: {content}\n\n"

    return StreamingResponse(sse_generator(), media_type="text/event-stream")


@router.get("/models/{provider}/{model}")
async def get_model_info(provider: ProviderName, model: str):
    """Get detailed information about a specific model."""
    from src.core.ai_gateway.facade import ai_gateway
    info = await ai_gateway.get_model_info(f"{provider.value}/{model}")
    if not info:
        # Try without prefix
        models = await ai_gateway.list_models()
        for prov_models in models.values():
            for m in prov_models:
                if m.id == model:
                    info = m
                    break
            if info:
                break

    if not info:
        raise HTTPException(status_code=404, detail=f"Model '{model}' not found")

    return {
        "id": info.id,
        "name": info.name,
        "provider": info.provider.value,
        "capabilities": [c.value for c in info.capabilities],
        "context_length": info.context_length,
        "size_bytes": info.size_bytes,
        "description": info.description,
    }
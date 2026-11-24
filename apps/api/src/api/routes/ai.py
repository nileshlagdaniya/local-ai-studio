"""AI generation routes."""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from src.core.ai_gateway.facade import ai_gateway
from src.core.ai_gateway.schemas import ProviderName

router = APIRouter()


class GenerateRequest(BaseModel):
    prompt: str
    model: str
    provider: ProviderName = ProviderName.OLLAMA
    system_prompt: str | None = None
    temperature: float = 0.7
    max_tokens: int = 4096
    stream: bool = True


@router.post("/generate")
async def generate(request: GenerateRequest):
    """Generate AI response (streaming or non-streaming)."""
    if not await ai_gateway._initialized:
        await ai_gateway.initialize()

    generator = await ai_gateway.generate(
        prompt=request.prompt,
        model=request.model,
        provider=request.provider,
        system_prompt=request.system_prompt,
        temperature=request.temperature,
        max_tokens=request.max_tokens,
        stream=request.stream,
    )

    if request.stream:
        async def sse_generator():
            async for chunk in generator:
                if chunk.done:
                    yield "data: [DONE]\n\n"
                else:
                    content = chunk.content.replace("\n", "\\n").replace("\r", "")
                    yield f"data: {content}\n\n"

        return StreamingResponse(sse_generator(), media_type="text/event-stream")

    return generator


@router.get("/providers")
async def list_providers():
    """List available AI providers."""
    return {"providers": await ai_gateway.list_providers()}


@router.get("/models")
async def list_models():
    """List available models from all providers."""
    return await ai_gateway.list_models()
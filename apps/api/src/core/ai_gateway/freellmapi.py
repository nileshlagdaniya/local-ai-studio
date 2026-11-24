"""FreeLLMAPI provider implementation."""
import httpx
import time
from typing import AsyncGenerator
from src.core.ai_gateway.base import AIProvider, ModelInfo, GenerationRequest, GenerationResponse, StreamChunk, TokenUsage
from src.core.ai_gateway.schemas import ProviderName, ModelCapability


class FreeLLMAPIProvider(AIProvider):
    name = ProviderName.FREELLM
    supports_streaming = True
    supports_pull_model = False

    KNOWN_MODELS = {
        "gpt-4o-mini": {
            "name": "GPT-4o Mini",
            "capabilities": [ModelCapability.CHAT, ModelCapability.COMPLETION],
            "context": 128000,
            "pricing": {"prompt": 0.15, "completion": 0.60},
        },
        "gpt-4o": {
            "name": "GPT-4o",
            "capabilities": [ModelCapability.CHAT, ModelCapability.COMPLETION, ModelCapability.VISION],
            "context": 128000,
            "pricing": {"prompt": 5.00, "completion": 15.00},
        },
        "gpt-4-turbo": {
            "name": "GPT-4 Turbo",
            "capabilities": [ModelCapability.CHAT, ModelCapability.COMPLETION, ModelCapability.VISION],
            "context": 128000,
            "pricing": {"prompt": 10.00, "completion": 30.00},
        },
        "claude-3-5-sonnet": {
            "name": "Claude 3.5 Sonnet",
            "capabilities": [ModelCapability.CHAT, ModelCapability.COMPLETION],
            "context": 200000,
            "pricing": {"prompt": 3.00, "completion": 15.00},
        },
        "claude-3-haiku": {
            "name": "Claude 3 Haiku",
            "capabilities": [ModelCapability.CHAT, ModelCapability.COMPLETION],
            "context": 200000,
            "pricing": {"prompt": 0.25, "completion": 1.25},
        },
        "gemini-1.5-pro": {
            "name": "Gemini 1.5 Pro",
            "capabilities": [ModelCapability.CHAT, ModelCapability.COMPLETION, ModelCapability.VISION],
            "context": 2000000,
            "pricing": {"prompt": 1.25, "completion": 5.00},
        },
        "gemini-1.5-flash": {
            "name": "Gemini 1.5 Flash",
            "capabilities": [ModelCapability.CHAT, ModelCapability.COMPLETION, ModelCapability.VISION],
            "context": 1000000,
            "pricing": {"prompt": 0.075, "completion": 0.30},
        },
    }

    def __init__(self, base_url: str, api_key: str, timeout: int = 120):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.timeout = timeout
        self._client: httpx.AsyncClient | None = None

    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                timeout=self.timeout,
                headers={"Authorization": f"Bearer {self.api_key}"},
            )
        return self._client

    async def list_models(self) -> list[ModelInfo]:
        models = []
        for model_id, info in self.KNOWN_MODELS.items():
            models.append(ModelInfo(
                id=model_id,
                name=info["name"],
                provider=self.name,
                size_bytes=0,
                modified_at="",
                capabilities=info["capabilities"],
                context_length=info["context"],
                description=f"Via FreeLLMAPI - ${info['pricing']['prompt']}/${info['pricing']['completion']} per 1M tokens",
            ))
        return models

    async def generate(self, request: GenerationRequest) -> GenerationResponse:
        start = time.time()
        payload = self._build_payload(request, stream=False)
        response = await self.client.post(f"{self.base_url}/v1/chat/completions", json=payload)
        response.raise_for_status()
        data = response.json()
        latency = int((time.time() - start) * 1000)

        choice = data["choices"][0]
        usage_data = data.get("usage", {})
        model_info = self.KNOWN_MODELS.get(request.model, {})
        pricing = model_info.get("pricing", {"prompt": 0, "completion": 0})

        return GenerationResponse(
            content=choice["message"]["content"],
            model=request.model,
            provider=self.name,
            usage=TokenUsage(
                prompt_tokens=usage_data.get("prompt_tokens", 0),
                completion_tokens=usage_data.get("completion_tokens", 0),
                total_tokens=usage_data.get("total_tokens", 0),
            ),
            finish_reason=choice.get("finish_reason", "stop"),
            latency_ms=latency,
        )

    async def stream_generate(self, request: GenerationRequest) -> AsyncGenerator[StreamChunk, None]:
        payload = self._build_payload(request, stream=True)
        async with self.client.stream("POST", f"{self.base_url}/v1/chat/completions", json=payload) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line.strip() or not line.startswith("data: "):
                    continue
                if line.strip() == "data: [DONE]":
                    yield StreamChunk(content="", done=True)
                    break
                import json
                data = json.loads(line[6:])
                delta = data["choices"][0]["delta"]
                if delta.get("content"):
                    yield StreamChunk(content=delta["content"], done=False)

    async def health_check(self) -> bool:
        try:
            response = await self.client.get(f"{self.base_url}/v1/models")
            return response.status_code == 200
        except Exception:
            return False

    def _build_payload(self, request: GenerationRequest, stream: bool) -> dict:
        messages = []
        if request.system_prompt:
            messages.append({"role": "system", "content": request.system_prompt})
        messages.append({"role": "user", "content": request.prompt})

        payload = {
            "model": request.model,
            "messages": messages,
            "temperature": request.temperature,
            "max_tokens": request.max_tokens,
            "top_p": request.top_p,
            "stream": stream,
        }
        if request.stop_sequences:
            payload["stop"] = request.stop_sequences
        return payload
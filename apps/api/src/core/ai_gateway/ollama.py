"""Ollama AI provider implementation."""
import time
from collections.abc import AsyncGenerator

import httpx

from src.core.ai_gateway.base import (
    AIProvider,
    GenerationRequest,
    GenerationResponse,
    ModelInfo,
    StreamChunk,
    TokenUsage,
)
from src.core.ai_gateway.schemas import ModelCapability, ProviderName


class OllamaProvider(AIProvider):
    name = ProviderName.OLLAMA
    supports_streaming = True
    supports_pull_model = True

    def __init__(self, base_url: str, timeout: int = 300):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self._client: httpx.AsyncClient | None = None
        self._model_cache: dict[str, ModelInfo] = {}

    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=self.timeout)
        return self._client

    async def list_models(self) -> list[ModelInfo]:
        try:
            response = await self.client.get(f"{self.base_url}/api/tags")
            response.raise_for_status()
            data = response.json()
            models = []
            for model in data.get("models", []):
                model_info = ModelInfo(
                    id=model["name"],
                    name=model["name"],
                    provider=self.name,
                    size_bytes=model.get("size", 0),
                    modified_at=model.get("modified_at", ""),
                    capabilities=self._infer_capabilities(model["name"]),
                    context_length=self._infer_context_length(model["name"]),
                )
                models.append(model_info)
                self._model_cache[model_info.id] = model_info
            return models
        except Exception:
            return list(self._model_cache.values())

    async def generate(self, request: GenerationRequest) -> GenerationResponse:
        start = time.time()
        payload = self._build_payload(request, stream=False)
        response = await self.client.post(f"{self.base_url}/api/generate", json=payload)
        response.raise_for_status()
        data = response.json()
        latency = int((time.time() - start) * 1000)

        return GenerationResponse(
            content=data.get("response", ""),
            model=request.model,
            provider=self.name,
            usage=TokenUsage(
                prompt_tokens=data.get("prompt_eval_count", 0),
                completion_tokens=data.get("eval_count", 0),
                total_tokens=data.get("prompt_eval_count", 0) + data.get("eval_count", 0),
            ),
            finish_reason=data.get("done_reason", "stop"),
            latency_ms=latency,
        )

    async def stream_generate(self, request: GenerationRequest) -> AsyncGenerator[StreamChunk, None]:
        payload = self._build_payload(request, stream=True)
        async with self.client.stream("POST", f"{self.base_url}/api/generate", json=payload) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line.strip():
                    continue
                import json
                data = json.loads(line)
                if "response" in data:
                    yield StreamChunk(
                        content=data["response"],
                        done=data.get("done", False),
                    )
                if data.get("done"):
                    if "prompt_eval_count" in data or "eval_count" in data:
                        yield StreamChunk(
                            content="",
                            done=True,
                            usage=TokenUsage(
                                prompt_tokens=data.get("prompt_eval_count", 0),
                                completion_tokens=data.get("eval_count", 0),
                                total_tokens=data.get("prompt_eval_count", 0) + data.get("eval_count", 0),
                            ),
                        )
                    break

    async def health_check(self) -> bool:
        try:
            response = await self.client.get(f"{self.base_url}/api/version")
            return response.status_code == 200
        except Exception:
            return False

    async def pull_model(self, model: str) -> bool:
        try:
            async with self.client.stream(
                "POST", f"{self.base_url}/api/pull", json={"name": model}
            ) as response:
                async for line in response.aiter_lines():
                    if not line.strip():
                        continue
                    import json
                    data = json.loads(line)
                    if data.get("status") == "success":
                        self._model_cache.clear()
                        return True
                return response.status_code == 200
        except Exception:
            return False

    def _build_payload(self, request: GenerationRequest, stream: bool) -> dict:
        payload = {
            "model": request.model,
            "prompt": request.prompt,
            "temperature": request.temperature,
            "num_predict": request.max_tokens,
            "top_p": request.top_p,
            "top_k": request.top_k,
            "repeat_penalty": request.repeat_penalty,
            "stream": stream,
            "stop": request.stop_sequences or None,
        }
        if request.system_prompt:
            payload["system"] = request.system_prompt
        if request.options:
            payload["options"] = request.options
        return {k: v for k, v in payload.items() if v is not None}

    def _infer_capabilities(self, model_name: str) -> list[ModelCapability]:
        caps = [ModelCapability.CHAT, ModelCapability.COMPLETION]
        name_lower = model_name.lower()
        if any(x in name_lower for x in ["llava", "vision", "moondream", "bakllava", "llama3.2-vision"]):
            caps.append(ModelCapability.VISION)
        if "embed" in name_lower:
            caps.append(ModelCapability.EMBEDDING)
        if any(x in name_lower for x in ["hermes", "function", "tool"]):
            caps.append(ModelCapability.TOOLS)
        return caps

    def _infer_context_length(self, model_name: str) -> int:
        name_lower = model_name.lower()
        if "32k" in name_lower or "128k" in name_lower:
            return 32768
        if "16k" in name_lower:
            return 16384
        if "8k" in name_lower:
            return 8192
        return 4096

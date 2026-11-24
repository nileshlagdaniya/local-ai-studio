"""AI Gateway Facade - Central entry point for all AI operations."""
import time
import logging
from typing import AsyncGenerator, Optional
from src.core.ai_gateway.registry import provider_registry
from src.core.ai_gateway.schemas import ProviderName, ModelInfo
from src.core.ai_gateway.base import GenerationRequest, GenerationResponse, StreamChunk

logger = logging.getLogger(__name__)


class AIGateway:
    """Central facade for all AI operations."""

    def __init__(self):
        self._initialized = False

    async def initialize(self):
        await provider_registry.initialize()
        self._initialized = True

    # Model Management
    async def list_providers(self) -> list[ProviderName]:
        return provider_registry.list_providers()

    async def list_models(self) -> dict[ProviderName, list[ModelInfo]]:
        return await provider_registry.get_all_models()

    async def get_model_info(self, model_id: str) -> Optional[ModelInfo]:
        return provider_registry.get_model_info(model_id)

    async def pull_model(self, model: str, provider: ProviderName = ProviderName.OLLAMA) -> bool:
        prov = provider_registry.get(provider)
        if not prov or not prov.supports_pull_model:
            return False
        result = await prov.pull_model(model)
        if result:
            await provider_registry._refresh_model_cache()
        return result

    # Generation
    async def generate(
        self,
        prompt: str,
        model: str,
        provider: ProviderName = ProviderName.OLLAMA,
        system_prompt: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        stream: bool = True,
        user_id: str | None = None,
        request_type: str = "chat",
    ) -> GenerationResponse | AsyncGenerator[StreamChunk, None]:
        if not self._initialized:
            await self.initialize()

        prov = provider_registry.get(provider)
        if not prov:
            raise ValueError(f"Provider '{provider}' not available")

        request = GenerationRequest(
            prompt=prompt,
            model=model,
            provider=provider,
            system_prompt=system_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=stream,
        )

        start = time.time()
        try:
            if stream:
                return self._stream_with_metrics(prov, request, user_id, request_type, start)
            else:
                response = await prov.generate(request)
                await self._record_usage(user_id, provider, model, response.usage, request_type)
                return response
        except Exception as e:
            logger.error(f"Generation failed: {e}")
            raise

    async def _stream_with_metrics(
        self,
        prov: AIProvider,
        request: GenerationRequest,
        user_id: str | None,
        request_type: str,
        start: float,
    ) -> AsyncGenerator[StreamChunk, None]:
        total_content = ""
        prompt_tokens = 0
        completion_tokens = 0

        async for chunk in prov.stream_generate(request):
            if chunk.content:
                total_content += chunk.content
            if chunk.usage:
                prompt_tokens = chunk.usage.prompt_tokens
                completion_tokens = chunk.usage.completion_tokens
            yield chunk

        if user_id:
            from src.core.ai_gateway.base import TokenUsage
            usage = TokenUsage(
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=prompt_tokens + completion_tokens,
            )
            await self._record_usage(user_id, request.provider, request.model, usage, request_type)

    async def _record_usage(
        self,
        user_id: str | None,
        provider: ProviderName,
        model: str,
        usage: "TokenUsage",
        request_type: str,
    ):
        if not user_id:
            return
        # TODO: Implement database logging
        pass

    # Provider-specific helpers
    async def health_check(self, provider: ProviderName | None = None) -> dict[ProviderName, bool]:
        if provider:
            prov = provider_registry.get(provider)
            return {provider: await prov.health_check()} if prov else {provider: False}
        return {name: await prov.health_check() for name, prov in provider_registry._providers.items()}


# Import here to avoid circular import
from src.core.ai_gateway.base import AIProvider

ai_gateway = AIGateway()
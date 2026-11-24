"""Provider registry for AI Gateway."""
import logging
from typing import Optional
from src.core.ai_gateway.base import AIProvider
from src.core.ai_gateway.ollama import OllamaProvider
from src.core.ai_gateway.freellmapi import FreeLLMAPIProvider
from src.core.ai_gateway.schemas import ProviderName, ModelInfo
from src.config.settings import get_settings

logger = logging.getLogger(__name__)


class ProviderRegistry:
    def __init__(self):
        self._providers: dict[ProviderName, AIProvider] = {}
        self._initialized = False
        self._model_cache: dict[str, ModelInfo] = {}

    async def initialize(self):
        if self._initialized:
            return
        settings = get_settings()

        # Ollama (always register)
        self._providers[ProviderName.OLLAMA] = OllamaProvider(
            base_url=settings.ollama_base_url,
            timeout=settings.ollama_timeout,
        )

        # FreeLLMAPI (if configured)
        if settings.freellmapi_api_key:
            self._providers[ProviderName.FREELLM] = FreeLLMAPIProvider(
                base_url=settings.freellmapi_base_url,
                api_key=settings.freellmapi_api_key,
                timeout=settings.freellmapi_timeout,
            )

        # Health check all providers
        for name, provider in self._providers.items():
            healthy = await provider.health_check()
            if not healthy:
                logger.warning(f"Provider '{name}' health check failed")
            else:
                logger.info(f"Provider '{name}' is healthy")

        await self._refresh_model_cache()
        self._initialized = True

    def get(self, name: ProviderName) -> Optional[AIProvider]:
        return self._providers.get(name)

    def list_providers(self) -> list[ProviderName]:
        return list(self._providers.keys())

    async def get_all_models(self) -> dict[ProviderName, list[ModelInfo]]:
        result = {}
        for name, provider in self._providers.items():
            try:
                result[name] = await provider.list_models()
            except Exception as e:
                logger.error(f"Error listing models for {name}: {e}")
                result[name] = []
        return result

    async def _refresh_model_cache(self):
        self._model_cache.clear()
        for provider in self._providers.values():
            try:
                models = await provider.list_models()
                for model in models:
                    self._model_cache[model.id] = model
            except Exception:
                pass

    def get_model_info(self, model_id: str) -> Optional[ModelInfo]:
        return self._model_cache.get(model_id)


provider_registry = ProviderRegistry()
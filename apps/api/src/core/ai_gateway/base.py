"""Abstract base class for AI providers."""
from abc import ABC, abstractmethod
from collections.abc import AsyncGenerator
from dataclasses import dataclass, field

from src.core.ai_gateway.schemas import ModelCapability, ProviderName


@dataclass
class ModelInfo:
    id: str
    name: str
    provider: ProviderName
    size_bytes: int = 0
    modified_at: str = ""
    capabilities: list[ModelCapability] = field(default_factory=list)
    context_length: int = 4096
    description: str = ""


@dataclass
class GenerationRequest:
    prompt: str
    model: str
    provider: ProviderName = ProviderName.OLLAMA
    system_prompt: str | None = None
    temperature: float = 0.7
    max_tokens: int = 4096
    top_p: float = 0.9
    top_k: int = 40
    repeat_penalty: float = 1.1
    stream: bool = True
    stop_sequences: list[str] = field(default_factory=list)
    options: dict = field(default_factory=dict)


@dataclass
class TokenUsage:
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0

    @property
    def estimated_cost_usd(self) -> float:
        return 0.0


@dataclass
class GenerationResponse:
    content: str
    model: str
    provider: ProviderName
    usage: TokenUsage
    finish_reason: str
    latency_ms: int


@dataclass
class StreamChunk:
    content: str
    done: bool = False
    usage: TokenUsage | None = None


class AIProvider(ABC):
    """Abstract base class for AI providers."""

    @property
    @abstractmethod
    def name(self) -> ProviderName:
        pass

    @property
    @abstractmethod
    def supports_streaming(self) -> bool:
        pass

    @property
    @abstractmethod
    def supports_pull_model(self) -> bool:
        pass

    @abstractmethod
    async def list_models(self) -> list[ModelInfo]:
        pass

    @abstractmethod
    async def generate(self, request: GenerationRequest) -> GenerationResponse:
        pass

    @abstractmethod
    async def stream_generate(self, request: GenerationRequest) -> AsyncGenerator[StreamChunk, None]:
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        pass

    async def pull_model(self, model: str) -> bool:
        return False

    async def get_model_info(self, model: str) -> ModelInfo | None:
        models = await self.list_models()
        return next((m for m in models if m.id == model), None)

"""AI Gateway schemas and enums."""
from dataclasses import dataclass, field
from enum import StrEnum


class ProviderName(StrEnum):
    OLLAMA = "ollama"
    FREELLM = "freellmapi"


class ModelCapability(StrEnum):
    CHAT = "chat"
    COMPLETION = "completion"
    EMBEDDING = "embedding"
    VISION = "vision"
    TOOLS = "tools"


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

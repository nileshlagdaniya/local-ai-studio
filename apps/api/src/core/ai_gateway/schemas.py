"""AI Gateway schemas and enums."""
from enum import Enum
from dataclasses import dataclass, field
from typing import Optional


class ProviderName(str, Enum):
    OLLAMA = "ollama"
    FREELLM = "freellmapi"


class ModelCapability(str, Enum):
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
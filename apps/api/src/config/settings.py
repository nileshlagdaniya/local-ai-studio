"""Application settings using Pydantic Settings."""
from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "Local AI Studio"
    debug: bool = False
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    # Database
    database_url: str = "sqlite+aiosqlite:///./data/local_ai_studio.db"
    database_echo: bool = False
    database_pool_size: int = 10
    database_max_overflow: int = 20

    # CORS
    cors_origins: list[str] = ["http://localhost:3003"]

    @property
    def cors_config(self) -> dict:
        return {
            "allow_origins": self.cors_origins,
            "allow_credentials": True,
            "allow_methods": ["*"],
            "allow_headers": ["*"],
        }

    # AI Providers
    ollama_base_url: str = "http://localhost:11434"
    ollama_timeout: int = 300
    ollama_default_model: str = "qwen2.5-coder:3b"

    freellmapi_base_url: str = "https://api.freellmapi.xyz"
    freellmapi_api_key: str = ""
    freellmapi_timeout: int = 120
    freellmapi_default_model: str = "gpt-4o-mini"

    # File Storage
    storage_root: Path = Path("./data/storage")
    max_file_size: int = 100 * 1024 * 1024  # 100 MB
    allowed_extensions: list[str] = [
        ".txt", ".md", ".json", ".csv", ".pdf",
        ".png", ".jpg", ".jpeg", ".gif", ".webp",
        ".mp4", ".webm", ".mov",
    ]

    # Job Processing
    job_worker_interval: float = 1.0
    max_concurrent_jobs: int = 1
    job_result_ttl_hours: int = 24

    # Authentication
    secret_key: str = "dev-secret-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30 * 24 * 60  # 30 days

    @field_validator("storage_root", mode="before")
    @classmethod
    def ensure_storage_root(cls, v: str | Path) -> Path:
        path = Path(v).expanduser().resolve()
        path.mkdir(parents=True, exist_ok=True)
        return path


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()

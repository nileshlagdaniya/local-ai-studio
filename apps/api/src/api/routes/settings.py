"""Application settings routes."""
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class SettingValue(BaseModel):
    key: str
    value: Any
    value_type: str


class SettingsResponse(BaseModel):
    id: str
    category: str
    description: str | None
    values: list[SettingValue]


@router.get("", response_model=list[SettingsResponse])
async def list_settings():
    """List all settings categories."""
    # Placeholder - implement with database
    return []


@router.get("/{settings_id}", response_model=SettingsResponse)
async def get_settings(settings_id: str):
    """Get settings for a category."""
    # Placeholder - implement with database
    raise HTTPException(404, "Settings not found")


@router.patch("/{settings_id}")
async def update_settings(settings_id: str, values: dict[str, Any]):
    """Update settings values."""
    # Placeholder - implement with database
    return {"message": "Settings updated"}

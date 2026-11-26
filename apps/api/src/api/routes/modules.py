"""Module registry routes."""
from fastapi import APIRouter

from src.modules.registry import module_registry

router = APIRouter()


@router.get("")
async def list_modules():
    """List all registered modules."""
    return {"modules": module_registry.list_modules()}


@router.get("/enabled")
async def list_enabled_modules():
    """List only enabled modules."""
    return {"modules": module_registry.get_enabled_modules()}


@router.get("/{module_id}")
async def get_module(module_id: str):
    """Get module details."""
    module = module_registry.get_module(module_id)
    if not module:
        return {"error": "Module not found"}, 404
    return {"module": module.info}

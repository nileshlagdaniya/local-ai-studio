"""Shared Pydantic schemas."""
from typing import Any

from pydantic import BaseModel


class PaginatedResponse[DataT](BaseModel):
    items: list[DataT]
    total: int
    page: int
    page_size: int
    total_pages: int


class ErrorResponse(BaseModel):
    error: str
    detail: str | None = None
    request_id: str | None = None


class SuccessResponse(BaseModel):
    message: str
    data: Any = None

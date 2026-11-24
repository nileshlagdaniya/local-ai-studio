"""Shared Pydantic schemas."""
from typing import Generic, TypeVar
from pydantic import BaseModel, Field
from typing import Any


DataT = TypeVar("DataT")


class PaginatedResponse(BaseModel, Generic[DataT]):
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
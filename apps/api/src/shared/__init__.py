"""Shared utilities package."""
from src.shared.exceptions import APIError, ValidationError, NotFoundError, UnauthorizedError
from src.shared.schemas import PaginatedResponse, ErrorResponse
from src.shared.utils import slugify, truncate

__all__ = [
    "APIError",
    "ValidationError",
    "NotFoundError",
    "UnauthorizedError",
    "PaginatedResponse",
    "ErrorResponse",
    "slugify",
    "truncate",
]
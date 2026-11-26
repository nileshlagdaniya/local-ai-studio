"""Shared utilities package."""
from src.shared.exceptions import APIError, NotFoundError, UnauthorizedError, ValidationError
from src.shared.schemas import ErrorResponse, PaginatedResponse
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

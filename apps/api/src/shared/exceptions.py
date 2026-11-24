"""Custom exceptions."""
from typing import Any


class APIError(Exception):
    def __init__(self, status_code: int, detail: str, headers: dict[str, str] | None = None):
        self.status_code = status_code
        self.detail = detail
        self.headers = headers
        super().__init__(detail)


class ValidationError(APIError):
    def __init__(self, detail: str, errors: list[dict] | None = None):
        super().__init__(422, detail)
        self.errors = errors


class NotFoundError(APIError):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(404, detail)


class UnauthorizedError(APIError):
    def __init__(self, detail: str = "Unauthorized"):
        super().__init__(401, detail, {"WWW-Authenticate": "Bearer"})


class ForbiddenError(APIError):
    def __init__(self, detail: str = "Forbidden"):
        super().__init__(403, detail)


class ConflictError(APIError):
    def __init__(self, detail: str = "Resource conflict"):
        super().__init__(409, detail)
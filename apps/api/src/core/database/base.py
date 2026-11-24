"""Database base classes and utilities."""
from datetime import datetime
from uuid import uuid4
from sqlalchemy import DateTime, func, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.dialects.sqlite import JSON as SQLiteJSON
from sqlalchemy.dialects.postgresql import JSONB as PGJSONB
from sqlalchemy import Dialect
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.types import TypeDecorator
from typing import Any


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class UUIDMixin:
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )


class JSONType(TypeDecorator):
    """Dialect-agnostic JSON column type."""
    impl = Text
    cache_ok = True

    def load_dialect_impl(self, dialect: Dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PGJSONB())
        return dialect.type_descriptor(SQLiteJSON())

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        import json
        return json.dumps(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        import json
        return json.loads(value)


def JSONColumn() -> Any:
    return JSONType()
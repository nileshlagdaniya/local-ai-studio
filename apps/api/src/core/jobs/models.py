"""Job models for background processing."""
from enum import Enum as PyEnum
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Optional
import uuid


class JobStatus(str, PyEnum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class JobPriority(int, PyEnum):
    LOW = 0
    NORMAL = 50
    HIGH = 100


@dataclass
class Job:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    type: str = ""
    payload: dict = field(default_factory=dict)
    status: JobStatus = JobStatus.PENDING
    priority: JobPriority = JobPriority.NORMAL
    progress: float = 0.0
    result: Optional[dict] = None
    error: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    module_id: Optional[str] = None
    user_id: Optional[str] = None
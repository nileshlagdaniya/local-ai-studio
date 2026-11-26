"""Base module class."""
from abc import ABC, abstractmethod
from dataclasses import dataclass

from fastapi import APIRouter

from src.core.jobs.queue import JobQueue


@dataclass
class ModuleInfo:
    id: str
    name: str
    description: str
    version: str
    enabled: bool
    routes: list[str]
    job_types: list[str]


class BaseModule(ABC):
    def __init__(self, job_queue: JobQueue):
        self.job_queue = job_queue

    @property
    @abstractmethod
    def info(self) -> ModuleInfo:
        pass

    @abstractmethod
    async def initialize(self):
        pass

    @abstractmethod
    async def shutdown(self):
        pass

    def register_job_executors(self, worker):
        for job_type in self.info.job_types:
            executor = getattr(self, f"execute_{job_type}", None)
            if executor:
                worker.register_executor(job_type, executor)

    def get_routes(self) -> APIRouter:
        return APIRouter()

"""In-memory priority job queue."""
import asyncio
import heapq
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime
from src.core.jobs.models import Job, JobPriority, JobStatus


@dataclass(order=True)
class PrioritizedJob:
    priority: int
    job: Job = field(compare=False)
    enqueued_at: float = field(compare=False, default=0)


class JobQueue:
    def __init__(self, max_concurrent: int = 1):
        self._queue: list[PrioritizedJob] = []
        self._running: dict[str, Job] = {}
        self._completed: dict[str, Job] = {}
        self._max_concurrent = max_concurrent
        self._lock = asyncio.Lock()
        self._not_empty = asyncio.Condition(self._lock)

    async def enqueue(self, job: Job) -> str:
        async with self._lock:
            heapq.heappush(
                self._queue,
                PrioritizedJob(
                    priority=-job.priority.value,
                    job=job,
                    enqueued_at=asyncio.get_event_loop().time(),
                ),
            )
            self._not_empty.notify()
        return job.id

    async def dequeue(self) -> Optional[Job]:
        async with self._lock:
            while not self._queue:
                await self._not_empty.wait()

            if len(self._running) >= self._max_concurrent:
                return None

            prioritized = heapq.heappop(self._queue)
            job = prioritized.job
            job.status = JobStatus.RUNNING
            job.started_at = datetime.utcnow()
            self._running[job.id] = job
            return job

    async def complete(self, job_id: str, result: dict = None, error: str = None):
        async with self._lock:
            job = self._running.pop(job_id, None)
            if not job:
                return
            job.status = JobStatus.COMPLETED if error is None else JobStatus.FAILED
            job.result = result
            job.error = error
            job.completed_at = datetime.utcnow()
            job.progress = 1.0
            self._completed[job_id] = job

    async def update_progress(self, job_id: str, progress: float):
        async with self._lock:
            job = self._running.get(job_id)
            if job:
                job.progress = max(0.0, min(1.0, progress))

    async def cancel(self, job_id: str) -> bool:
        async with self._lock:
            if job_id in self._running:
                job = self._running[job_id]
                job.status = JobStatus.CANCELLED
                job.error = "Cancelled by user"
                job.completed_at = datetime.utcnow()
                self._completed[job_id] = self._running.pop(job_id)
                return True
            for i, pj in enumerate(self._queue):
                if pj.job.id == job_id:
                    job = self._queue.pop(i).job
                    job.status = JobStatus.CANCELLED
                    job.error = "Cancelled before start"
                    job.completed_at = datetime.utcnow()
                    self._completed[job_id] = job
                    return True
            return False

    async def get_job(self, job_id: str) -> Optional[Job]:
        async with self._lock:
            if job_id in self._running:
                return self._running[job_id]
            return self._completed.get(job_id)

    async def list_jobs(self, status: JobStatus = None, limit: int = 100) -> list[Job]:
        async with self._lock:
            jobs = list(self._running.values()) + list(self._completed.values())
            if status:
                jobs = [j for j in jobs if j.status == status]
            return sorted(jobs, key=lambda j: j.created_at, reverse=True)[:limit]
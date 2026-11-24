"""Sequential job worker."""
import asyncio
import logging
from typing import Callable, Awaitable
from src.core.jobs.queue import JobQueue
from src.core.jobs.models import Job

logger = logging.getLogger(__name__)


class JobWorker:
    def __init__(self, queue: JobQueue, interval: float = 1.0):
        self.queue = queue
        self.interval = interval
        self._task: asyncio.Task | None = None
        self._running = False
        self._executors: dict[str, Callable[[Job], Awaitable[dict]]] = {}

    def register_executor(self, job_type: str, executor: Callable[[Job], Awaitable[dict]]):
        self._executors[job_type] = executor

    def start(self):
        if self._running:
            return
        self._running = True
        self._task = asyncio.create_task(self._run_loop())
        logger.info("Job worker started")

    def stop(self):
        self._running = False
        if self._task:
            self._task.cancel()
        logger.info("Job worker stopped")

    async def _run_loop(self):
        while self._running:
            try:
                job = await self.queue.dequeue()
                if job:
                    await self._execute_job(job)
                else:
                    await asyncio.sleep(self.interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Worker loop error: {e}")
                await asyncio.sleep(self.interval)

    async def _execute_job(self, job: Job):
        executor = self._executors.get(job.type)
        if not executor:
            await self.queue.complete(job.id, error=f"No executor for job type: {job.type}")
            return

        try:
            logger.info(f"Executing job {job.id} (type: {job.type})")
            result = await executor(job)
            await self.queue.complete(job.id, result=result)
            logger.info(f"Job {job.id} completed")
        except asyncio.CancelledError:
            await self.queue.complete(job.id, error="Cancelled")
        except Exception as e:
            logger.error(f"Job {job.id} failed: {e}")
            await self.queue.complete(job.id, error=str(e))


job_worker = JobWorker(queue=JobQueue(max_concurrent=1))
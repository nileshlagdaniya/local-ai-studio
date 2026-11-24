"""Background job routes."""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from datetime import datetime
from src.core.jobs.queue import JobQueue
from src.core.jobs.models import Job, JobStatus, JobPriority
from src.modules.registry import module_registry

router = APIRouter()
job_queue = JobQueue(max_concurrent=1)


class CreateJobRequest(BaseModel):
    type: str
    payload: dict = {}
    priority: JobPriority = JobPriority.NORMAL
    module_id: str | None = None


class JobResponse(BaseModel):
    id: str
    type: str
    status: JobStatus
    priority: JobPriority
    progress: float
    payload: dict
    result: dict | None
    error: str | None
    created_at: datetime
    started_at: datetime | None
    completed_at: datetime | None
    module_id: str | None
    user_id: str | None


@router.post("", response_model=JobResponse, status_code=202)
async def create_job(request: CreateJobRequest):
    """Create a new background job."""
    if request.module_id:
        module = module_registry.get_module(request.module_id)
        if not module:
            raise HTTPException(404, "Module not found")

    job = Job(
        type=request.type,
        payload=request.payload,
        priority=request.priority,
        module_id=request.module_id,
    )
    await job_queue.enqueue(job)
    return job


@router.get("", response_model=list[JobResponse])
async def list_jobs(
    status: JobStatus | None = None,
    module_id: str | None = None,
    limit: int = Query(50, le=200),
):
    """List jobs with optional filters."""
    jobs = await job_queue.list_jobs(status=status, limit=limit)
    if module_id:
        jobs = [j for j in jobs if j.module_id == module_id]
    return jobs


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str):
    """Get job details."""
    job = await job_queue.get_job(job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    return job


@router.get("/{job_id}/progress")
async def get_job_progress(job_id: str):
    """Get job progress for polling."""
    job = await job_queue.get_job(job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    return {
        "job_id": job.id,
        "status": job.status,
        "progress": job.progress,
        "result": job.result,
        "error": job.error,
    }


@router.post("/{job_id}/cancel")
async def cancel_job(job_id: str):
    """Cancel a pending or running job."""
    job = await job_queue.get_job(job_id)
    if not job:
        raise HTTPException(404, "Job not found")

    cancelled = await job_queue.cancel(job_id)
    if not cancelled:
        raise HTTPException(400, "Job cannot be cancelled")
    return {"message": "Job cancelled"}
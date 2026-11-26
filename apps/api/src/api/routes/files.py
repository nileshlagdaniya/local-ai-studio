"""File management routes."""
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel

from src.core.storage.local import LocalStorage

router = APIRouter()
storage = LocalStorage()


class FileResponseModel(BaseModel):
    id: str
    filename: str
    path: str
    size: int
    mime_type: str
    module_id: str | None
    created_at: str


@router.post("/upload", response_model=FileResponseModel)
async def upload_file(
    file: UploadFile = File(...),
    module_id: str | None = Form(None),
):
    """Upload a file."""
    if file.size and file.size > 100 * 1024 * 1024:
        raise HTTPException(413, "File too large")

    content = await file.read()
    from io import BytesIO
    file_meta = await storage.save(
        file=BytesIO(content),
        filename=file.filename or "unknown",
        module_id=module_id,
    )
    return file_meta


@router.get("/{file_id}")
async def download_file(file_id: str):
    """Download a file."""
    file_data = await storage.get(file_id)
    if not file_data:
        raise HTTPException(404, "File not found")

    file_obj, metadata = file_data
    return FileResponse(
        path=metadata.path,
        filename=metadata.filename,
        media_type=metadata.mime_type,
    )


@router.delete("/{file_id}")
async def delete_file(file_id: str):
    """Delete a file."""
    success = await storage.delete(file_id)
    if not success:
        raise HTTPException(404, "File not found")
    return {"message": "File deleted"}


@router.get("")
async def list_files(module_id: str | None = None):
    """List files."""
    files = await storage.list(module_id=module_id)
    return {"files": files}

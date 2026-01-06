from fastapi.params import Form
from typing import Optional
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from app.services.orchestrator import Orchestrator
from app.dependencies import get_orchestrator
from app.schemas.toc_api import UploadResponse, TaskStatus

router = APIRouter()


@router.post("/upload", response_model=UploadResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    orchestrator: Orchestrator = Depends(get_orchestrator),
):
    if file.content_type != "application/pdf" and not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Check text file size
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > 16 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 16MB)")

    try:
        task_id = await orchestrator.process_file_async(file, name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return UploadResponse(task_id=task_id, status="uploaded")


@router.get("/status/{task_id}", response_model=TaskStatus)
async def get_status(
    task_id: str, orchestrator: Orchestrator = Depends(get_orchestrator)
):
    status = orchestrator.get_status(task_id)
    if not status:
        raise HTTPException(status_code=404, detail="Task not found")
    return status

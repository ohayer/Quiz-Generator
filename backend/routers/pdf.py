from fastapi import APIRouter, File, UploadFile, HTTPException
from backend.services.orchestrator import Orchestrator
from backend.schemas.toc_api import UploadResponse, TaskStatus

router = APIRouter()
orchestrator = Orchestrator()

@router.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf" and not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Check text file size
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > 16 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 16MB)")
    
    task_id = await orchestrator.process_file_async(file)
    return UploadResponse(task_id=task_id, status="uploaded")

@router.get("/status/{task_id}", response_model=TaskStatus)
async def get_status(task_id: str):
    status = orchestrator.get_status(task_id)
    if not status:
        raise HTTPException(status_code=404, detail="Task not found")
    return status

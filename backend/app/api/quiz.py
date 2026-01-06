from fastapi import APIRouter, Depends, HTTPException
from app.services.orchestrator import Orchestrator
from app.dependencies import get_orchestrator
from app.schemas.quiz import QuizConfig
from app.schemas.toc_api import UploadResponse

router = APIRouter()


@router.post("/{doc_id}/generate", response_model=UploadResponse)
async def generate_quiz(
    doc_id: str,
    config: QuizConfig,
    orchestrator: Orchestrator = Depends(get_orchestrator),
):
    try:
        task_id = await orchestrator.generate_quiz_async(doc_id, config)
        return UploadResponse(task_id=task_id, status="processing")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from typing import List
from uuid import UUID
from fastapi import APIRouter, HTTPException
from app.db.models import PDFDocument
from fastapi.responses import Response
from app.services.documents import document_service
from app.schemas.documents import DocumentSummary, DocumentUpdate

router = APIRouter()


@router.get("/", response_model=List[DocumentSummary])
async def get_documents():
    return (
        await PDFDocument.find_all()
        .project(DocumentSummary)
        .sort("-updated_at")
        .to_list()
    )


@router.get("/{doc_id}", response_model=PDFDocument)
async def get_document(doc_id: UUID):
    doc = await document_service.get_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.patch("/{doc_id}", response_model=PDFDocument)
async def update_document(doc_id: UUID, update_data: DocumentUpdate):
    doc = await document_service.update_document_name(doc_id, update_data.name)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.get("/{doc_id}/preview/{page}", response_class=Response)
async def get_document_preview(doc_id: UUID, page: int):
    image_bytes = await document_service.get_page_image(doc_id, page)
    if not image_bytes:
        raise HTTPException(
            status_code=404, detail="Page not found or document invalid"
        )

    return Response(content=image_bytes, media_type="image/png")

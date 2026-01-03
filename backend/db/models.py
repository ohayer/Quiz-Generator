from typing import Optional, Dict
from datetime import datetime
from uuid import UUID, uuid4
from beanie import Document
from pydantic import Field


class PDFDocument(Document):
    id: UUID = Field(default_factory=uuid4)
    name: str
    pdf_name: str
    pdf_file_id: Optional[str] = None
    toc_model: Optional[Dict] = None
    quiz: dict = Field(default_factory=dict)
    total_pages: int = 0
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "pdf_documents"

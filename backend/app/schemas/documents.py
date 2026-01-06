from typing import Optional, Dict
from uuid import UUID
from pydantic import BaseModel, Field
from app.schemas.quiz import QuizConfig


class DocumentSummary(BaseModel):
    id: UUID = Field(validation_alias="_id")
    name: str
    pdf_name: str
    total_pages: int = 0


class DocumentUpdate(BaseModel):
    name: Optional[str] = None
    is_verified: Optional[bool] = None
    toc_model: Optional[Dict] = None
    quiz_conf: Optional[QuizConfig] = None

from uuid import UUID
from pydantic import BaseModel, Field


class DocumentSummary(BaseModel):
    id: UUID = Field(validation_alias="_id")
    name: str
    pdf_name: str
    total_pages: int = 0


class DocumentUpdate(BaseModel):
    name: str

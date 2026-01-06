from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID


class Section(BaseModel):
    section_number: str
    title: str
    start_page: int


class TableOfContents(BaseModel):
    sections: List[Section]


class UploadResponse(BaseModel):
    task_id: str
    status: str


class TaskStatus(BaseModel):
    task_id: str
    status: str
    result: Optional[TableOfContents] = None
    doc_id: Optional[UUID] = None
    error: Optional[str] = None

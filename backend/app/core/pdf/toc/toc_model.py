from typing import List

from pydantic import BaseModel, Field


class Section(BaseModel):
    section_number: str = Field(
        ..., description="The section number (e.g. '1', '2.2', '3.1.4')"
    )
    title: str = Field(
        ..., description="Title of the section"
    )
    start_page: int = Field(
        ..., description="The page number where this section starts"
    )


class TableOfContents(BaseModel):
    sections: List[Section]

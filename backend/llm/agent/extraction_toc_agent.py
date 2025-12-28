from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

import fitz

from .config import load_settings
from .model import LangChainConnection
from .rag_service import LangChainRAGService
from backend.pdf.toc.manual_extractor import ManualToCExtractor
from backend.pdf.toc.toc_model import Section, TableOfContents

SYSTEM_MESSAGE = """You are a precision parser for Table of Contents.
Your task is to flatten the Table of Contents into a single list of items.
Treat EVERY line that has a title and a page number as a "Section", regardless of whether it is a main chapter (1.) or a subsection (1.1.).
If section number are in roman numeral (e.g., I., II., III.), convert then into arabic numerals (1, 1.1, 1.3.5).

RULES:
1. Extract the "number" separately (e.g., "1.1").
2. Clean the "title": Remove the number from the beginning and remove the dots "...." from the end.
3. Extract the "start_page" as an integer.
4. Ignore lines that do not contain a page number (e.g. headers like "Table of Contents")."""

def _default_rag() -> LangChainRAGService:
    settings = load_settings()
    connection = LangChainConnection(settings)
    return LangChainRAGService(connection, system_prompt=SYSTEM_MESSAGE)

def _default_manual_extractor() -> ManualToCExtractor:
    return ManualToCExtractor()

@dataclass
class ToCExtractor:
    doc: fitz.Document
    rag: LangChainRAGService = field(default_factory=_default_rag)
    manual_extractor: ManualToCExtractor = field(default_factory=_default_manual_extractor)

    def extract_toc(self) -> Optional[TableOfContents]:
        toc = self._extract_toc_by_fitz()
        if toc is not None:
            return toc
        return self._extract_manual_toc_with_llm()

    def _extract_toc_by_fitz(self) -> Optional[TableOfContents]:
        toc_fitz = self.doc.get_toc(simple=False) or []
        if not toc_fitz:
            return None

        sections: list[Section] = []
        for item in toc_fitz:
            try:
                title = item[1]
                page = int(item[2])
                additional_info = item[3] if len(item) > 3 else {}
            except Exception:
                continue

            section_ref = additional_info.get("nameddest") if isinstance(additional_info, dict) else None
            if not section_ref or "." not in section_ref:
                continue

            section_number = section_ref.split(".", 1)[1] or section_ref
            try:
                sections.append(Section(section_number=section_number, title=title, start_page=page))
            except Exception:
                continue

        if not sections:
            return None
        return TableOfContents(sections=sections)

    def _extract_manual_toc_with_llm(self) -> Optional[TableOfContents]:
        toc_pages = self.manual_extractor.manual_extract(self.doc)
        if not toc_pages:
            return None

        text = [page.clean_text for page in toc_pages]
        toc_as_string = "\n".join(text)
        return self._convert_toc_text_into_toc_object_with_llm(toc_as_string)

    def _convert_toc_text_into_toc_object_with_llm(self, toc_text: str) -> Optional[TableOfContents]:
        question = (
            "Here is the raw text of the Table of Contents. Please process it according to the system instructions.\n"
            "<toc_content>\n"
            f"{toc_text}"
        )
        return self.rag.answer_structured(
            question=question,
            response_model=TableOfContents,
            context=toc_text,
        )
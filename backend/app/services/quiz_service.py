import os
import uuid
import fitz
import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from uuid import UUID

from app.db.models import PDFDocument
from app.schemas.quiz import QuizOutput, QuizConfigScope
from app.core.llm.agent.generation_quiz_agent import GenerationQuizAgent

logger = logging.getLogger(__name__)


class QuizService:
    def __init__(self):
        self.agent = GenerationQuizAgent()

    async def generate_quiz_content(self, doc_id: str, db) -> Optional[QuizOutput]:
        """
        Main entry point to generate quiz content for a document.
        """
        try:
            # 1. Fetch Document
            doc = await PDFDocument.get(UUID(doc_id))
            if not doc or not doc.quiz_conf:
                logger.error(f"Document {doc_id} not found or missing quiz config.")
                return None

            # 2. Extract Context
            context = await self._extract_content(doc, db)
            if not context:
                logger.warning(f"No content extracted for document {doc_id}")
                return None

            # 3. Generate Quiz via Agent
            quiz_output = await self.agent.generate_quiz(
                context=context, questions_config=doc.quiz_conf.questions
            )

            if quiz_output:
                # 4. Save result
                # We store the raw dict/json in the 'quiz' field (dict) of PDFDocument
                doc.quiz = quiz_output.model_dump()
                await doc.save()
                return quiz_output

            return None

        except Exception as e:
            logger.error(f"Error in generate_quiz_content: {e}")
            return None

    async def _extract_content(self, doc: PDFDocument, db) -> str:
        """
        Extracts text content from PDF based on the quiz configuration scope.
        """
        if not doc.pdf_file_id:
            return ""

        fs = AsyncIOMotorGridFSBucket(db)
        temp_filename = f"temp_quiz_extract_{uuid.uuid4()}.pdf"

        try:
            from bson import ObjectId

            # Download file
            with open(temp_filename, "wb") as f:
                await fs.download_to_stream(ObjectId(doc.pdf_file_id), f)

            text_content = []
            with fitz.open(temp_filename) as pdf:
                target_pages = self._resolve_target_pages(doc, pdf)

                for p_idx in target_pages:
                    if 0 <= p_idx < len(pdf):
                        page = pdf.load_page(p_idx)
                        text_content.append(page.get_text())

            return "\n".join(text_content)

        except Exception as e:
            logger.error(f"Error extraction extraction: {e}")
            return ""
        finally:
            if os.path.exists(temp_filename):
                os.remove(temp_filename)

    def _resolve_target_pages(self, doc: PDFDocument, pdf: fitz.Document) -> range:
        """
        Determines which pages to extract based on QuizConfig.
        Returns a range or list of page indices (0-indexed).
        """
        scope = doc.quiz_conf.scope
        total_pages = len(pdf)

        if scope == QuizConfigScope.document:
            return range(total_pages)

        elif scope == QuizConfigScope.page and doc.quiz_conf.singlePage:
            p = doc.quiz_conf.singlePage - 1
            if 0 <= p < total_pages:
                return range(p, p + 1)

        elif scope == QuizConfigScope.range and doc.quiz_conf.pageRange:
            start = doc.quiz_conf.pageRange["start"] - 1
            end = doc.quiz_conf.pageRange["end"] - 1
            start = max(0, start)
            end = min(total_pages - 1, end)
            if start <= end:
                return range(start, end + 1)

        elif scope == QuizConfigScope.chapter and doc.quiz_conf.selectedChapter:
            if doc.toc_model and "sections" in doc.toc_model:
                sections = doc.toc_model["sections"]
                idx = -1
                for i, s in enumerate(sections):
                    if s["title"] == doc.quiz_conf.selectedChapter:
                        idx = i
                        break

                if idx != -1:
                    start_page = sections[idx]["start_page"] - 1
                    if idx + 1 < len(sections):
                        end_page = sections[idx + 1]["start_page"] - 2
                    else:
                        end_page = total_pages - 1

                    start_page = max(0, start_page)
                    end_page = min(total_pages - 1, end_page)

                    if start_page <= end_page:
                        return range(start_page, end_page + 1)

        return range(0)  # Default empty

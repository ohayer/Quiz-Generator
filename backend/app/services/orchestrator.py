import asyncio
import os
import shutil
import uuid
import fitz

from concurrent.futures import ThreadPoolExecutor
from typing import Optional, Dict

from fastapi import UploadFile
from motor.motor_asyncio import AsyncIOMotorGridFSBucket

from app.core.llm.agent.extraction_toc_agent import ToCExtractor
from app.services.quiz_service import QuizService

from app.schemas.quiz import QuizConfig

from app.db.models import PDFDocument
from app.schemas.toc_api import TaskStatus, TableOfContents
from app.db.database import init_db


class Orchestrator:
    def __init__(self):
        self._executor = ThreadPoolExecutor(max_workers=4)
        self._tasks: Dict[str, TaskStatus] = {}

    async def get_database(self):
        client, db = await init_db()
        return db

    async def process_file_async(
        self, file: UploadFile, name: Optional[str] = None
    ) -> str:
        task_id = str(uuid.uuid4())
        temp_filename = f"temp_{task_id}.pdf"

        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        if not name:
            raise ValueError("Space name is required")

        self._tasks[task_id] = TaskStatus(task_id=task_id, status="uploading")

        asyncio.create_task(
            self._process_task(task_id, temp_filename, name, file.filename)
        )
        return task_id

    async def generate_quiz_async(self, doc_id: str, config: QuizConfig) -> str:
        task_id = str(uuid.uuid4())
        self._tasks[task_id] = TaskStatus(task_id=task_id, status="processing_llm")

        asyncio.create_task(self._process_quiz_generation(task_id, doc_id, config))
        return task_id

    async def _process_quiz_generation(
        self, task_id: str, doc_id: str, config: QuizConfig
    ):
        try:
            await self.get_database()
            doc = await PDFDocument.get(uuid.UUID(doc_id))
            if not doc:
                self._fail_task(task_id, "Document not found")
                return

            doc.quiz_conf = config
            await doc.save()

            # Generate questions with QuizService
            self._update_status(task_id, "Generating questions with AI...")

            quiz_service = QuizService()
            db = await self.get_database()
            result = await quiz_service.generate_quiz_content(doc_id, db)

            if result:
                self._tasks[
                    task_id
                ].result = result.model_dump()  # Store generic result
                self._tasks[task_id].status = "completed"
            else:
                self._fail_task(task_id, "Failed to generate quiz content")

        except Exception as e:
            self._fail_task(task_id, str(e))

    async def _process_task(
        self, task_id: str, temp_path: str, file_name: str, pdf_name: str
    ):
        try:
            self._update_status(task_id, "uploading_to_db")

            db = await self.get_database()
            fs = AsyncIOMotorGridFSBucket(db)

            with open(temp_path, "rb") as f:
                file_id = await fs.upload_from_stream(
                    file_name, f, metadata={"task_id": task_id}
                )

            with fitz.open(temp_path) as doc_pdf:
                page_count = doc_pdf.page_count

            doc = PDFDocument(
                name=file_name,
                pdf_name=pdf_name,
                pdf_file_id=str(file_id),
                toc_model=None,
                total_pages=page_count,
                is_verified=False,
            )
            await doc.insert()
            if task_id in self._tasks:
                self._tasks[task_id].doc_id = doc.id

            self._update_status(task_id, "extracting")

            loop = asyncio.get_event_loop()
            toc_result = await loop.run_in_executor(
                self._executor, self._run_extraction, temp_path
            )

            if toc_result:
                doc.toc_model = toc_result.model_dump()
                await doc.save()

                self._complete_task(task_id, toc_result)
            else:
                self._fail_task(task_id, "Could not extract Table of Contents")

        except Exception as e:
            self._fail_task(task_id, str(e))

        finally:
            self._cleanup_temp_file(temp_path)

    def _update_status(self, task_id: str, status: str):
        if task_id in self._tasks:
            self._tasks[task_id].status = status

    def _complete_task(self, task_id: str, result: TableOfContents):
        if task_id in self._tasks:
            self._tasks[task_id].result = result
            self._tasks[task_id].status = "completed"

    def _fail_task(self, task_id: str, error: str):
        if task_id in self._tasks:
            self._tasks[task_id].status = "failed"
            self._tasks[task_id].error = error

    def _cleanup_temp_file(self, path: str):
        if os.path.exists(path):
            try:
                os.remove(path)
            except OSError:
                pass

    def _run_extraction(self, file_path: str) -> Optional[TableOfContents]:
        try:
            doc = fitz.open(file_path)
            extractor = ToCExtractor(doc)
            return extractor.extract_toc()
        except Exception as e:
            print(f"Extraction error: {e}")
            return None

    def get_status(self, task_id: str) -> Optional[TaskStatus]:
        return self._tasks.get(task_id)

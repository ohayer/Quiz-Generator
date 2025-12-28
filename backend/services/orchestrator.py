import asyncio
import os
import shutil
import uuid
from concurrent.futures import ThreadPoolExecutor
from typing import Optional

import fitz
from fastapi import UploadFile

from backend.llm.agent.extraction_toc_agent import ToCExtractor
from backend.schemas.toc_api import Section, TableOfContents, TaskStatus

_TASKS_STORE = {}

class Orchestrator:
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=3)

    async def process_file_async(self, file: UploadFile) -> str:
        task_id = str(uuid.uuid4())
        _TASKS_STORE[task_id] = {"status": "uploading", "result": None}
        
        file_location = f"temp_{task_id}.pdf"
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        _TASKS_STORE[task_id]["status"] = "extracting"
        asyncio.create_task(self._process_task(task_id, file_location))
        
        return task_id

    async def _process_task(self, task_id: str, file_path: str):
        try:
            loop = asyncio.get_running_loop()
            _TASKS_STORE[task_id]["status"] = "processing_llm"
            
            toc_result = await loop.run_in_executor(
                self.executor, 
                self._run_extraction, 
                file_path
            )
            
            if toc_result:
                api_sections = [
                    Section(
                        section_number=s.section_number, 
                        title=s.title, 
                        start_page=s.start_page
                    ) for s in toc_result.sections
                ]
                _TASKS_STORE[task_id]["result"] = TableOfContents(sections=api_sections)
                _TASKS_STORE[task_id]["status"] = "completed"
            else:
                _TASKS_STORE[task_id]["status"] = "failed"
                _TASKS_STORE[task_id]["error"] = "No TOC found"

        except Exception as e:
            _TASKS_STORE[task_id]["status"] = "failed"
            _TASKS_STORE[task_id]["error"] = str(e)
            print(f"Error processing task {task_id}: {e}")
        finally:
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except PermissionError:
                    pass

    def _run_extraction(self, file_path: str):
        doc = fitz.open(file_path)
        try:
            extractor = ToCExtractor(doc=doc)
            return extractor.extract_toc()
        finally:
            doc.close()

    def get_status(self, task_id: str) -> Optional[TaskStatus]:
        task = _TASKS_STORE.get(task_id)
        if not task:
            return None
        return TaskStatus(
            task_id=task_id,
            status=task["status"],
            result=task["result"]
        )

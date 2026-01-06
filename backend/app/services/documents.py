from typing import List, Optional
from uuid import UUID
import fitz

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorGridFSBucket

from app.db.database import init_db
from app.db.models import PDFDocument
from app.schemas.documents import DocumentSummary


class DocumentService:
    async def get_all_documents(self) -> List[DocumentSummary]:
        try:
            return (
                await PDFDocument.find_all()
                .project(DocumentSummary)
                .sort("-updated_at")
                .to_list()
            )
        except Exception as e:
            print(f"Database error fetching documents: {e}")
            raise e

    async def get_document_by_id(self, doc_id: UUID) -> Optional[PDFDocument]:
        try:
            doc = await PDFDocument.get(doc_id)
            if not doc:
                return None

            # Update total_pages if missing
            if doc.total_pages == 0 and doc.pdf_file_id:
                try:
                    client, db = await init_db()
                    fs = AsyncIOMotorGridFSBucket(db)
                    grid_out = await fs.open_download_stream(ObjectId(doc.pdf_file_id))
                    pdf_content = await grid_out.read()

                    with fitz.open("pdf", pdf_content) as fitz_doc:
                        doc.total_pages = fitz_doc.page_count
                        await doc.save()
                        print(
                            f"Healed document {doc_id}: Updated total_pages to {doc.total_pages}"
                        )
                except Exception as inner_e:
                    print(f"Failed to heal document {doc_id}: {inner_e}")

            return doc
        except Exception as e:
            print(f"Database error fetching document {doc_id}: {e}")
            raise e

    async def get_page_image(self, doc_id: UUID, page_number: int) -> Optional[bytes]:
        try:
            doc_record = await PDFDocument.get(doc_id)
            if not doc_record or not doc_record.pdf_file_id:
                return None

            client, db = await init_db()
            fs = AsyncIOMotorGridFSBucket(db)

            grid_out = await fs.open_download_stream(ObjectId(doc_record.pdf_file_id))
            pdf_content = await grid_out.read()

            doc = fitz.open("pdf", pdf_content)

            # Update total_pages if missing during preview
            if doc_record.total_pages == 0:
                try:
                    doc_record.total_pages = len(doc)
                    await doc_record.save()
                    print(
                        f"Healed document {doc_id} in preview: Updated total_pages to {doc_record.total_pages}"
                    )
                except Exception as save_err:
                    print(f"Failed to save healed doc {doc_id} in preview: {save_err}")

            # Use 0-based index internally, assuming API sends 1-based
            page_idx = page_number - 1
            if page_idx < 0 or page_idx >= len(doc):
                return None

            page = doc.load_page(page_idx)
            # Render to image (zoom=2 for better quality)
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
            return pix.tobytes("png")

        except Exception as e:
            print(f"Error rendering page {page_number} for doc {doc_id}: {e}")
            return None

    async def update_document_name(
        self, doc_id: UUID, new_name: str
    ) -> Optional[PDFDocument]:
        try:
            doc = await PDFDocument.get(doc_id)
            if not doc:
                return None
            doc.name = new_name
            await doc.save()
            return doc
        except Exception as e:
            print(f"Error updating document {doc_id}: {e}")
            raise e


document_service = DocumentService()

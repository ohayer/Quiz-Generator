from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.api import documents, pdf, quiz  # noqa: E402

app = FastAPI(title="PDF TOC Extractor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pdf.router, prefix="/api/pdf", tags=["pdf"])

app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["quiz"])


@app.get("/")
def read_root():
    return {"message": "PDF TOC Extractor API"}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500, content={"detail": str(exc), "type": type(exc).__name__}
    )


@app.on_event("startup")
async def on_startup():
    from app.db.database import init_db

    await init_db()

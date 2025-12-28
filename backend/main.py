from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from backend.routers import pdf

app = FastAPI(title="PDF TOC Extractor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], #only for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pdf.router, prefix="/api/pdf", tags=["pdf"])

@app.get("/")
def read_root():
    return {"message": "PDF TOC Extractor API"}

import pytest
import os
from fpdf import FPDF
from fastapi.testclient import TestClient
from backend.main import app

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture(scope="session")
def sample_pdf_path(tmp_path_factory):
    # Create a dummy PDF file for testing
    pdf_dir = tmp_path_factory.mktemp("data")
    pdf_path = pdf_dir / "test_doc.pdf"
    
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("helvetica", "B", 16)
    pdf.cell(40, 10, "Table of Contents")
    pdf.ln(20)
    pdf.set_font("helvetica", "", 12)
    pdf.cell(0, 10, "1. Introduction ................................. 2")
    pdf.ln()
    pdf.cell(0, 10, "2. Chapter One .................................. 5")
    pdf.ln()
    pdf.add_page()
    pdf.cell(0, 10, "Introduction Page")
    pdf.output(str(pdf_path))
    
    return str(pdf_path)

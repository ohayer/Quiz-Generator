import os
import time
from fastapi.testclient import TestClient

def test_upload_and_poll_flow(client: TestClient, sample_pdf_path: str):
    # Verify file exists
    assert os.path.exists(sample_pdf_path)
    
    # 1. Upload
    with open(sample_pdf_path, "rb") as f:
        response = client.post(
            "/api/pdf/upload",
            files={"file": ("test_doc.pdf", f, "application/pdf")}
        )
    
    assert response.status_code == 200, response.text
    data = response.json()
    assert "task_id" in data
    task_id = data["task_id"]
    
    # 2. Poll Status
    
    for _ in range(5):
        response = client.get(f"/api/pdf/status/{task_id}")
        assert response.status_code == 200
        status_data = response.json()
        status = status_data["status"]
        
        if status in ["completed", "failed"]:
            break
        time.sleep(1)
        
    # Correct assertion: it should be a valid status string
    assert status in ["uploading", "extracting", "processing_llm", "completed", "failed"]

# PDF Table of Contents Extractor & Quiz Generator

A modern, full-stack web application designed to process PDF documents, extract their structure (Table of Contents), and enable interactive quiz generation. This tool utilizes a hybrid approach combining PyMuPDF for rendering and text analysis with Large Language Models (LLM) for intelligent parsing.

## 🚀 Key Features

- **Smart Info Extraction**: Automatically extracts the Table of Contents using a hybrid pipeline (Visual analysis + LLM).
- **Workspace Management**: Organize your work into workspaces. Rename documents and manage your study materials effectively.
- **Interactive PDF Preview**:
  - Full-resolution page previews.
  - Tabbed interface for multitasking (view ToC and multiple page ranges simultaneously).
  - Page-by-page navigation.
- **Manual ToC Editing**: Verify and refine the extracted Table of Contents with a drag-and-drop interface (in progress).
- **Quiz Configuration**:
  - Set custom scopes: Document-wide, Chapter-specific, Page Range, or Single Page.
  - Customize question types (Open/Closed) and count.
  - Intelligent validation to ensure page ranges match the document.
- **Modern UI/UX**:
  - Dark mode design with custom scrollbars.
  - Responsive and animated interface using TailwindCSS.

## 🛠️ Technology Stack

### Backend

- **FastAPI**: High-performance asynchronous web framework.
- **MongoDB**:
  - **Motor**: Async Python driver for MongoDB.
  - **Beanie**: ODM (Object Document Mapper) for MongoDB.
  - **GridFS**: Scalable searching and storage for large PDF files.
- **PyMuPDF (fitz)**: Fast PDF processing, rendering, and text extraction.
- **LangChain**: Orchestrator for semantic understanding and LLM interactions.
- **Layered Architecture**: Strictly follows SOLID principles with Service classes, Dependency Injection, and clear separation of concerns.

### Frontend

- **React**: Component-based UI library (built with Vite).
- **TypeScript**: Ensures type safety and developer productivity.
- **TailwindCSS**: Utility-first CSS framework for rapid, consistent styling.
- **React Router**: For seamless navigation.

## 📂 Project Structure

```
.
├── backend/
│   ├── db/                 # Database configuration (Beanie/Motor) & Models
│   ├── llm/                # LLM agents and RAG services
│   ├── routers/            # API Controllers (PDF, Documents)
│   ├── schemas/            # Pydantic DTOs (Data Transfer Objects)
│   ├── services/           # Business Logic (Orchestrator, DocumentService)
│   ├── dependencies.py     # Dependency Injection providers
│   ├── main.py             # Application Entry Point
│   └── requirements.txt    # Backend Dependencies
├── frontend/
│   ├── src/
│   │   ├── features/       # Feature-driven modules (pdf-processor, quiz)
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   └── types/          # Shared TypeScript interfaces
│   └── ...
└── README.md
```

## ⚡ Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB (Local instance or Atlas URI)
- OpenAI API Key

### Backend Setup

1.  **Create and activate a virtual environment**:

    ```bash
    python -m venv venv
    # Windows
    .\venv\Scripts\activate
    # Linux/Mac
    source venv/bin/activate
    ```

2.  **Install dependencies**:

    ```bash
    pip install -r backend/requirements.txt
    ```

3.  **Configure Environment**:
    Create a `.env` file in the root directory:

    ```env
    OPENAI_API_KEY=your_api_key_here
    MONGODB_URL=mongodb://localhost:27017
    MONGODB_DB_NAME=pdf_processor
    ```

4.  **Run the server**:
    ```bash
    python -m uvicorn backend.main:app --reload
    ```
    The API will be available at `http://localhost:8000`.

### Frontend Setup

1.  **Navigate to the frontend directory**:

    ```bash
    cd frontend
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Start the development server**:
    ```bash
    npm run dev
    ```
    The application will be running at `http://localhost:5173`.

## 🧪 Testing

The project is built with testability in mind, featuring a comprehensive `pytest` suite.

To run all backend tests:

```bash
python -m pytest backend/tests
```

## 📐 Architecture & Principles

The backend is engineered with a strict adherence to **Layered Architecture** and **SOLID Principles**:

- **Dependency Injection**: Services like the `Orchestrator` are injected into Routers, promoting loose coupling and easier testing.
- **Single Responsibility**: Each class has a distinct purpose (e.g., `DocumentService` manages data access, `ToCExtractor` handles parsing).
- **Separation of Concerns**: Database models, API schemas, and business logic are kept in separate modules.

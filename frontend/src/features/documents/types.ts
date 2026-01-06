export interface Section {
    section_number: string;
    title: string;
    start_page: number;
}

export interface TableOfContents {
    sections: Section[];
}

export interface UploadResponse {
    task_id: string;
    status: string;
}

export interface TaskStatus {
    task_id: string;
    status: 'uploading' | 'extracting' | 'processing_llm' | 'completed' | 'failed';
    result?: TableOfContents;
    doc_id?: string;
    error?: string;
}

export interface DocumentSummary {
    id: string;
    name: string;
    pdf_name: string;
    total_pages: number;
}

export interface Tab {
    id: string;
    type: 'toc' | 'preview' | 'quiz';
    title: string;
    // For preview
    pages?: number[];
}

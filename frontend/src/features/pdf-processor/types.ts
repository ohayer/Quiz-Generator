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
    error?: string;
}

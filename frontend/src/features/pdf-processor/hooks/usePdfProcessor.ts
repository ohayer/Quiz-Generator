import { useState, useCallback } from 'react';
import type { TaskStatus, UploadResponse } from '../types'
import { getBackendUrl } from '../../../config';

export const usePdfProcessor = () => {
    const [taskId, setTaskId] = useState<string | null>(null);
    const [status, setStatus] = useState<TaskStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadPdf = useCallback(async (file: File) => {
        setIsLoading(true);
        setError(null);

        if (file.type !== 'application/pdf') {
            setError('Only PDF files are allowed');
            setIsLoading(false);
            return;
        }

        if (file.size > 16 * 1024 * 1024) {
            setError('File size exceeds 16MB limit');
            setIsLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${getBackendUrl()}/api/pdf/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Upload failed');
            }

            const data: UploadResponse = await response.json();
            setTaskId(data.task_id);
            pollStatus(data.task_id);
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    }, []);

    const pollStatus = useCallback(async (id: string) => {
        const intervalId = setInterval(async () => {
            try {
                const response = await fetch(`${getBackendUrl()}/api/pdf/status/${id}`);
                if (!response.ok) throw new Error('Failed to fetch status');

                const data: TaskStatus = await response.json();
                setStatus(data);

                if (data.status === 'completed' || data.status === 'failed') {
                    clearInterval(intervalId);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error(err);
            }
        }, 2000);
    }, []);

    return {
        uploadPdf,
        status,
        isLoading,
        error
    };
};

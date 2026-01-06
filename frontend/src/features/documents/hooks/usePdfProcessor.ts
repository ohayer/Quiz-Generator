import { useState, useCallback } from 'react';
import type { TaskStatus } from '../types'
import type { QuizConfig } from '../../quiz/types';
import { getBackendUrl } from '../../../config';

export const usePdfProcessor = () => {
    const [taskId, setTaskId] = useState<string | null>(null);
    const [status, setStatus] = useState<TaskStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const uploadPdf = useCallback(async (name: string, file: File) => {
        setIsLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (name) {
                formData.append('name', name);
            }

            const response = await fetch(`${getBackendUrl()}/api/pdf/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Failed to upload PDF');
            }

            const data = await response.json();
            if (data.task_id) {
                setTaskId(data.task_id);
                pollStatus(data.task_id);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setIsLoading(false);
        }
    }, [pollStatus]);

    const generateQuiz = useCallback(async (docId: string, config: QuizConfig) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${getBackendUrl()}/api/quiz/${docId}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Failed to start quiz generation');
            }

            const data = await response.json();
            if (data.task_id) {
                setTaskId(data.task_id);
                pollStatus(data.task_id);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setIsLoading(false);
        }
    }, [pollStatus]);

    return {
        uploadPdf,
        status,
        isLoading,
        error,
        taskId,
        generateQuiz
    };
};

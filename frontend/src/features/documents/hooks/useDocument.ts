import { useState, useEffect, useCallback } from 'react';
import { getBackendUrl } from '../../../config';
import type { TableOfContents } from '../types';
import type { QuizConfig, QuizOutput } from '../../quiz/types';

interface DocumentDetails {
    id: string;
    name: string;
    total_pages: number;
    toc_model?: TableOfContents;
    is_verified: boolean;
    quiz_conf?: QuizConfig;
    quiz?: QuizOutput;
}

export const useDocument = (id: string | undefined) => {
    const [document, setDocument] = useState<DocumentDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDocument = useCallback(async () => {
        if (!id) return;

        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${getBackendUrl()}/api/documents/${id}`);
            if (!response.ok) throw new Error('Failed to fetch document');
            const data = await response.json();
            setDocument(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDocument();
    }, [fetchDocument]);

    const updateDocument = useCallback(async (updates: Partial<DocumentDetails>) => {
        if (!id) return false;
        try {
            const response = await fetch(`${getBackendUrl()}/api/documents/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });
            if (!response.ok) throw new Error('Failed to update document');

            // Update local state
            setDocument(prev => prev ? { ...prev, ...updates } : null);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }, [id]);

    const updateName = (newName: string) => updateDocument({ name: newName });
    const approveToc = () => updateDocument({ is_verified: true });

    const rejectTocConfirm = useCallback(async () => {
        if (!id) return false;
        try {
            const response = await fetch(`${getBackendUrl()}/api/documents/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ toc_model: null, is_verified: false }),
            });
            if (!response.ok) throw new Error('Failed to reject TOC');

            setDocument(prev => prev ? { ...prev, toc_model: undefined, is_verified: false } : null);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }, [id]);

    return { document, isLoading, error, refresh: fetchDocument, updateName, approveToc, rejectToc: rejectTocConfirm };
};

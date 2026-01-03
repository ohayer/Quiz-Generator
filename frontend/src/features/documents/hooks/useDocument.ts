import { useState, useEffect, useCallback } from 'react';
import { getBackendUrl } from '../../../config';
import type { TableOfContents } from '../types';

interface DocumentDetails {
    id: string;
    name: string;
    total_pages: number;
    toc_model?: TableOfContents;
    is_verified: boolean;
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

    const updateName = useCallback(async (newName: string) => {
        if (!id) return;
        try {
            const response = await fetch(`${getBackendUrl()}/api/documents/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newName }),
            });
            if (!response.ok) throw new Error('Failed to update document name');

            // Optimistic update or refetch
            setDocument(prev => prev ? { ...prev, name: newName } : null);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }, [id]);

    return { document, isLoading, error, refresh: fetchDocument, updateName };
};

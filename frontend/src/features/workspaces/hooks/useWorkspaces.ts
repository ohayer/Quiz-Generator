import { useState, useEffect, useCallback } from 'react';
import { getBackendUrl } from '../../../config';
import type { DocumentSummary } from '../../documents/types';

export const useWorkspaces = () => {
    const [documents, setDocuments] = useState<DocumentSummary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchWorkspaces = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${getBackendUrl()}/api/documents`);
            if (!response.ok) throw new Error('Failed to fetch workspaces');
            const data = await response.json();
            setDocuments(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWorkspaces();
    }, [fetchWorkspaces]);

    return { workspaces: documents, isLoading, error, refresh: fetchWorkspaces };
};

import React from 'react';
import type { DocumentSummary } from '../../documents/types';

interface WorkspacesListProps {
    documents: DocumentSummary[];
    isLoading: boolean;
    onSelect?: (id: string) => void;
}

export const WorkspacesList: React.FC<WorkspacesListProps> = ({ documents, isLoading, onSelect }) => {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-slate-800/50 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-800 rounded-lg">
                <p>No workspaces found</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {documents.map((doc) => (
                <div
                    key={doc.id}
                    onClick={() => onSelect?.(doc.id)}
                    className="
                        group p-4 bg-slate-900 border border-slate-800 rounded-lg 
                        hover:border-indigo-500/50 hover:bg-slate-800/50 
                        cursor-pointer transition-all duration-200
                    "
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-xl group-hover:bg-indigo-500/20 transition-colors">
                            📄
                        </div>
                        <div>
                            <h4 className="font-medium text-slate-200 group-hover:text-white transition-colors">
                                {doc.name}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 font-mono opacity-60">
                                {doc.pdf_name}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

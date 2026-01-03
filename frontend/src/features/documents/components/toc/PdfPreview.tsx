import React, { useEffect, useState } from 'react';
import { getBackendUrl } from '../../../../config';

interface PdfPreviewProps {
    documentId: string;
    pages: number[];
    title: string;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({ documentId, pages, title }) => {
    return (
        <div className="h-full flex flex-col">
            <div className="flex-none p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-sm text-slate-500">Showing {pages.length} pages</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950/50 custom-scrollbar">
                {pages.map((page) => (
                    <div key={page} className="flex flex-col items-center gap-2">
                        <div className="relative group w-full max-w-3xl">
                            <img
                                src={`${getBackendUrl()}/api/documents/${documentId}/preview/${page}`}
                                alt={`Page ${page}`}
                                className="w-full rounded-lg shadow-xl border border-slate-800 bg-white min-h-[400px]"
                                loading="lazy"
                            />
                            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur">
                                Page {page}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

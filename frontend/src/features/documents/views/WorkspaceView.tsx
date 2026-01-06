import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocument } from '../hooks/useDocument';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { ResultsView } from '../components/toc/ResultsView';
import { TocReview } from '../components/toc/TocReview';
import { QuizConfigurationForm } from '../../quiz';
import { PdfPreview } from '../components/toc/PdfPreview';
import type { QuizConfig, QuizScope } from '../../quiz';

type ViewMode = 'details' | 'quiz';

interface Tab {
    id: string;
    type: 'toc' | 'preview';
    title: string;
    // For preview
    pages?: number[];
}

export const WorkspaceView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { document, isLoading, error, updateName } = useDocument(id);
    const [viewMode, setViewMode] = useState<ViewMode>('details');

    // Renaming state
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState('');

    // Tabs State
    const [tabs, setTabs] = useState<Tab[]>([
        { id: 'toc', type: 'toc', title: 'Table of Contents' }
    ]);
    const [activeTabId, setActiveTabId] = useState<string>('toc');

    const handleBack = () => {
        if (viewMode === 'quiz') {
            setViewMode('details');
        } else {
            navigate('/');
        }
    };

    const handleApprove = () => console.log('Approved');
    const handleReject = () => console.log('Rejected');

    const handleQuizGenerate = (config: QuizConfig) => {
        console.log("Generating Quiz with Config:", config);
        // TODO: Implement actual generation logic
    };

    // Helper to resolve pages from scope
    const resolvePages = (scope: QuizScope, chapter?: string, range?: { start: number, end: number }, page?: number): number[] => {
        if (!document?.toc_model) return [];

        if (scope === 'page' && page) return [page];
        if (scope === 'range' && range) {
            const pages = [];
            for (let i = range.start; i <= range.end; i++) pages.push(i);
            return pages;
        }
        if (scope === 'document') {
            // Limit to first 20 for preview performance if full doc
            const max = document.total_pages || 20;
            const limit = Math.min(max, 20);
            return Array.from({ length: limit }, (_, i) => i + 1);
        }
        if (scope === 'chapter' && chapter) {
            const sections = document.toc_model.sections || [];
            const sectionIdx = sections.findIndex(s => s.title === chapter);
            if (sectionIdx === -1) return [];

            const start = sections[sectionIdx].start_page;

            const nextSection = sections[sectionIdx + 1];
            const end = nextSection ? nextSection.start_page - 1 : start + 10;

            const pages = [];
            for (let i = start; i <= end; i++) pages.push(i);
            return pages;
        }
        return [];
    };

    const handlePreview = (scope: QuizScope, chapter?: string, range?: { start: number, end: number }, page?: number) => {
        let pages = resolvePages(scope, chapter, range, page);
        if (document?.total_pages) {
            pages = pages.filter(p => p <= document.total_pages);
        }
        if (pages.length === 0) return;

        const newTabId = `preview-${Date.now()}`;
        const title = chapter ? `Chapter: ${chapter}` :
            range ? `Pages ${range.start}-${range.end}` :
                page ? `Page ${page}` : 'Document Preview';

        const newTab: Tab = {
            id: newTabId,
            type: 'preview',
            title: title,
            pages: pages
        };

        setTabs(prev => [...prev, newTab]);
        setActiveTabId(newTabId);
    };

    const closeTab = (e: React.MouseEvent, tabId: string) => {
        e.stopPropagation();
        if (tabId === 'toc') return; // Cannot close TOC

        setTabs(prev => prev.filter(t => t.id !== tabId));
        if (activeTabId === tabId) {
            setActiveTabId('toc');
        }
    };

    const handleStartRename = () => {
        setTempName(document?.name || '');
        setIsEditingName(true);
    };

    const handleSaveRename = async () => {
        if (!tempName.trim()) return;
        if (tempName === document?.name) {
            setIsEditingName(false);
            return;
        }
        await updateName(tempName);
        setIsEditingName(false);
    };

    const handleCancelRename = () => {
        setIsEditingName(false);
        setTempName('');
    };

    const renderControlPanel = () => {
        if (isLoading) return <div className="text-slate-500">Loading details...</div>;
        if (error) return <div className="text-red-400">Error: {error}</div>;
        if (!document) return <div className="text-slate-500">Document not found</div>;

        if (viewMode === 'quiz') {
            return (
                <div className="space-y-6">
                    <button
                        onClick={() => setViewMode('details')}
                        className="text-slate-400 hover:text-white flex items-center gap-2 text-sm mb-4 cursor-pointer"
                    >
                        ← Back to Details
                    </button>
                    <QuizConfigurationForm
                        toc={document.toc_model}
                        onSubmit={handleQuizGenerate}
                        onPreview={handlePreview}
                        maxPages={document.total_pages}
                    />
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-2">Current Space</h3>
                    {isEditingName ? (
                        <div className="flex gap-2">
                            <input
                                autoFocus
                                type="text"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                className="flex-1 bg-slate-950 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveRename();
                                    if (e.key === 'Escape') handleCancelRename();
                                }}
                            />
                            <button onClick={handleSaveRename} className="text-green-400 hover:text-green-300 cursor-pointer">✓</button>
                            <button onClick={handleCancelRename} className="text-red-400 hover:text-slate-300 cursor-pointer">✕</button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between group">
                            <div className="text-xl font-semibold text-white truncate" title={document.name}>
                                {document.name}
                            </div>
                            <button
                                onClick={handleStartRename}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-indigo-400 p-1 cursor-pointer"
                                title="Rename workspace"
                            >
                                ✎
                            </button>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-4">
                    <TocReview onApprove={handleApprove} onReject={handleReject} />

                    <div className="border-t border-slate-800 pt-4">
                        <h3 className="text-white font-semibold mb-2">Actions</h3>
                        <button
                            onClick={() => setViewMode('quiz')}
                            className="w-full py-3 rounded-lg bg-indigo-500/10 border border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            Create New Quiz
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleBack}
                    className="w-full py-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                    ← Back to Home
                </button>
            </div>
        );
    };

    const renderTabs = () => (
        <div className="flex bg-slate-900 border-b border-slate-800 overflow-x-auto hide-scrollbar">
            {tabs.map(tab => (
                <div
                    key={tab.id}
                    onClick={() => setActiveTabId(tab.id)}
                    className={`
                        flex items-center gap-2 px-4 py-3 text-sm font-medium cursor-pointer transition-colors whitespace-nowrap border-r border-slate-800 rounded-t-lg
                        ${activeTabId === tab.id
                            ? 'bg-slate-800 text-white border-b-2 border-b-indigo-500'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}
                    `}
                >
                    <span>{tab.type === 'toc' ? '📑' : '👁'}</span>
                    <span>{tab.title}</span>
                    {tab.type !== 'toc' && (
                        <button
                            onClick={(e) => closeTab(e, tab.id)}
                            className="ml-2 w-4 h-4 flex items-center justify-center rounded-full hover:bg-slate-700 text-slate-500 hover:text-white transition-colors cursor-pointer"
                        >
                            ×
                        </button>
                    )}
                </div>
            ))}
        </div>
    );

    const activeTab = tabs.find(t => t.id === activeTabId);

    return (
        <DashboardLayout
            controlPanel={renderControlPanel()}
            resultsView={
                <div className="flex flex-col h-full bg-slate-950">
                    {renderTabs()}
                    <div className="flex-1 overflow-hidden relative">
                        {activeTab?.type === 'toc' && (
                            <ResultsView
                                toc={document?.toc_model}
                                isLoading={isLoading}
                                isEmpty={!document?.toc_model}
                            />
                        )}
                        {activeTab?.type === 'preview' && activeTab.pages && document && (
                            <PdfPreview
                                documentId={id!}
                                pages={activeTab.pages}
                                title={activeTab.title}
                            />
                        )}
                    </div>
                </div>
            }
            onSelectWorkspace={(newId) => navigate(`/workspace/${newId}`)}
        />
    );
};

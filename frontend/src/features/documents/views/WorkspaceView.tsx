import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocument } from '../hooks/useDocument';
import { usePdfProcessor } from '../hooks/usePdfProcessor';

import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { ResultsView } from '../components/toc/ResultsView';
import { TocReview } from '../components/toc/TocReview';
import { QuizConfigurationForm } from '../../quiz';
import { PdfPreview } from '../components/toc/PdfPreview';
import type { QuizConfig, QuizScope } from '../../quiz';
import type { Tab } from '../types';

import { WorkspaceHeader } from '../components/workspace/WorkspaceHeader';
import { WorkspaceActions } from '../components/workspace/WorkspaceActions';
import { WorkspaceTabs } from '../components/workspace/WorkspaceTabs';

type ViewMode = 'details' | 'quiz';

export const WorkspaceView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { document, isLoading: isDocLoading, error: docError, updateName, approveToc, rejectToc } = useDocument(id);
    const { generateQuiz, status: quizStatus, isLoading: isQuizLoading, error: quizError } = usePdfProcessor();
    const [viewMode, setViewMode] = useState<ViewMode>('details');

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

    const handleQuizGenerate = (config: QuizConfig) => {
        if (!id) return;
        generateQuiz(id, config);
        setTabs(prev => {
            const newTabs = prev.filter(t => t.id !== 'toc');
            return [...newTabs, { id: 'quiz', type: 'quiz', title: 'Quiz' }];
        });
        setActiveTabId('quiz');
        setViewMode('details');
    };

    const resolvePages = (scope: QuizScope, chapter?: string, range?: { start: number, end: number }, page?: number): number[] => {
        if (!document?.toc_model) return [];
        if (scope === 'page' && page) return [page];
        if (scope === 'range' && range) {
            const pages = [];
            for (let i = range.start; i <= range.end; i++) pages.push(i);
            return pages;
        }
        if (scope === 'document') {
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

        const newTab: Tab = { id: newTabId, type: 'preview', title: title, pages: pages };
        setTabs(prev => [...prev, newTab]);
        setActiveTabId(newTabId);
    };

    const closeTab = (e: React.MouseEvent, tabId: string) => {
        e.stopPropagation();
        if (tabId === 'toc' || tabId === 'quiz') return;
        setTabs(prev => prev.filter(t => t.id !== tabId));
        if (activeTabId === tabId) setActiveTabId('toc');
    };

    const activeTab = tabs.find(t => t.id === activeTabId);

    const renderControlPanel = () => {
        if (isDocLoading) return <div className="text-slate-500">Loading details...</div>;
        if (docError) return <div className="text-red-400">Error: {docError}</div>;
        if (!document) return <div className="text-slate-500">Document not found</div>;

        if (viewMode === 'quiz') {
            return (
                <div className="space-y-6">
                    <button onClick={() => setViewMode('details')} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm mb-4 cursor-pointer">
                        ← Back to Details
                    </button>
                    <QuizConfigurationForm
                        toc={document.toc_model}
                        onSubmit={handleQuizGenerate}
                        onPreview={handlePreview}
                        maxPages={document.total_pages}
                        initialConfig={document.quiz_conf}
                    />
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <WorkspaceHeader document={document} onUpdateName={updateName} />
                {!document.is_verified && document.toc_model && (
                    <TocReview onApprove={approveToc} onReject={rejectToc} />
                )}
                <WorkspaceActions
                    hasQuizConfig={!!document.quiz_conf}
                    onEditQuiz={() => setViewMode('quiz')}
                    onCreateQuiz={() => setViewMode('quiz')}
                    onBack={handleBack}
                />
            </div>
        );
    };

    return (
        <DashboardLayout
            controlPanel={renderControlPanel()}
            resultsView={
                <div className="flex flex-col h-full bg-slate-950">
                    <WorkspaceTabs
                        tabs={tabs}
                        activeTabId={activeTabId}
                        onTabClick={setActiveTabId}
                        onTabClose={closeTab}
                    />
                    <div className="flex-1 overflow-hidden relative">
                        {activeTab?.type === 'toc' && (
                            <ResultsView
                                toc={document?.toc_model}
                                isLoading={isDocLoading || isQuizLoading} // Show loading if quiz is generating and we are viewing TOC? Or maybe logic needs tweak.
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
                        {activeTab?.type === 'quiz' && (
                            <div className="p-8 flex flex-col items-center justify-center h-full text-slate-400">
                                <div className="max-w-md w-full animate-in fade-in slide-in-from-top-4 duration-500">
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-8 text-center">
                                        {isQuizLoading ? 'Generating Exam...' : 'Exam Ready'}
                                    </h3>
                                    {isQuizLoading && (
                                        <div className="flex flex-col gap-6 py-4">
                                            <div className="flex items-center gap-4 group bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center border border-indigo-500 bg-indigo-500/10 text-indigo-400 transition-all duration-300 flex-none">
                                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-200">
                                                        Inserting quiz configuration into process
                                                    </span>
                                                    <span className="text-xs text-indigo-400/70 animate-pulse">Processing...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {quizError && (
                                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200 text-sm">
                                            ⚠ {quizError}
                                        </div>
                                    )}
                                    {!isQuizLoading && quizStatus?.status === 'completed' && (
                                        <div className="mt-6 flex justify-center animate-in fade-in slide-in-from-bottom-2">
                                            <div className="text-center space-y-4">
                                                <div className="text-indigo-400 text-6xl">✨</div>
                                                <p className="text-xl text-white font-semibold">Quiz Generated Successfully!</p>
                                                <button
                                                    onClick={() => alert('Start Quiz...')}
                                                    className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 cursor-pointer"
                                                >
                                                    Start Quiz →
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            }
            onSelectWorkspace={(newId) => navigate(`/workspace/${newId}`)}
        />
    );
};

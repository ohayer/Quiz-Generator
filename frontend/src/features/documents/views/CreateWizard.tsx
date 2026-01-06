import React, { useState, useEffect } from 'react';
import { usePdfProcessor } from '../hooks/usePdfProcessor';
import { ProgressTracker } from '../components/common/ProgressTracker';
import { ResultsView } from '../components/toc/ResultsView';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { CreateSpace } from '../components/upload/CreateSpace';
import { TocReview } from '../components/toc/TocReview';
import { QuizConfigurationForm } from '../../quiz';
import { useNavigate } from 'react-router-dom';
import type { QuizConfig } from '../../quiz';

type WizardStep = 'create' | 'processing' | 'review' | 'quiz' | 'generating_quiz';

export const CreateWizard: React.FC = () => {
    const { uploadPdf, status, isLoading, error, generateQuiz } = usePdfProcessor();
    const [step, setStep] = useState<WizardStep>('create');
    const navigate = useNavigate();

    useEffect(() => {
        if (step === 'processing' && status?.status === 'completed') {
            setStep('review');
        }
    }, [status, step]);

    const handleStart = (name: string, file: File) => {
        setStep('processing');
        uploadPdf(name, file);
    };

    const handleApprove = async () => {
        setStep('quiz');
    };

    const handleReject = () => {
        setStep('create');
    };

    const handleQuizGenerate = (config: QuizConfig) => {
        if (status?.doc_id) {
            setStep('generating_quiz');
            generateQuiz(status.doc_id, config);
        } else {
            console.error("No document ID available");
        }
    };

    const renderControlPanel = () => {
        switch (step) {
            case 'create':
                return <CreateSpace onStart={handleStart} />;

            case 'processing':
                return (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 border-t border-slate-800 pt-6">
                            Processing Status
                        </h3>
                        <ProgressTracker status={status?.status || 'idle'} />
                        {error && (
                            <div className="mt-4 space-y-3">
                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200 text-sm">
                                    ⚠ {error}
                                </div>
                                <button
                                    onClick={() => setStep('create')}
                                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white transition-colors cursor-pointer"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}
                    </div>
                );

            case 'review':
                return <TocReview onApprove={handleApprove} onReject={handleReject} />;

            case 'quiz':
                return (
                    <QuizConfigurationForm
                        toc={status?.result}
                        onSubmit={handleQuizGenerate}
                    />
                );

            case 'generating_quiz':
                return (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 border-t border-slate-800 pt-6">
                            Exam Generation Status
                        </h3>
                        {/* Temporary inline progress tracker for quiz generation */}
                        <div className="flex flex-col gap-6 py-4">
                            <div className="flex items-center gap-4 group">
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 flex-none
                                    ${isLoading ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'}
                                `}>
                                    {isLoading ? (
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-200">
                                        Inserting quiz configuration into process
                                    </span>
                                    {isLoading && (
                                        <span className="text-xs text-indigo-400/70 animate-pulse">Processing...</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200 text-sm">
                                ⚠ {error}
                            </div>
                        )}

                        {!isLoading && status?.status === 'completed' && (
                            <div className="mt-6 flex justify-center animate-in fade-in slide-in-from-bottom-2">
                                <button
                                    onClick={() => alert('CONTINUE...')}
                                    className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 cursor-pointer"
                                >
                                    Continue →
                                </button>
                            </div>
                        )}
                    </div>
                );
        }
    };

    const renderResultsView = () => {
        switch (step) {
            case 'create':
                return (
                    <div className="h-full flex items-center justify-center text-slate-500">
                        <p>Select a file to begin...</p>
                    </div>
                );

            case 'processing':
            case 'review':
            case 'generating_quiz':
                return (
                    <ResultsView
                        toc={status?.result}
                        isLoading={isLoading || step === 'processing' || step === 'generating_quiz'}
                        isEmpty={false}
                    />
                );

            case 'quiz':
                return (
                    <div className="h-full flex items-center justify-center text-slate-500">
                        <div className="text-center">
                            <p className="mb-2">Document is ready.</p>
                            <p className="text-sm opacity-50">Configure your exam on the left.</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <DashboardLayout
            controlPanel={renderControlPanel()}
            resultsView={renderResultsView()}
            onSelectWorkspace={(id) => navigate(`/workspace/${id}`)}
        />
    );
};

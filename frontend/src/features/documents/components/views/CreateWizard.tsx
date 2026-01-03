import React, { useState, useEffect } from 'react';
import { usePdfProcessor } from '../../hooks/usePdfProcessor';
import { ProgressTracker } from '../common/ProgressTracker';
import { ResultsView } from '../toc/ResultsView';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { CreateSpace } from '../upload/CreateSpace';
import { TocReview } from '../toc/TocReview';
import { QuizConfigurationForm } from '../../../quiz/components/QuizConfigurationForm';
import { useNavigate } from 'react-router-dom';
import type { QuizConfig } from '../../../quiz/types';

type WizardStep = 'create' | 'processing' | 'review' | 'quiz';

export const CreateWizard: React.FC = () => {
    const { uploadPdf, status, isLoading, error } = usePdfProcessor();
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
        console.log("Generating Quiz with Config:", config);
        // TODO: Call backend API to generate quiz via LLM
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
                return (
                    <ResultsView
                        toc={status?.result}
                        isLoading={isLoading || step === 'processing'}
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

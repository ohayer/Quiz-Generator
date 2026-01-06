import React from 'react';
import type { QuizConfig, QuizScope } from '../types';
import type { TableOfContents } from '../../documents/types';
import { useQuizForm } from './form/useQuizForm';
import { ScopeSelector } from './form/ScopeSelector';
import { QuestionItem } from './form/QuestionItem';
import { QuizFormFooter } from './form/QuizFormFooter';

interface QuizConfigurationFormProps {
    toc: TableOfContents | undefined;
    onSubmit: (config: QuizConfig) => void;
    onPreview?: (scope: QuizScope, chapter?: string, range?: { start: number, end: number }, page?: number) => void;
    maxPages?: number;
    initialConfig?: QuizConfig;
}

export const QuizConfigurationForm: React.FC<QuizConfigurationFormProps> = ({ toc, onSubmit, onPreview, maxPages: initialMaxPages, initialConfig }) => {
    const {
        scope, setScope,
        selectedChapter, setSelectedChapter,
        pageRange, setPageRange,
        singlePage, setSinglePage,
        totalQuestions, setTotalQuestions,
        questions, updateQuestion, updateClosedOptions,
        chapters, maxPages, isSelectionValid,
        getConfig
    } = useQuizForm({ toc, maxPages: initialMaxPages, initialConfig });

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Fixed Controls */}
            <div className="flex-none space-y-6 bg-slate-900 border border-slate-800 rounded-xl p-6 z-10 relative shadow-xl">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-indigo-400">📝</span> Configure Exam
                </h3>

                <ScopeSelector
                    scope={scope}
                    setScope={setScope}
                    chapters={chapters}
                    selectedChapter={selectedChapter}
                    setSelectedChapter={setSelectedChapter}
                    pageRange={pageRange}
                    setPageRange={setPageRange}
                    singlePage={singlePage}
                    setSinglePage={setSinglePage}
                    maxPages={maxPages}
                    isSelectionValid={isSelectionValid}
                    onPreview={onPreview}
                />

                {/* Question Count Slider */}
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="block text-slate-400 text-sm">Total Questions</label>
                        <span className="text-indigo-400 font-bold">{totalQuestions}</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={totalQuestions}
                        onChange={(e) => setTotalQuestions(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                </div>
            </div>

            {/* Scrollable Questions List */}
            <div className="flex-1 overflow-y-auto bg-slate-900 border-x border-slate-800 p-4 space-y-4 custom-scrollbar">
                {questions.map((q, idx) => (
                    <QuestionItem
                        key={idx}
                        index={idx}
                        question={q}
                        onUpdate={(updates) => updateQuestion(idx, updates)}
                        onUpdateOptions={(updates) => updateClosedOptions(idx, updates)}
                    />
                ))}
            </div>

            <QuizFormFooter
                onSubmit={() => onSubmit(getConfig())}
                isValid={isSelectionValid}
            />
        </div>
    );
};

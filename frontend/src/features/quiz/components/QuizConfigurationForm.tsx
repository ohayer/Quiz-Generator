import React, { useState, useMemo, useEffect } from 'react';
import type { QuizConfig, QuizScope, QuestionConfig } from '../types';
import type { TableOfContents } from '../../documents/types';
import { NumberInput } from '../../../components/ui/NumberInput';
import aiIcon from '../../../assets/ai.png';

interface QuizConfigurationFormProps {
    toc: TableOfContents | undefined;
    onSubmit: (config: QuizConfig) => void;
    onPreview?: (scope: QuizScope, chapter?: string, range?: { start: number, end: number }, page?: number) => void;
    maxPages?: number;
}


export const QuizConfigurationForm: React.FC<QuizConfigurationFormProps> = ({ toc, onSubmit, onPreview, maxPages: initialMaxPages }) => {
    // Scope State
    const [scope, setScope] = useState<QuizScope>('document');
    const [selectedChapter, setSelectedChapter] = useState<string>('');
    const [pageRange, setPageRange] = useState({ start: 1, end: 1 });
    const [singlePage, setSinglePage] = useState(1);

    // Questions State
    const [totalQuestions, setTotalQuestions] = useState(5);
    const [questions, setQuestions] = useState<QuestionConfig[]>([]);

    // Initialize/Update questions array when totalQuestions changes
    useEffect(() => {
        setQuestions(prev => {
            const newQuestions = [...prev];
            if (totalQuestions > prev.length) {
                // Add new default questions
                for (let i = prev.length; i < totalQuestions; i++) {
                    newQuestions.push({
                        type: 'single_choice',
                        closedOptions: { count: 4, correctCount: 1 }
                    });
                }
            } else {
                // specific slice to remove extra
                newQuestions.length = totalQuestions;
            }
            return newQuestions;
        });
    }, [totalQuestions]);

    const updateQuestion = (index: number, updates: Partial<QuestionConfig>) => {
        setQuestions(prev => prev.map((q, i) => i === index ? { ...q, ...updates } : q));
    };

    const updateClosedOptions = (index: number, updates: Partial<{ count: number; correctCount: number }>) => {
        setQuestions(prev => prev.map((q, i) => {
            if (i !== index) return q;


            const currentOptions = q.closedOptions!;
            const newOptions = { ...currentOptions, ...updates };

            // Correct count cannot exceed total count
            if (newOptions.correctCount > newOptions.count) {
                newOptions.correctCount = newOptions.count;
            }

            //Multiple choice must have at least 2 correct answers
            if (q.type === 'multiple_choice') {
                if (newOptions.correctCount < 2) newOptions.correctCount = 2;
            } else if (q.type === 'single_choice' || q.type === 'true_false') {
                newOptions.correctCount = 1;
            }

            return {
                ...q,
                closedOptions: newOptions
            };
        }));
    };

    // Derived
    const chapters = useMemo(() => toc?.sections || [], [toc]);
    const maxPages = useMemo(() => {
        if (initialMaxPages && initialMaxPages > 0) return initialMaxPages;
        if (!chapters.length) return 100;
        return Math.max(...chapters.map(s => s.start_page)) + 10;
    }, [chapters, initialMaxPages]);

    const isSelectionValid = useMemo(() => {
        if (scope === 'chapter') return !!selectedChapter;
        if (scope === 'range') return pageRange.start <= pageRange.end && pageRange.end <= maxPages && pageRange.start >= 1;
        if (scope === 'page') return singlePage >= 1 && singlePage <= maxPages;
        return true;
    }, [scope, selectedChapter, pageRange, singlePage, maxPages]);

    const handleSubmit = () => {
        const config: QuizConfig = {
            scope,
            selectedChapter: scope === 'chapter' ? selectedChapter : undefined,
            pageRange: scope === 'range' ? pageRange : undefined,
            singlePage: scope === 'page' ? singlePage : undefined,
            questions: questions
        };
        onSubmit(config);
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Fixed Controls */}
            <div className="flex-none space-y-6 bg-slate-900 border border-slate-800 rounded-xl p-6 z-10 relative shadow-xl">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-indigo-400">📝</span> Configure Exam
                </h3>

                {/* Scope Selection */}
                <div>
                    <label className="block text-slate-400 text-sm font-medium mb-3">Scope</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {(['document', 'chapter', 'range', 'page'] as QuizScope[]).map(s => (
                            <button
                                key={s}
                                onClick={() => setScope(s)}
                                className={`
                                    py-2 px-3 rounded-lg text-sm font-medium border transition-all capitalized
                                    ${scope === s
                                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}
                                `}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scope Specific Inputs */}
                {scope === 'chapter' && (
                    <div>
                        <select
                            value={selectedChapter}
                            onChange={(e) => setSelectedChapter(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                        >
                            <option value="">-- Choose a chapter --</option>
                            {chapters.map((Section, idx) => (
                                <option key={idx} value={Section.title}>
                                    {Section.section_number} {Section.title}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {(scope === 'range' || scope === 'page') && (
                    <div className="flex gap-4">
                        {scope === 'range' && (
                            <>
                                <NumberInput
                                    value={pageRange.start}
                                    min={1}
                                    max={maxPages}
                                    onChange={(val) => {
                                        let v = val;
                                        if (v > maxPages) v = maxPages;
                                        if (v < 1) v = 1;
                                        setPageRange({ ...pageRange, start: v });
                                    }}
                                    className="flex-1"
                                    placeholder="From"
                                />
                                <NumberInput
                                    value={pageRange.end}
                                    min={pageRange.start}
                                    max={maxPages}
                                    onChange={(val) => {
                                        let v = val;
                                        if (v > maxPages) v = maxPages;
                                        setPageRange({ ...pageRange, end: v });
                                    }}
                                    className="flex-1"
                                    placeholder="To"
                                />
                            </>
                        )}
                        {scope === 'page' && (
                            <NumberInput
                                value={singlePage}
                                min={1}
                                max={maxPages}
                                onChange={(val) => {
                                    let v = val;
                                    if (v > maxPages) v = maxPages;
                                    if (v < 1) v = 1;
                                    setSinglePage(v);
                                }}
                                className="w-full"
                                placeholder="Page number"
                            />
                        )}
                    </div>
                )}

                <div className="flex justify-center w-full pt-4 pb-2 border-t border-slate-800/50 mt-4">
                    <button
                        onClick={() => {
                            onPreview?.(scope,
                                scope === 'chapter' ? selectedChapter : undefined,
                                scope === 'range' ? pageRange : undefined,
                                scope === 'page' ? singlePage : undefined
                            );
                        }}
                        disabled={!isSelectionValid}
                        className={`
                            flex items-center justify-center py-3 px-6 rounded-xl font-bold text-sm transition-all border
                            ${isSelectionValid
                                ? 'bg-slate-800 text-indigo-300 hover:bg-slate-700 hover:text-white border-indigo-500/30 cursor-pointer'
                                : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'}
                        `}
                    >
                        👁 Preview Range
                    </button>
                </div>
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
                    <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 transition-all hover:border-slate-700">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Question {idx + 1}</span>
                            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800 gap-1">
                                <button
                                    onClick={() => updateQuestion(idx, { type: 'open', closedOptions: undefined })}
                                    className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${q.type === 'open' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Open
                                </button>
                                <button
                                    onClick={() => updateQuestion(idx, { type: 'single_choice', closedOptions: { count: 4, correctCount: 1 } })}
                                    className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${q.type === 'single_choice' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Single
                                </button>
                                <button
                                    onClick={() => updateQuestion(idx, { type: 'multiple_choice', closedOptions: { count: 4, correctCount: 2 } })}
                                    className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${q.type === 'multiple_choice' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Multi
                                </button>
                                <button
                                    onClick={() => updateQuestion(idx, { type: 'true_false', closedOptions: { count: 2, correctCount: 1 } })}
                                    className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${q.type === 'true_false' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    T/F
                                </button>
                            </div>
                        </div>

                        {(q.type === 'single_choice' || q.type === 'multiple_choice') && q.closedOptions && (
                            <div className="grid grid-cols-2 gap-4 mt-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                                <div>
                                    <label className="block text-slate-500 text-[10px] uppercase mb-1">Options</label>
                                    <NumberInput
                                        value={q.closedOptions.count}
                                        min={2}
                                        max={6}
                                        onChange={(val) => updateClosedOptions(idx, { count: val })}
                                    />
                                    <div className="text-[10px] text-slate-600 mt-1 pl-1">
                                        Max: 6
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-slate-500 text-[10px] uppercase mb-1">Correct Answers</label>
                                    {q.type === 'single_choice' ? (
                                        <div className="flex items-center h-8 px-3 text-sm text-slate-500 bg-slate-950/50 border border-slate-800/50 rounded-lg">
                                            1
                                        </div>
                                    ) : (
                                        <NumberInput
                                            value={q.closedOptions.correctCount}
                                            min={q.type === 'multiple_choice' ? 2 : 1}
                                            max={q.closedOptions.count}
                                            onChange={(val) => updateClosedOptions(idx, { correctCount: val })}
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {q.type === 'true_false' && (
                            <div className="mt-2 text-xs text-slate-500 italic px-2">
                                True / False options.
                            </div>
                        )}

                        {q.type === 'open' && (
                            <div className="mt-2 text-xs text-slate-500 italic px-2">
                                Free text response expected.
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="flex-none p-4 bg-slate-900 border border-slate-800 rounded-b-xl border-t-0 flex justify-center">
                <button
                    onClick={handleSubmit}
                    disabled={!isSelectionValid}
                    className={`
                        flex items-center justify-center gap-3 py-4 px-12 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-[0.98]
                        ${isSelectionValid
                            ? 'bg-linear-to-r from-indigo-600 to-cyan-600 text-white shadow-indigo-500/25 hover:opacity-90 cursor-pointer'
                            : 'bg-slate-800 text-slate-500 shadow-none cursor-not-allowed opacity-50'}
                    `}
                >
                    <span>Generate Exam</span>
                    <img src={aiIcon} alt="AI" className="w-6 h-6 object-contain" />
                </button>
            </div>
        </div>
    );
};

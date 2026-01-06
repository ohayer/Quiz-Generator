import React from 'react';
import type { QuestionConfig, QuestionType } from '../../types';
import { NumberInput } from '../../../../components/ui/NumberInput';

interface QuestionItemProps {
    question: QuestionConfig;
    index: number;
    onUpdate: (updates: Partial<QuestionConfig>) => void;
    onUpdateOptions: (updates: Partial<{ count: number; correctCount: number }>) => void;
}

export const QuestionItem: React.FC<QuestionItemProps> = ({ question: q, index, onUpdate, onUpdateOptions }) => {
    return (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 transition-all hover:border-slate-700">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Question {index + 1}</span>
                <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800 gap-1">
                    {(['open', 'single_choice', 'multiple_choice', 'true_false'] as const).map(type => {
                        let label = 'Open';
                        if (type === 'single_choice') label = 'Single';
                        if (type === 'multiple_choice') label = 'Multi';
                        if (type === 'true_false') label = 'T/F';

                        return (
                            <button
                                key={type}
                                onClick={() => {
                                    const defaultOptions =
                                        type === 'single_choice' ? { count: 4, correctCount: 1 } :
                                            type === 'multiple_choice' ? { count: 4, correctCount: 2 } :
                                                type === 'true_false' ? { count: 2, correctCount: 1 } :
                                                    undefined;

                                    onUpdate({ type: type as QuestionType, closedOptions: defaultOptions });
                                }}
                                className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${q.type === type ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {label}
                            </button>
                        );
                    })}
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
                            onChange={(val) => onUpdateOptions({ count: val })}
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
                                onChange={(val) => onUpdateOptions({ correctCount: val })}
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
    );
};

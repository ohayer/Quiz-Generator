import React from 'react';
import type { QuizOutput, GeneratedQuestion } from '../types';

interface QuizExecutionViewProps {
    quiz: QuizOutput;
}

export const QuizExecutionView: React.FC<QuizExecutionViewProps> = ({ quiz }) => {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        return (
            <div className="flex flex-col h-full items-center justify-center p-8 text-slate-500">
                <p>No questions generated.</p>
            </div>
        );
    }
    return (
        <div className="flex flex-col h-full bg-slate-950 p-6 overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto w-full space-y-8 pb-12">
                <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="text-3xl">✨</span>
                        Generated Exam
                    </h2>
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-sm font-medium rounded-full border border-indigo-500/30">
                        {quiz.questions.length} Questions
                    </span>
                </div>

                <div className="space-y-6">
                    {quiz.questions.map((q, index) => (
                        <QuestionCard key={q.id || index} question={q} index={index + 1} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const QuestionCard: React.FC<{ question: GeneratedQuestion; index: number }> = ({ question, index }) => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 transition-all hover:border-slate-700 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex items-start gap-4 mb-4">
                <div className="flex-none bg-indigo-500 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/20">
                    {index}
                </div>
                <div className="flex-1">
                    <h3 className="text-lg text-slate-200 font-medium leading-relaxed">
                        {question.text}
                    </h3>
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-800 px-2 py-1 rounded">
                    {question.type.replace('_', ' ')}
                </span>
            </div>

            <div className="pl-12 space-y-3">
                {question.type === 'open' ? (
                    <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-4">
                        <div className="text-xs text-indigo-400 uppercase font-bold tracking-wider mb-2">Model Answer</div>
                        <p className="text-slate-300 leading-relaxed text-sm">
                            {question.answers[0]?.text || "No model answer provided."}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-2">
                        {question.answers.map((answer, idx) => (
                            <div
                                key={idx}
                                className={`
                                    flex items-center gap-3 p-3 rounded-lg border text-sm transition-all
                                    ${answer.is_correct
                                        ? 'bg-green-500/10 border-green-500/30 text-green-200'
                                        : 'bg-slate-950 border-slate-800 text-slate-400'}
                                `}
                            >
                                <div className={`
                                    w-5 h-5 rounded-full border flex items-center justify-center flex-none
                                    ${answer.is_correct
                                        ? 'border-green-500 bg-green-500/20 text-green-400'
                                        : 'border-slate-700 bg-slate-900'}
                                `}>
                                    {answer.is_correct && '✓'}
                                </div>
                                <span className={answer.is_correct ? 'font-medium' : ''}>
                                    {answer.text}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

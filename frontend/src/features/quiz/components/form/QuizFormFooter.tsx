import React from 'react';
import aiIcon from '../../../../assets/ai.png';

interface QuizFormFooterProps {
    onSubmit: () => void;
    isValid: boolean;
}

export const QuizFormFooter: React.FC<QuizFormFooterProps> = ({ onSubmit, isValid }) => {
    return (
        <div className="flex-none p-4 bg-slate-900 border border-slate-800 rounded-b-xl border-t-0 flex justify-center">
            <button
                onClick={onSubmit}
                disabled={!isValid}
                className={`
                    flex items-center justify-center gap-3 py-4 px-12 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-[0.98]
                    ${isValid
                        ? 'bg-linear-to-r from-indigo-600 to-cyan-600 text-white shadow-indigo-500/25 hover:opacity-90 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 shadow-none cursor-not-allowed opacity-50'}
                `}
            >
                <span>Generate Exam</span>
                <img src={aiIcon} alt="AI" className="w-6 h-6 object-contain" />
            </button>
        </div>
    );
};

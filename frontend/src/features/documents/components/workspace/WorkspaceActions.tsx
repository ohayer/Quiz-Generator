import React from 'react';

interface WorkspaceActionsProps {
    hasQuizConfig?: boolean;
    onEditQuiz: () => void;
    onCreateQuiz: () => void;
    onBack: () => void;
}

export const WorkspaceActions: React.FC<WorkspaceActionsProps> = ({ hasQuizConfig, onEditQuiz, onCreateQuiz, onBack }) => {
    return (
        <>
            <div className="border-t border-slate-800 pt-4">
                <h3 className="text-white font-semibold mb-2">Actions</h3>
                {hasQuizConfig ? (
                    <button
                        onClick={onEditQuiz}
                        className="w-full py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-all flex items-center justify-center gap-2 cursor-pointer font-medium mb-3 shadow-lg shadow-indigo-500/20"
                    >
                        ✏ Edit Quiz
                    </button>
                ) : (
                    <button
                        onClick={onCreateQuiz}
                        className="w-full py-3 rounded-lg bg-indigo-500/10 border border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        Create New Quiz
                    </button>
                )}
            </div>

            <button
                onClick={onBack}
                className="w-full py-2 text-slate-400 hover:text-white transition-colors cursor-pointer mt-auto"
            >
                ← Back to Home
            </button>
        </>
    );
};

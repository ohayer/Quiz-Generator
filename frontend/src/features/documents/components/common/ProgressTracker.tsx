import React from 'react';
import type { TaskStatus } from '../../types';

interface ProgressTrackerProps {
    status: TaskStatus['status'] | 'idle';
}

// Map backend status to UI stages
const getStageStatus = (currentStatus: TaskStatus['status'] | 'idle', stageId: number) => {

    let currentStage = 0;
    switch (currentStatus) {
        case 'uploading': currentStage = 1; break;
        case 'extracting': currentStage = 2; break;
        case 'processing_llm': currentStage = 3; break;
        case 'completed': currentStage = 5; break;
        case 'failed': currentStage = -1; break;
        case 'idle': currentStage = 0; break;
        default: currentStage = 0;
    }

    if (currentStage > stageId) return 'completed';
    if (currentStage === stageId) return 'active';
    return 'pending';
};

const stages = [
    { id: 1, label: 'Uploading file' },
    { id: 2, label: 'Extracting raw text' },
    { id: 3, label: 'LLM Structure Analysis' },
    { id: 4, label: 'Finalizing Table of Contents' },
];

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ status }) => {
    return (
        <div className="flex flex-col gap-6 py-4">
            {stages.map((stage) => {
                const stageStatus = getStageStatus(status, stage.id);

                return (
                    <div key={stage.id} className="flex items-center gap-4 group">
                        <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 flex-none
                            ${stageStatus === 'completed'
                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                                : stageStatus === 'active'
                                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                                    : 'bg-slate-800 border-slate-700 text-slate-600'}
                        `}>
                            {stageStatus === 'completed' && (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                            {stageStatus === 'active' && (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            )}
                            {stageStatus === 'pending' && (
                                <div className="w-2 h-2 rounded-full bg-current opacity-50" />
                            )}
                        </div>

                        <div className="flex flex-col">
                            <span className={`text-sm font-medium transition-colors duration-300
                                ${stageStatus === 'active' ? 'text-indigo-300'
                                    : stageStatus === 'completed' ? 'text-slate-200'
                                        : 'text-slate-500'}
                            `}>
                                {stage.label}
                            </span>
                            {stageStatus === 'active' && (
                                <span className="text-xs text-indigo-400/70 animate-pulse">Processing...</span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

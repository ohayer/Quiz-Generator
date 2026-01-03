import React from 'react';

interface TocReviewProps {
    onApprove: () => void;
    onReject: () => void;
}

export const TocReview: React.FC<TocReviewProps> = ({ onApprove, onReject }) => {
    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-white font-semibold">Review Extraction</h3>
            <p className="text-slate-400 text-sm">
                Please verify the extracted Table of Contents. If it looks correct, approve it to proceed.
            </p>

            <div className="flex gap-3 mt-2">
                <button
                    onClick={onReject}
                    className="flex-1 py-2 px-4 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                    <span>✕</span> Reject
                </button>
                <button
                    onClick={onApprove}
                    className="flex-1 py-2 px-4 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 cursor-pointer"
                >
                    <span>✓</span> Approve
                </button>
            </div>
        </div>
    );
};

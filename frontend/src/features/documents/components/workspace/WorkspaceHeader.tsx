import React, { useState } from 'react';


interface WorkspaceHeaderProps {
    document: { name: string } | null;
    onUpdateName: (name: string) => Promise<boolean>;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({ document, onUpdateName }) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState('');

    const handleStartRename = () => {
        setTempName(document?.name || '');
        setIsEditingName(true);
    };

    const handleSaveRename = async () => {
        if (!tempName.trim()) return;
        if (tempName === document?.name) {
            setIsEditingName(false);
            return;
        }
        await onUpdateName(tempName);
        setIsEditingName(false);
    };

    const handleCancelRename = () => {
        setIsEditingName(false);
        setTempName('');
    };

    if (!document) return null;

    return (
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-2">Current Space</h3>
            {isEditingName ? (
                <div className="flex gap-2">
                    <input
                        autoFocus
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename();
                            if (e.key === 'Escape') handleCancelRename();
                        }}
                    />
                    <button onClick={handleSaveRename} className="text-green-400 hover:text-green-300 cursor-pointer">✓</button>
                    <button onClick={handleCancelRename} className="text-red-400 hover:text-slate-300 cursor-pointer">✕</button>
                </div>
            ) : (
                <div className="flex items-center justify-between group">
                    <div className="text-xl font-semibold text-white truncate" title={document.name}>
                        {document.name}
                    </div>
                    <button
                        onClick={handleStartRename}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-indigo-400 p-1 cursor-pointer"
                        title="Rename workspace"
                    >
                        ✎
                    </button>
                </div>
            )}
        </div>
    );
};

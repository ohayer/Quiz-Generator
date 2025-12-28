import React, { useCallback, useState, useEffect } from 'react';

interface UploadZoneProps {
    onFileSelected: (file: File) => void;
    disabled?: boolean;
    resetTrigger?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelected, disabled, resetTrigger }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        if (resetTrigger) setSelectedFile(null);
    }, [resetTrigger]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (disabled || selectedFile) return;

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0 && files[0].type === 'application/pdf') {
            const file = files[0];
            setSelectedFile(file);
            onFileSelected(file);
        }
    }, [onFileSelected, disabled, selectedFile]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled || !e.target.files || selectedFile) return;
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
            onFileSelected(file);
        }
    }, [onFileSelected, disabled, selectedFile]);

    const handleRemove = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setSelectedFile(null);
    }, []);

    if (selectedFile) {
        return (
            <div className="border border-slate-700 bg-slate-800/50 rounded-lg p-4 flex items-center justify-between group">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-400 flex-none">
                        📄
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{selectedFile.name}</p>
                        <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                </div>
                {!disabled && (
                    <button
                        onClick={handleRemove}
                        className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-md transition-colors"
                        title="Remove file"
                    >
                        ✕
                    </button>
                )}
            </div>
        );
    }

    return (
        <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
                ${disabled
                    ? 'opacity-50 cursor-not-allowed border-slate-700 bg-slate-900/50'
                    : 'border-slate-700 hover:border-indigo-500 hover:bg-slate-800/30 cursor-pointer'
                }`}
        >
            <input
                type="file"
                accept=".pdf"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
                disabled={disabled}
            />
            <label htmlFor="file-upload" className={`cursor-pointer w-full h-full block ${disabled ? 'cursor-not-allowed' : ''}`}>
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center text-2xl">
                    ☁️
                </div>
                <p className="text-sm font-medium text-slate-300">
                    Click to upload or drag and drop
                </p>
                <p className="text-xs text-slate-500 mt-2">PDF files only (max 16MB)</p>
            </label>
        </div>
    );
};  

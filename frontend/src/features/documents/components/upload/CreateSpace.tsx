import React, { useState, useRef } from 'react';
import aiIcon from '../../../../assets/ai.png';

interface CreateSpaceProps {
    onStart: (name: string, file: File) => void;
}

export const CreateSpace: React.FC<CreateSpaceProps> = ({ onStart }) => {
    const [name, setName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleStart = () => {
        if (name && file) {
            onStart(name, file);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-slate-400 text-sm mb-1">Space Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. My Study Notes"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-slate-400 text-sm mb-1">Document (PDF)</label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                            ${file ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-800 hover:border-slate-700'}
                        `}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        {file ? (
                            <div className="text-indigo-300 font-medium truncate">
                                📄 {file.name}
                            </div>
                        ) : (
                            <div className="text-slate-500">
                                Click to upload PDF
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleStart}
                    disabled={!name || !file}
                    className={`
                        w-full flex items-center justify-center gap-3 py-3 rounded-lg font-medium transition-all cursor-pointer
                        ${name && file
                            ? 'bg-linear-to-r from-indigo-500 to-cyan-500 text-white hover:opacity-90 shadow-lg shadow-indigo-500/25'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
                    `}
                >
                    <span>Start extracting Table of contents</span>
                    <img src={aiIcon} alt="AI" className="w-6 h-6 object-contain" />
                </button>
            </div>
        </div>
    );
};

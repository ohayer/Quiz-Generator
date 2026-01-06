import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkspacesList } from './WorkspacesList';
import { useWorkspaces } from '../hooks/useWorkspaces';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectWorkspace?: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onSelectWorkspace }) => {
    const { workspaces, isLoading } = useWorkspaces();
    const navigate = useNavigate();

    return (
        <>
            {/* Backdrop */}
            <div
                className={`
                    fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity duration-300
                    ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                `}
                onClick={onClose}
            />

            {/* Sidebar Panel */}
            <div
                className={`
                    fixed top-0 left-0 h-full w-80 bg-slate-900 border-r border-slate-800 z-50 transform transition-transform duration-300 shadow-2xl
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-white">Workspaces</h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2">
                        <WorkspacesList
                            documents={workspaces}
                            isLoading={isLoading}
                            onSelect={(id) => {
                                onSelectWorkspace?.(id);
                                onClose();
                            }}
                        />
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800">
                        <button
                            onClick={() => {
                                navigate('/');
                                onClose();
                            }}
                            className="w-full py-3 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer font-medium"
                        >
                            <span>←</span> Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

import React from 'react';
import { WorkspacesList } from '../components/WorkspacesList';
import { useWorkspaces } from '../hooks/useWorkspaces';

interface HomeViewProps {
    onCreateNew: () => void;
    onSelectWorkspace?: (id: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onCreateNew, onSelectWorkspace }) => {
    const { workspaces, isLoading } = useWorkspaces();

    return (
        <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
            {/* Left Side - Create Action */}
            <div className="w-1/2 p-12 flex flex-col items-center justify-center border-r border-slate-900 bg-linear-to-b from-slate-950 to-slate-900/50">
                <div className="max-w-md w-full text-center space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-cyan-400">
                            Knowledge Space
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Upload documents, extract knowledge, and generate quizzes instantly.
                        </p>
                    </div>

                    <button
                        onClick={onCreateNew}
                        className="
                            group relative w-full py-6 rounded-2xl bg-slate-900 border-2 border-indigo-500/30 
                            hover:border-indigo-500 hover:bg-indigo-500/10 hover:shadow-2xl hover:shadow-indigo-500/20 
                            transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer
                        "
                    >
                        <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/50 group-hover:scale-110 transition-transform duration-300">
                            +
                        </div>
                        <span className="text-xl font-semibold text-white">Create New Space</span>
                    </button>

                    <div className="text-sm text-slate-600">
                        Start by creating a new workspace from your PDF documents
                    </div>
                </div>
            </div>

            {/* Right Side - Workspaces List */}
            <div className="w-1/2 p-12 bg-slate-950 flex flex-col">
                <div className="max-w-xl w-full mx-auto h-full flex flex-col">
                    <div className="mb-8 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-200">Your Workspaces</h2>
                        <div className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
                            {workspaces.length} Found
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <WorkspacesList
                            documents={workspaces}
                            isLoading={isLoading}
                            onSelect={onSelectWorkspace}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

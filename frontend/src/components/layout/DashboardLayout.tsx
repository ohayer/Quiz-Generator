import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { Sidebar } from '../../features/workspaces/components/Sidebar';

interface DashboardLayoutProps {
    controlPanel: ReactNode;
    resultsView: ReactNode;
    onSelectWorkspace?: (id: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ controlPanel, resultsView, onSelectWorkspace }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
            {/* Navigation Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onSelectWorkspace={onSelectWorkspace}
            />

            <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 h-screen flex flex-col">
                <header className="mb-6 flex-none flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            aria-label="Open menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            PDF <span className="text-indigo-400">Processor</span>
                        </h1>
                    </div>
                </header>

                <main className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
                    <div className="lg:w-[40%] flex flex-col gap-6 overflow-y-auto pr-2">
                        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="text-indigo-400">⚡</span> Control Panel
                            </h2>
                            {controlPanel}
                        </section>
                    </div>

                    <div className="lg:w-[60%] flex flex-col min-h-[500px] lg:min-h-0">
                        <section className="h-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col relative overflow-hidden">
                            {resultsView}
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
};


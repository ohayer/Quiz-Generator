import type { ReactNode } from 'react';

interface DashboardLayoutProps {
    controlPanel: ReactNode;
    resultsView: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ controlPanel, resultsView }) => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
            <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 h-screen flex flex-col">
                <header className="mb-6 flex-none">
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        PDF <span className="text-indigo-400">Processor</span>
                    </h1>
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

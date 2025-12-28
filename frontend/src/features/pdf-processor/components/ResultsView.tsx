import type { TableOfContents } from '../types';

interface ResultsViewProps {
    toc?: TableOfContents;
    isLoading: boolean;
    isEmpty: boolean;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ toc, isLoading, isEmpty }) => {
    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800 flex-none">
                <h2 className="text-lg font-semibold text-white">Generated Table of Contents</h2>
            </header>

            <div className="flex-1 overflow-y-auto relative min-h-[300px]">

                {isEmpty && !isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                        <div className="text-6xl mb-4 opacity-50">📂</div>
                        <p className="text-sm font-medium">Waiting for document...</p>
                        <p className="text-xs opacity-70 mt-1">Upload a PDF to start extraction</p>
                    </div>
                )}

                {isLoading && (
                    <div className="absolute inset-0 z-10 backdrop-blur-md bg-slate-900/50 flex flex-col items-center justify-center transition-all">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 animate-pulse"></div>
                            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
                        </div>
                        <h3 className="mt-6 text-lg font-medium text-white">AI is analyzing structure...</h3>
                        <p className="text-sm text-indigo-300/80 mt-2">This may take a few moments</p>
                    </div>
                )}

                {toc && !isLoading && (
                    <div className="space-y-1 pr-2">
                        {toc.sections.map((section, index) => {
                            const depth = section.section_number.split('.').length - 1;
                            const isRoot = depth === 0;

                            return (
                                <div
                                    key={index}
                                    className={`
                                        group flex items-baseline gap-4 py-2 px-3 rounded-lg hover:bg-slate-800/50 transition-colors
                                        ${isRoot ? 'mt-3 mb-1' : ''}
                                    `}
                                    style={{ marginLeft: `${depth * 1.5}rem` }}
                                >
                                    <span className={`
                                        font-mono text-indigo-400 flex-none select-all
                                        ${isRoot ? 'font-bold text-base' : 'text-sm opacity-80'}
                                    `}>
                                        {section.section_number}
                                    </span>

                                    <div className="flex-1 flex items-baseline min-w-0">
                                        <span className={`
                                            text-slate-200 truncate pr-4
                                            ${isRoot ? 'font-bold text-base' : 'text-sm font-medium'}
                                        `}>
                                            {section.title}
                                        </span>
                                        <div className="flex-1 border-b border-dotted border-slate-700 mx-2 h-1 opacity-30 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    <span className="text-slate-500 text-xs font-mono flex-none whitespace-nowrap">
                                        Pg {section.start_page}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

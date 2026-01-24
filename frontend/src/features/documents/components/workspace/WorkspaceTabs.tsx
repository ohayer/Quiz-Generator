import React from 'react';
import type { Tab } from '../../types';

interface WorkspaceTabsProps {
    tabs: Tab[];
    activeTabId: string;
    onTabClick: (id: string) => void;
    onTabClose: (e: React.MouseEvent, id: string) => void;
}

export const WorkspaceTabs: React.FC<WorkspaceTabsProps> = ({ tabs, activeTabId, onTabClick, onTabClose }) => {
    return (
        <div className="flex bg-slate-900 border-b border-slate-800 overflow-x-auto hide-scrollbar">
            {tabs.map(tab => (
                <div
                    key={tab.id}
                    onClick={() => onTabClick(tab.id)}
                    className={`
                        flex items-center gap-2 px-4 py-3 text-sm font-medium cursor-pointer transition-colors whitespace-nowrap border-r border-slate-800 rounded-t-lg
                        ${activeTabId === tab.id
                            ? 'bg-slate-800 text-white border-b-2 border-b-indigo-500'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}
                    `}
                >
                    <span>
                        {tab.type === 'toc' ? '📑' : tab.type === 'quiz' ? '📝' : '👁'}
                    </span>
                    <span>{tab.title}</span>
                    {tab.type !== 'toc' && tab.type !== 'quiz' && (
                        <button
                            onClick={(e) => onTabClose(e, tab.id)}
                            className="ml-2 w-4 h-4 flex items-center justify-center rounded-full hover:bg-slate-700 text-slate-500 hover:text-white transition-colors cursor-pointer"
                        >
                            ×
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

import React from 'react';
import type { TableOfContents } from '../../types';

interface TocViewerProps {
    toc: TableOfContents;
}

export const TocViewer: React.FC<TocViewerProps> = ({ toc }) => {
    return (
        <div className="mt-8 bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
                Table of Contents
            </h2>
            <div className="space-y-2">
                {toc.sections.map((section, index) => (
                    <div
                        key={index}
                        className="flex items-baseline hover:bg-gray-700 p-2 rounded transition-colors"
                        style={{ marginLeft: `${(section.section_number.split('.').length - 1) * 1.5}rem` }}
                    >
                        <span className="text-blue-400 font-mono mr-3 min-w-12">
                            {section.section_number}
                        </span>
                        <span className="text-gray-200 grow font-medium">
                            {section.title}
                        </span>
                        <span className="text-gray-500 text-sm ml-4 border-b border-dotted border-gray-600 grow-0 min-w-12 text-right">
                            p. {section.start_page}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

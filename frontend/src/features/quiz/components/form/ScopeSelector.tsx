import React from 'react';
import type { QuizScope } from '../../types';
import type { Section as TableOfContentsSection } from '../../../documents/types';
import { NumberInput } from '../../../../components/ui/NumberInput';

interface ScopeSelectorProps {
    scope: QuizScope;
    setScope: (scope: QuizScope) => void;
    chapters: TableOfContentsSection[];
    selectedChapter: string;
    setSelectedChapter: (val: string) => void;
    pageRange: { start: number; end: number };
    setPageRange: (val: { start: number; end: number }) => void;
    singlePage: number;
    setSinglePage: (val: number) => void;
    maxPages: number;
    isSelectionValid: boolean;
    onPreview?: (scope: QuizScope, chapter?: string, range?: { start: number, end: number }, page?: number) => void;
}

export const ScopeSelector: React.FC<ScopeSelectorProps> = ({
    scope, setScope, chapters, selectedChapter, setSelectedChapter,
    pageRange, setPageRange, singlePage, setSinglePage, maxPages,
    isSelectionValid, onPreview
}) => {
    return (
        <div className="space-y-4">
            {/* Scope Buttons */}
            <div>
                <label className="block text-slate-400 text-sm font-medium mb-3">Scope</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(['document', 'chapter', 'range', 'page'] as QuizScope[]).map(s => (
                        <button
                            key={s}
                            onClick={() => setScope(s)}
                            className={`
                                py-2 px-3 rounded-lg text-sm font-medium border transition-all capitalized
                                ${scope === s
                                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}
                            `}
                        >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scope Specific Inputs */}
            {scope === 'chapter' && (
                <div>
                    <select
                        value={selectedChapter}
                        onChange={(e) => setSelectedChapter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                    >
                        <option value="">-- Choose a chapter --</option>
                        {chapters.map((Section, idx) => (
                            <option key={idx} value={Section.title}>
                                {Section.section_number} {Section.title}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {(scope === 'range' || scope === 'page') && (
                <div className="flex gap-4">
                    {scope === 'range' && (
                        <>
                            <NumberInput
                                value={pageRange.start}
                                min={1}
                                max={maxPages}
                                onChange={(val) => {
                                    let v = val;
                                    if (v > maxPages) v = maxPages;
                                    if (v < 1) v = 1;
                                    setPageRange({ ...pageRange, start: v });
                                }}
                                className="flex-1"
                                placeholder="From"
                            />
                            <NumberInput
                                value={pageRange.end}
                                min={pageRange.start}
                                max={maxPages}
                                onChange={(val) => {
                                    let v = val;
                                    if (v > maxPages) v = maxPages;
                                    setPageRange({ ...pageRange, end: v });
                                }}
                                className="flex-1"
                                placeholder="To"
                            />
                        </>
                    )}
                    {scope === 'page' && (
                        <NumberInput
                            value={singlePage}
                            min={1}
                            max={maxPages}
                            onChange={(val) => {
                                let v = val;
                                if (v > maxPages) v = maxPages;
                                if (v < 1) v = 1;
                                setSinglePage(v);
                            }}
                            className="w-full"
                            placeholder="Page number"
                        />
                    )}
                </div>
            )}

            {/* Preview Button */}
            <div className="flex justify-center w-full pt-4 pb-2 border-t border-slate-800/50 mt-4">
                <button
                    onClick={() => {
                        onPreview?.(scope,
                            scope === 'chapter' ? selectedChapter : undefined,
                            scope === 'range' ? pageRange : undefined,
                            scope === 'page' ? singlePage : undefined
                        );
                    }}
                    disabled={!isSelectionValid}
                    className={`
                        flex items-center justify-center py-3 px-6 rounded-xl font-bold text-sm transition-all border
                        ${isSelectionValid
                            ? 'bg-slate-800 text-indigo-300 hover:bg-slate-700 hover:text-white border-indigo-500/30 cursor-pointer'
                            : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'}
                    `}
                >
                    🔍 Preview Range
                </button>
            </div>
        </div>
    );
};

import { useState, useMemo, useEffect } from 'react';
import type { QuizConfig, QuizScope, QuestionConfig } from '../../types';
import type { TableOfContents } from '../../../documents/types';

interface UseQuizFormProps {
    toc: TableOfContents | undefined;
    maxPages?: number;
    initialConfig?: QuizConfig;
}

export const useQuizForm = ({ toc, maxPages: initialMaxPages, initialConfig }: UseQuizFormProps) => {
    // Scope State
    const [scope, setScope] = useState<QuizScope>(initialConfig?.scope || 'document');
    const [selectedChapter, setSelectedChapter] = useState<string>(initialConfig?.selectedChapter || '');
    const [pageRange, setPageRange] = useState(initialConfig?.pageRange || { start: 1, end: 1 });
    const [singlePage, setSinglePage] = useState(initialConfig?.singlePage || 1);

    // Questions State
    const [totalQuestions, setTotalQuestions] = useState(initialConfig?.questions?.length || 5);
    const [questions, setQuestions] = useState<QuestionConfig[]>(initialConfig?.questions || []);

    // Initialize/Update questions array when totalQuestions changes
    useEffect(() => {
        setQuestions(prev => {
            const newQuestions = [...prev];
            if (totalQuestions > prev.length) {
                for (let i = prev.length; i < totalQuestions; i++) {
                    newQuestions.push({
                        type: 'single_choice',
                        closedOptions: { count: 4, correctCount: 1 }
                    });
                }
            } else {
                newQuestions.length = totalQuestions;
            }
            return newQuestions;
        });
    }, [totalQuestions]);

    const updateQuestion = (index: number, updates: Partial<QuestionConfig>) => {
        setQuestions(prev => prev.map((q, i) => i === index ? { ...q, ...updates } : q));
    };

    const updateClosedOptions = (index: number, updates: Partial<{ count: number; correctCount: number }>) => {
        setQuestions(prev => prev.map((q, i) => {
            if (i !== index) return q;

            const currentOptions = q.closedOptions!;
            const newOptions = { ...currentOptions, ...updates };

            if (newOptions.correctCount > newOptions.count) {
                newOptions.correctCount = newOptions.count;
            }

            if (q.type === 'multiple_choice') {
                if (newOptions.correctCount < 2) newOptions.correctCount = 2;
            } else if (q.type === 'single_choice' || q.type === 'true_false') {
                newOptions.correctCount = 1;
            }

            return { ...q, closedOptions: newOptions };
        }));
    };

    // Derived
    const chapters = useMemo(() => toc?.sections || [], [toc]);
    const maxPages = useMemo(() => {
        if (initialMaxPages && initialMaxPages > 0) return initialMaxPages;
        if (!chapters.length) return 100;
        return Math.max(...chapters.map(s => s.start_page)) + 10;
    }, [chapters, initialMaxPages]);

    const isSelectionValid = useMemo(() => {
        if (scope === 'chapter') return !!selectedChapter;
        if (scope === 'range') return pageRange.start <= pageRange.end && pageRange.end <= maxPages && pageRange.start >= 1;
        if (scope === 'page') return singlePage >= 1 && singlePage <= maxPages;
        return true;
    }, [scope, selectedChapter, pageRange, singlePage, maxPages]);

    const getConfig = (): QuizConfig => ({
        scope,
        selectedChapter: scope === 'chapter' ? selectedChapter : undefined,
        pageRange: scope === 'range' ? pageRange : undefined,
        singlePage: scope === 'page' ? singlePage : undefined,
        questions: questions
    });

    return {
        scope, setScope,
        selectedChapter, setSelectedChapter,
        pageRange, setPageRange,
        singlePage, setSinglePage,
        totalQuestions, setTotalQuestions,
        questions, updateQuestion, updateClosedOptions,
        chapters, maxPages, isSelectionValid,
        getConfig
    };
};

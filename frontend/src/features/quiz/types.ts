export type QuizScope = 'document' | 'chapter' | 'range' | 'page';
export type QuestionType = 'open' | 'closed';

export interface QuestionConfig {
    type: QuestionType;
    closedOptions?: {
        count: number;
        correctCount: number;
    };
}

export interface QuizConfig {
    scope: QuizScope;
    selectedChapter?: string;
    pageRange?: { start: number; end: number };
    singlePage?: number;
    questions: QuestionConfig[];
}

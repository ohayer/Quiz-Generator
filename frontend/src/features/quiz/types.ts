export type QuizScope = 'document' | 'chapter' | 'range' | 'page';
export type QuestionType = 'open' | 'multiple_choice' | 'single_choice' | 'true_false';

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

export interface QuizAnswer {
    text: string;
    is_correct: boolean;
}

export interface GeneratedQuestion {
    id: number;
    text: string;
    type: QuestionType;
    answers: QuizAnswer[];
}

export interface QuizOutput {
    questions: GeneratedQuestion[];
}

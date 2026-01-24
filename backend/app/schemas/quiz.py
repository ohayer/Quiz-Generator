from enum import Enum
from typing import List, Optional
from pydantic import BaseModel


class QuestionType(str, Enum):
    OPEN = "open"
    MULTIPLE_CHOICE = "multiple_choice"
    SINGLE_CHOICE = "single_choice"
    TRUE_FALSE = "true_false"


class QuizConfigScope(str, Enum):
    document = "document"
    chapter = "chapter"
    range = "range"
    page = "page"


class QuestionConfig(BaseModel):
    type: QuestionType
    closedOptions: Optional[dict] = None  # count, correctCount


class QuizConfig(BaseModel):
    scope: QuizConfigScope
    selectedChapter: Optional[str] = None
    pageRange: Optional[dict] = None  # start, end
    singlePage: Optional[int] = None
    questions: List[QuestionConfig]


class QuizAnswer(BaseModel):
    text: str
    is_correct: bool


class GeneratedQuestion(BaseModel):
    id: int
    text: str
    type: QuestionType
    answers: List[QuizAnswer]


class QuizOutput(BaseModel):
    questions: List[GeneratedQuestion]

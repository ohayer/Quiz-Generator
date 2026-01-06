from app.core.llm.config import load_settings
from app.core.llm.model import LangChainConnection, ModelProfile
from app.core.llm.rag_service import LangChainRAGService


SYSTEM_MESSAGE = """You are a precision quiz maker.
Your task is to create a quiz based on the given text and the given number of questions.

RULES:
1. Create a quiz with the given number of questions.
2. Each question should have a unique question and answer.
3. The questions should be based on the given text.
4. The questions should be challenging but not too hard.
5. The questions should be based on the given text.
"""


def _default_rag() -> LangChainRAGService:
    settings = load_settings()
    connection = LangChainConnection(settings, ModelProfile.LARGE)
    return LangChainRAGService(connection, system_prompt=SYSTEM_MESSAGE)


class QuizService:
    def __init__(self):
        self.rag_service = _default_rag()

    async def generate_questions(self, context: str, num_questions: int):
        # Implementation placeholder / transfer
        pass

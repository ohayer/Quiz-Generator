import logging
from typing import Optional, List
from app.core.llm.config import load_settings
from app.core.llm.model import LangChainConnection, ModelProfile
from app.core.llm.rag_service import LangChainRAGService
from app.schemas.quiz import QuizOutput, QuestionConfig

logger = logging.getLogger(__name__)

# Few-shot prompting examples
FEW_SHOT_EXAMPLES = """
EXAMPLE 1:
Context: "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize nutrients from carbon dioxide and water. Photosynthesis in plants generally involves the green pigment chlorophyll and generates oxygen as a byproduct."
Request: Create 1 'open' question.
Output:
{{
  "questions": [
    {{
      "id": 1,
      "text": "Explain the role of chlorophyll in photosynthesis and what byproduct is generated.",
      "type": "open",
      "answers": [
        {{
          "text": "Chlorophyll is a green pigment that helps absorb sunlight throughout the process. Oxygen is generated as a byproduct.",
          "is_correct": true
        }}
      ]
    }}
  ]
}}

EXAMPLE 2:
Context: "The French Revolution was a period of far-reaching social and political upheaval in France and its colonies beginning in 1789. The Revolution overthrew the monarchy, established a republic, catalyzed violent periods of political turmoil, and finally culminated in a dictatorship under Napoleon who brought many of its principles to areas he conquered in Western Europe and beyond."
Request: Create 1 'single_choice' question with 4 options.
Output:
{{
  "questions": [
    {{
      "id": 1,
      "text": "In which year did the French Revolution begin?",
      "type": "single_choice",
      "answers": [
        {{ "text": "1789", "is_correct": true }},
        {{ "text": "1799", "is_correct": false }},
        {{ "text": "1776", "is_correct": false }},
        {{ "text": "1812", "is_correct": false }}
      ]
    }}
  ]
}}
"""

SYSTEM_MESSAGE = f"""You are an advanced educational AI assistant specializing in generating high-quality exam quizzes from provided text.
Your goal is to create precise, challenging, and context-aware questions based strictly on the provided context.

RULES:
1. STRICT ADHERENCE: Generate questions ONLY based on the provided "CONTEXT". Do not hallucinate external information.
2. FORMAT: Return the result strictly as a JSON object matching the requested schema.
3. QUESTION TYPES:
   - 'open': Provide a detailed "model answer" in the 'answers' list (marked as correct).
   - 'single_choice': Provide the requested number of options with EXACTLY ONE correct answer.
   - 'multiple_choice': Provide the requested number of options with AT LEAST TWO correct answers.
   - 'true_false': Provide exactly two options (True/False) with one correct answer.
4. QUALITY: Avoid trivial questions. Focus on understanding, analysis, and key concepts.

{FEW_SHOT_EXAMPLES}
"""


def _default_rag() -> LangChainRAGService:
    settings = load_settings()
    connection = LangChainConnection(settings, ModelProfile.LARGE)
    return LangChainRAGService(connection, system_prompt=SYSTEM_MESSAGE)


class GenerationQuizAgent:
    def __init__(self):
        self.rag_service = _default_rag()

    async def generate_quiz(
        self, context: str, questions_config: List[QuestionConfig]
    ) -> Optional[QuizOutput]:
        """
        Generates a quiz based on the provided context and configuration.
        """
        if not context:
            logger.warning("Empty context provided for quiz generation.")
            return None

        # Serialize questions config to string for the prompt
        questions_conf_str = "\n".join(
            [
                f"- Question {i + 1}: Type={q.type.value}, Config={q.closedOptions}"
                for i, q in enumerate(questions_config)
            ]
        )

        user_prompt = f"""
        CONTEXT:
        {context[:150000]} #safe limit for now

        INSTRUCTIONS:
        Create a quiz with {len(questions_config)} questions based strictly on the above context.
        Follow this specific configuration structure:
        {questions_conf_str}
        """

        try:
            response = self.rag_service.answer_structured(
                question=user_prompt, response_model=QuizOutput, context=context
            )
            return response
        except Exception as e:
            logger.error(f"Error during LLM quiz generation: {e}")
            return None

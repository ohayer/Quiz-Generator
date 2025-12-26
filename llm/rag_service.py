from __future__ import annotations

from typing import Optional, Type, TypeVar

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel

from llm.model import LangChainConnection

T = TypeVar("T", bound=BaseModel)


class LangChainRAGService:
    """Lightweight LangChain helper that answers with optional user-provided context."""

    def __init__(
        self,
        connection: LangChainConnection,
        system_prompt: str = "You are a helpful assistant that answers using the provided context.",
    ) -> None:
        self.connection = connection
        self.system_prompt = system_prompt

    def answer(self, question: str, context: str = "") -> str:
        """Return a free-form answer. If context is provided, it is injected into the prompt."""
        chain = self._build_chain(structured_model=None)
        return chain.invoke({"question": question, "context": context})

    def answer_structured(
        self, question: str, response_model: Type[T], context: str = ""
    ) -> T:
        """Return a structured answer parsed into the given Pydantic model."""
        chain = self._build_chain(structured_model=response_model)
        return chain.invoke({"question": question, "context": context})

    def _build_chain(self, structured_model: Optional[Type[BaseModel]] = None):
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", self.system_prompt),
                (
                    "human",
                    "Use the context to answer the question.\n\nContext:\n{context}\n\nQuestion: {question}",
                ),
            ]
        )

        llm = self.connection.chat_model
        if structured_model is not None:
            llm = llm.with_structured_output(structured_model)
            return prompt | llm

        return prompt | llm | StrOutputParser()


__all__ = ["LangChainRAGService"]

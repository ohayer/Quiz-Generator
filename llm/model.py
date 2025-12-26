from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

from langchain_openai import ChatOpenAI

from llm.config import Settings, load_settings


@dataclass(frozen=True)
class ModelSpec:
    model_id: str
    context_window: int
    has_temperature: bool = True


class ModelProfile(Enum):
    LARGE = ModelSpec(model_id="gpt-5.1", context_window=400_000)
    MINI = ModelSpec(model_id="gpt-5-mini", context_window=400_000)
    NANO = ModelSpec(model_id="gpt-5-nano", context_window=400_000)

    @classmethod
    def from_model_id(cls, model_id: str) -> "ModelProfile":
        for profile in cls:
            if profile.value.model_id == model_id:
                return profile
        return cls.NANO

    @property
    def model_id(self) -> str:
        return self.value.model_id

    @property
    def context_window(self) -> int:
        return self.value.context_window


class LangChainConnection:
    """Lightweight LangChain client wrapper keeping model selection together with shared settings."""

    def __init__(
        self,
        settings: Settings | None = None,
        model: ModelProfile | None = None,
        temperature: float = 0.0,
    ) -> None:
        self.settings = settings or load_settings()
        self.model = model or ModelProfile.from_model_id(self.settings.default_model)
        
        # model nano can only have temperature 1
        if self.model == ModelProfile.NANO:        
            temperature = 1
    
        self.chat_model = ChatOpenAI(
            model=self.model.model_id,
            api_key=self.settings.api_key,
            temperature=temperature,
        )
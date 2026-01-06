import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    api_key: str
    default_model: str = "gpt-4o-mini-128k"
    embedding_model: str = "text-embedding-3-large"
    chroma_persist_dir: str = "./chroma_store"
    chroma_collection: str = "documents"


def load_settings() -> Settings:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is required but not set.")

    return Settings(
        api_key=api_key,
        default_model=os.getenv("OPENAI_DEFAULT_MODEL", "gpt-4o-mini-128k"),
        embedding_model=os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-large"),
        chroma_persist_dir=os.getenv("CHROMA_PERSIST_DIR", "./chroma_store"),
        chroma_collection=os.getenv("CHROMA_COLLECTION", "documents"),
    )

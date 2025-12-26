from __future__ import annotations

from typing import Any, Dict, Iterable, Optional, Sequence
from uuid import uuid4

from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from llm.config import Settings, load_settings


class LangChainVectorStore:
    """Wrapper around a Chroma vector store configured with OpenAI embeddings."""

    def __init__(
        self,
        settings: Optional[Settings] = None,
        collection_name: Optional[str] = None,
        text_splitter: Optional[RecursiveCharacterTextSplitter] = None,
    ) -> None:
        self.settings = settings or load_settings()
        self.collection_name = collection_name or self.settings.chroma_collection
        self.text_splitter = text_splitter or RecursiveCharacterTextSplitter(
            chunk_size=800, chunk_overlap=120
        )
        self.embeddings = OpenAIEmbeddings(
            api_key=self.settings.api_key, model=self.settings.embedding_model
        )
        self.store = Chroma(
            collection_name=self.collection_name,
            embedding_function=self.embeddings,
            persist_directory=self.settings.chroma_persist_dir,
        )

    def ingest_table_of_contents(
        self, toc_text: str, metadata: Optional[Dict[str, Any]] = None
    ) -> list[str]:
        """Tokenizes and stores a raw table-of-contents string, returning created chunks."""
        documents = self.text_splitter.create_documents(
            [toc_text], metadatas=[metadata or {}]
        )
        self.store.add_documents(documents)
        self.store.persist()
        return [doc.page_content for doc in documents]

    def add_documents(
        self,
        documents: Sequence[Document],
        ids: Optional[Iterable[str]] = None,
    ) -> None:
        ids = [str(uuid4()) for _ in documents] if ids is None else list(ids)
        self.store.add_documents(documents=documents, ids=ids)
        self.store.persist()

    def retriever(
        self, top_k: int = 3, metadata_filter: Optional[Dict[str, Any]] = None
    ):
        search_kwargs: Dict[str, Any] = {"k": top_k}
        if metadata_filter:
            search_kwargs["filter"] = metadata_filter
        return self.store.as_retriever(search_kwargs=search_kwargs)

    def search(
        self, query_text: str, top_k: int = 3, metadata_filter: Optional[Dict[str, Any]] = None
    ) -> list[str]:
        retriever = self.retriever(top_k=top_k, metadata_filter=metadata_filter)
        results = retriever.get_relevant_documents(query_text)
        return [doc.page_content for doc in results]

    def clear_collection(self) -> None:
        """Remove and recreate the collection to start from a clean slate."""
        self.store.delete_collection()
        self.store = Chroma(
            collection_name=self.collection_name,
            embedding_function=self.embeddings,
            persist_directory=self.settings.chroma_persist_dir,
        )

    def list_documents(self, limit: Optional[int] = None) -> list[Document]:
        """Return documents stored in the underlying Chroma collection.

        This helper attempts a few strategies to read documents from the
        underlying Chroma/ChromaDB collection. The Chroma wrapper used by
        different langchain versions exposes slightly different internals, so
        this method is defensive and returns the best-effort list of
        langchain_core.documents.Document objects.

        If an exact dump is not available via the Chroma client, we fall back
        to a retriever-based search with a common stopword to retrieve a
        representative sample.
        """
        # Strategy 1: try to use the underlying collection's `get` method
        try:
            # Many Chroma wrappers expose a `get` that returns a dict with
            # 'documents' and 'metadatas'. Guard with getattr to avoid hard
            # failures if the attribute is missing.
            collection = getattr(self.store, "_collection", None) or getattr(self.store, "client", None)
            if collection is not None and hasattr(collection, "get"):
                data = collection.get()  # type: ignore[arg-type]
                docs = []
                documents = data.get("documents") or []
                metadatas = data.get("metadatas") or [{}] * len(documents)
                for text, md in zip(documents, metadatas):
                    docs.append(Document(page_content=text, metadata=md))
                return docs[:limit] if limit is not None else docs
        except Exception:
            # Best-effort: ignore and try other strategies
            pass

        # Strategy 2: try the store wrapper's helper if available
        try:
            if hasattr(self.store, "get"):
                data = self.store.get()
                documents = data.get("documents") or []
                metadatas = data.get("metadatas") or [{}] * len(documents)
                docs = [Document(page_content=t, metadata=m) for t, m in zip(documents, metadatas)]
                return docs[:limit] if limit is not None else docs
        except Exception:
            pass

        # Strategy 3: fallback to retriever with a common stopword to obtain
        # a representative sample of stored chunks.
        try:
            retriever = self.retriever(top_k=limit or 10)
            results = retriever.get_relevant_documents("the")
            return results
        except Exception:
            return []


__all__ = ["LangChainVectorStore"]

from functools import lru_cache

from backend.services.orchestrator import Orchestrator


@lru_cache()
def get_orchestrator() -> Orchestrator:
    return Orchestrator()

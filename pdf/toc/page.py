from dataclasses import dataclass

@dataclass(frozen=True)
class ToCPage:
    page_number: int
    page_index: int
    clean_text: str
    confidence_score: float

@dataclass
class ScoredPage:
    page_index: int
    raw_text: str
    score: float
    internal_link_density: float = 0.0

@dataclass(frozen=True)
class ToCStyle:
    has_leaders: bool
    is_dense_numbers: bool


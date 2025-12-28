from dataclasses import dataclass, field
from typing import List, Tuple
from .regex_checker import RegexChecker

@dataclass
class ToCConfiguration:
    min_score_to_be_candidate: float = 0.35
    continuation_threshold: float = 0.20

    keywords: List[Tuple[str, float]] = field(default_factory=lambda: [
        ("table of contents", 1),
        ("contents", 1),
        ("toc", 0.4),
        ("summary of contents", 1),
        ("index of contents", 1),
        ("chapter", 0.3),
        ("bibliography", 0.2),
        ("references", 0.2),
        ("index", 0.2),
        ("introduction", 0.2),
        ("part", 0.1)
    ])

    negative_keywords: List[str] = field(default_factory=lambda: [
        "isbn", "copyright", "all rights reserved", "license",
        "trademarks", "printed in", "publication data", "contents at a glance"
    ])

    checker_spaced_dots: RegexChecker = field(default_factory=lambda: RegexChecker(
        pattern=r"(?:\s?\.\s?){3,}", ignore_case=False
    ))
    checker_long_dots: RegexChecker = field(default_factory=lambda: RegexChecker(
        pattern=r"\.{3,}", ignore_case=False
    ))

    # Line that is JUST a number (Arabic or Roman)
    checker_solo_num: RegexChecker = field(default_factory=lambda: RegexChecker(
        pattern=r"^\s*(\d+|[ivxlcdm]+)\s*$", ignore_case=True
    ))

    # Line that ends with a number (e.g. "Chapter 1 ... 23")
    checker_trailing_num: RegexChecker = field(default_factory=lambda: RegexChecker(
        pattern=r".*?(?P<num>\d+|[ivxlcdm]+)\s*$", ignore_case=True
    ))

    noise_checkers: List[RegexChecker] = field(default_factory=lambda: [
        RegexChecker(r"^\s*$", True),
        RegexChecker(r"^\s*page(s)?\s*$", True),
        RegexChecker(r"^\s*\d+\s*/\s*\d+\s*$", True),
        RegexChecker(r"^\s*_\s*$", True)
    ])


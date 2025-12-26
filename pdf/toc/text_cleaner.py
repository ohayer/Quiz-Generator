from __future__ import annotations

from typing import List
from pdf.toc.configuration import ToCConfiguration


class TextCleaner:
    def __init__(self, config: ToCConfiguration) -> None:
        self.config = config

    def clean(self, raw_text: str) -> str:
        lines = raw_text.splitlines()

        lines = [self._replace_dot_leaders(line) for line in lines]
        lines = [line for line in lines if not self._is_noise_line(line)]
        lines = [self._collapse_whitespace(line) for line in lines if line.strip()]
        lines = self._merge_title_with_orphaned_page_number(lines)

        return "\n".join(line for line in lines if line)

    def _replace_dot_leaders(self, line: str) -> str:
        line = self.config.checker_spaced_dots.sub("...", line)
        line = self.config.checker_long_dots.sub("...", line)
        return line

    def _is_noise_line(self, line: str) -> bool:
        return any(checker.fullmatch(line) for checker in self.config.noise_checkers)

    def _collapse_whitespace(self, line: str) -> str:
        return " ".join(line.split())

    def _merge_title_with_orphaned_page_number(self, lines: List[str]) -> List[str]:
        result: List[str] = []
        i = 0

        while i < len(lines):
            current = lines[i]

            if i + 1 < len(lines) and self.config.checker_solo_num.fullmatch(lines[i + 1]):
                page_number = self.config.checker_solo_num.match(lines[i + 1]).group(1)  # type: ignore[union-attr]
                title = current.rstrip() + (" ..." if "..." not in current else "")
                result.append(f"{title} {page_number}")
                i += 2
            else:
                result.append(current)
                i += 1

        return result
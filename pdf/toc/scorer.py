from typing import List
from pdf.toc.configuration import ToCConfiguration
from pdf.toc.page import ToCStyle

class ToCScorer:
    """Compute confidence scores and extract page style fingerprints."""
    def __init__(self, config: ToCConfiguration):
        # Store configuration for scoring heuristics
        self.config = config

    def calculate_confidence(self, text: str, internal_link_density: float = 0.0) -> float:
        lower_text = text.lower()

        # Negative Filter
        negative_hits = sum(1 for k in self.config.negative_keywords if k in lower_text)
        if negative_hits > 0:
            return 0.05

        # Layout score computed from visual and textual heuristics
        layout_score = self._score_layout(text, internal_link_density=internal_link_density)

        # Keyword boost: accumulate configured keyword weights
        keyword_bonus = 0.0
        for kw_text, kw_weight in self.config.keywords:
            if kw_text and kw_text in lower_text:
                keyword_bonus += kw_weight
        # Cap the total keyword bonus to 1.0
        keyword_bonus = min(keyword_bonus, 1.0)

        return min(layout_score + keyword_bonus, 1.0)

    def _trailing_number_stats(self, lines: List[str]) -> tuple[int, float, int]:
        """Return counts and runs for lines ending with numbers.

        Returns (count_trailing, ratio_trailing, longest_run).
        """
        if not lines:
            return 0, 0.0, 0

        flags = [bool(self.config.checker_trailing_num.match(ln)) for ln in lines]
        count_trailing = sum(flags)
        ratio_trailing = count_trailing / len(lines)

        longest_run = 0
        current_run = 0
        for f in flags:
            if f:
                current_run += 1
                if current_run > longest_run:
                    longest_run = current_run
            else:
                current_run = 0

        return count_trailing, ratio_trailing, longest_run

    def analyze_style(self, text: str) -> ToCStyle:
        """
        Extracts stylistic features from a page to compare with others.
        """
        lines = [ln for ln in text.splitlines() if ln.strip()]
        if not lines:
            return ToCStyle(has_leaders=False, is_dense_numbers=False)
        # Normalize for leader detection and test presence of dot leaders
        lines_norm = [self.config.checker_spaced_dots.sub("...", ln) for ln in lines]
        has_leaders = any("..." in ln for ln in lines_norm)

        # Compute trailing-number statistics to judge density
        _, ratio_trailing, longest_run = self._trailing_number_stats(lines)
        is_dense = ratio_trailing >= 0.5 and longest_run >= 3

        return ToCStyle(has_leaders=has_leaders, is_dense_numbers=is_dense)

    def are_styles_consistent(self, leader_style: ToCStyle, candidate_style: ToCStyle) -> bool:
        """
        Determines if a candidate page matches the style of the leader page.
        """
        # If the leader has dots, the follower MUST have dots.
        if leader_style.has_leaders and not candidate_style.has_leaders:
            return False

        # If the leader is extremely dense with numbers, the follower shouldn't be empty of them.
        # We allow some relaxation here (e.g. last page of ToC might be short).
        if leader_style.is_dense_numbers and not candidate_style.is_dense_numbers:
            if not candidate_style.has_leaders:
                return False

        return True

    def _score_layout(self, text: str, internal_link_density: float = 0.0) -> float:
        lines_raw = [ln for ln in text.splitlines() if ln.strip()]
        if not lines_raw:
            return 0.0
        # Normalize dot leaders for layout checks
        lines = [self.config.checker_spaced_dots.sub("...", ln) for ln in lines_raw]

        count_leaders = sum(1 for ln in lines if "..." in ln)

        # Use heuristic that counts lines ending in numbers
        count_trailing, ratio_trailing, longest_run = self._trailing_number_stats(lines_raw)

        total_lines = len(lines)

        # Primary layout heuristic
        if ratio_trailing >= 0.5 and longest_run >= 3:
            base_score = 0.85
        else:
            base_score = ((count_leaders * 1.2) + (count_trailing * 0.6)) / total_lines

        # Boost for internal link density
        base_score += 0.5 * internal_link_density

        return min(base_score, 1.0)

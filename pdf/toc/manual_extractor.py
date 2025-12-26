from typing import List, Optional
from fitz import Document

from pdf.toc.configuration import ToCConfiguration
from pdf.toc.text_cleaner import TextCleaner
from pdf.toc.scorer import ToCScorer
from pdf.toc.page import ToCPage, ScoredPage

class ManualToCExtractor:
    """Table-of-Contents extractor orchestrating cleaning and scoring.

    Methods are implemented to scan front pages, identify a leading ToC page,
    and collect adjacent pages that match the leader's style and score.
    """
    def __init__(self, config: Optional[ToCConfiguration] = None):
        """Initialize extractor with provided configuration.

        Args:
            config: Optional ToCConfiguration. If omitted, defaults are used.
        """
        self.config = config or ToCConfiguration()
        self.cleaner = TextCleaner(self.config)
        self.scorer = ToCScorer(self.config)

    def manual_extract(self, pdf_doc: Document, front_scan: int = 35) -> List[ToCPage]:
        """Scan a PDF document and return detected ToC pages.

        The algorithm scans up to `front_scan` pages from the start of the
        document, scores each page, selects the best candidate, then expands
        backward and forward to include adjacent pages that meet the
        continuation criteria (score threshold and style consistency).

        Args:
            pdf_doc: PyMuPDF Document instance.
            front_scan: Number of pages from the front to scan (default 35).

        Returns:
            A list of ToCPage objects describing the pages identified as ToC.
        """
            
        total_pages = pdf_doc.page_count
        scan_limit = min(front_scan, total_pages)

        scored_pages: List[ScoredPage] = []

        # Score all pages.
        for idx in range(scan_limit):
            page = pdf_doc.load_page(idx)

            # Plain text used by layout heuristics.
            raw_text = page.get_text() or ""

            # Compute internal link density (links that point to pages in the same file).
            links = page.get_links() or []
            internal_links = [lnk for lnk in links if isinstance(lnk.get("page"), int)]
            lines_count = max(1, len(raw_text.splitlines()))
            internal_link_density = len(internal_links) / lines_count

            score = self.scorer.calculate_confidence(
                raw_text,
                internal_link_density=internal_link_density
            )
            scored_pages.append(ScoredPage(idx, raw_text, score, internal_link_density))

        # Identify the best candidate.
        candidates = [p for p in scored_pages if p.score >= self.config.min_score_to_be_candidate]
        if not candidates:
            return []

        best_candidate = max(candidates, key=lambda x: x.score)
        winner_style = self.scorer.analyze_style(best_candidate.raw_text)

        final_toc_pages: List[ToCPage] = []

    # >>> BACKWARD: scan pages preceding the leader to include earlier ToC pages
        back_idx = best_candidate.page_index - 1
        backward_pages: List[ToCPage] = []
        while back_idx >= 0:
            prev_page = next((p for p in scored_pages if p.page_index == back_idx), None)
            if not prev_page:
                break

            is_score_ok = prev_page.score >= self.config.continuation_threshold
            current_style = self.scorer.analyze_style(prev_page.raw_text)
            is_style_ok = self.scorer.are_styles_consistent(winner_style, current_style)

            if is_score_ok and is_style_ok:
                backward_pages.append(self._create_toc_page(pdf_doc, prev_page))
                back_idx -= 1
            else:
                break

    # Prepend earlier pages in chronological order.
        backward_pages.reverse()
        final_toc_pages.extend(backward_pages)

    # Append the leader page.
        final_toc_pages.append(self._create_toc_page(pdf_doc, best_candidate))

    # Forward scan: include subsequent pages that meet score and style checks.
        current_idx = best_candidate.page_index + 1

        while current_idx < scan_limit:
            next_page = next((p for p in scored_pages if p.page_index == current_idx), None)

            if not next_page:
                break

            # Check A: score threshold
            is_score_ok = next_page.score >= self.config.continuation_threshold

            # Check B: style consistency vs leader
            current_style = self.scorer.analyze_style(next_page.raw_text)
            is_style_ok = self.scorer.are_styles_consistent(winner_style, current_style)

            if is_score_ok and is_style_ok:
                final_toc_pages.append(self._create_toc_page(pdf_doc, next_page))
                current_idx += 1
            else:
                # Stop when next page does not meet continuation criteria.
                break

        return final_toc_pages

    def _create_toc_page(self, pdf_doc: Document, scored_page: ScoredPage) -> ToCPage:
        """Construct a ToCPage from a scored page.

        Args:
            pdf_doc: PyMuPDF Document used to resolve link information.
            scored_page: ScoredPage containing raw text and score.

        Returns:
            ToCPage with cleaned text and confidence score.
        """
        clean_text = self._build_clean_text_with_links(pdf_doc, scored_page)
        return ToCPage(
            page_number=scored_page.page_index + 1,
            page_index=scored_page.page_index,
            clean_text=clean_text,
            confidence_score=scored_page.score
        )

    def _build_clean_text_with_links(self, pdf_doc: Document, scored_page: ScoredPage) -> str:
        """Build cleaned page text enriched with internal link targets.

        The method maps internal link rectangles to text lines and appends a
        short marker indicating target page numbers for each line that contains
        one or more internal links.

        Args:
            pdf_doc: PyMuPDF Document used to access page structure.
            scored_page: ScoredPage for which to build the cleaned text.

        Returns:
            A cleaned string where lines that contain links include a marker
            like "[links->pages: 5, 7]". Falls back to regular cleaned text
            if the 'dict' text extraction mode is unavailable.
        """
        page = pdf_doc.load_page(scored_page.page_index)

        try:
            page_dict = page.get_text("dict")
        except Exception:
            # Fallback: use cleaned raw text when structured extraction is not available
            return self.cleaner.clean(scored_page.raw_text)

        links = page.get_links() or []
        internal_links = [lnk for lnk in links if isinstance(lnk.get("page"), int)]

    # Prepare structure: line text, bbox and set of target pages
        line_entries: List[dict] = []

        for block in page_dict.get("blocks", []):
            # Skip non-text blocks (type 0 denotes text)
            if block.get("type", 0) != 0:
                continue

            for line in block.get("lines", []):
                text = "".join(span.get("text", "") for span in line.get("spans", []))
                bbox = line.get("bbox")
                line_entries.append({
                    "text": text,
                    "bbox": bbox,
                    "target_pages": set()
                })

        def rects_intersect(r1, r2, eps: float = 1e-3) -> bool:
            if r1 is None or r2 is None:
                return False
            x0 = max(r1[0], r2[0])
            y0 = max(r1[1], r2[1])
            x1 = min(r1[2], r2[2])
            y1 = min(r1[3], r2[3])
            return (x1 - x0) > eps and (y1 - y0) > eps

        # Assign internal links to lines by bbox intersection
        for link in internal_links:
            rect = link.get("from") or link.get("rect")
            target_page = link.get("page")
            if rect is None or target_page is None:
                continue

            # PyMuPDF returns 0-based page indices; convert to 1-based numbers
            page_number = target_page + 1

            for entry in line_entries:
                if rects_intersect(rect, entry["bbox"]):
                    entry["target_pages"].add(page_number)

    # Build raw text with appended link target markers
        lines_with_markers: List[str] = []
        for entry in line_entries:
            text = entry["text"]
            if entry["target_pages"]:
                # Example: "[links->pages: 5]" or "[links->pages: 5, 7]"
                pages_str = ", ".join(str(p) for p in sorted(entry["target_pages"]))
                text = f"{text} [links->pages: {pages_str}]"
            lines_with_markers.append(text)

        marked_text = "\n".join(lines_with_markers)

        # Clean text 
        return self.cleaner.clean(marked_text)
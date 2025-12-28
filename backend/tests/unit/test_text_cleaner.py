from backend.pdf.toc.text_cleaner import TextCleaner
from backend.pdf.toc.configuration import ToCConfiguration

def test_text_cleaner_removes_dots():
    config = ToCConfiguration()
    cleaner = TextCleaner(config)
    
    raw = "Chapter 1 ......................................... 5"
    cleaned = cleaner.clean(raw)
    assert "..." in cleaned
    assert "5" in cleaned

def test_text_cleaner_collapses_whitespace():
    config = ToCConfiguration()
    cleaner = TextCleaner(config)
    
    raw = "Title    with    spaces"
    cleaned = cleaner.clean(raw)
    assert cleaned == "Title with spaces"

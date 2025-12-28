from backend.pdf.toc.regex_checker import RegexChecker

def test_regex_checker_match():
    checker = RegexChecker(r"\d+", ignore_case=False)
    assert checker.match("123")
    assert not checker.match("abc")

def test_regex_checker_substitution():
    checker = RegexChecker(r"cat", ignore_case=True)
    result = checker.sub("dog", "My Cat is cute")
    assert result == "My dog is cute"

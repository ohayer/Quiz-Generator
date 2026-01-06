import re
from typing import Optional, Match

class RegexChecker:
    def __init__(self, pattern: str, ignore_case: bool = False):
        flags = re.IGNORECASE if ignore_case else 0
        self.regex = re.compile(pattern, flags)
    
    def sub(self, repl: str, string: str) -> str:
        return self.regex.sub(repl, string)

    def fullmatch(self, string: str) -> Optional[Match[str]]:
        return self.regex.fullmatch(string)

    def match(self, string: str) -> Optional[Match[str]]:
        return self.regex.match(string)

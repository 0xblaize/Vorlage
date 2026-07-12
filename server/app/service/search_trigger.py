"""Heuristic detector for "this transcript needs a web search."

Same shape as the "new project" voice command detector in voice.py: a small
set of explicit patterns run against the final transcript. Kept narrow on
purpose — false negatives (skip a search) are cheap, false positives
(searching on every mention of a proper noun) add latency and noise for no
benefit in a live voice session.
"""

import re

# Each pattern is tried independently (list, not one combined regex) because
# Python's re module forbids the same named group appearing in more than one
# alternation branch.
_SEARCH_PATTERNS = [
    re.compile(r"\bsearch (?:the web |online )?for (?P<query>.+)", re.IGNORECASE),
    re.compile(r"\blook up (?P<query>.+)", re.IGNORECASE),
    re.compile(r"\bgoogle (?P<query>.+)", re.IGNORECASE),
    re.compile(r"\bhow does (?P<query>.+?) (?:do it|work|structure|handle (?:this|it))\b", re.IGNORECASE),
    re.compile(r"\b(?:like|similar to|the way) (?P<query>.+?) (?:does it|handles it|does)\b", re.IGNORECASE),
]


def needs_web_search(transcript: str) -> str | None:
    """Return an extracted search query if the transcript asks for one, else None."""
    for pattern in _SEARCH_PATTERNS:
        match = pattern.search(transcript)
        if match:
            query = match.group("query")
            return query.strip(" .?!") if query else None
    return None

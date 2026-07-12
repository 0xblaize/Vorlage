"""Minimal Tavily search client — used to ground architecture generation.

Uses httpx directly (already a dependency) rather than pulling in a Tavily
SDK, since we only ever call one endpoint.
"""

from dataclasses import dataclass

import httpx

from app.config import settings

_SEARCH_URL = "https://api.tavily.com/search"


@dataclass
class SearchResult:
    title: str
    url: str
    snippet: str


async def web_search(query: str, max_results: int = 5) -> list[SearchResult]:
    """Run a Tavily search. Raises on network/API failure — callers decide
    whether a failed search should block or be skipped."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(
            _SEARCH_URL,
            headers={"Authorization": f"Bearer {settings.tavily_api_key}"},
            json={
                "query": query,
                "max_results": max_results,
                "include_answer": False,
            },
        )
    resp.raise_for_status()
    data = resp.json()
    return [
        SearchResult(
            title=r.get("title", ""),
            url=r.get("url", ""),
            snippet=r.get("content", ""),
        )
        for r in data.get("results", [])
    ]

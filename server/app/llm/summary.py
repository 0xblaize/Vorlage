"""LLM call that turns a finished session's graph into a SessionSummary.

Same JSON-mode + validate + single-retry pattern as app/llm/client.py's
generate_graph — reuses the existing LLMService (Gemini primary, Groq
fallback) rather than adding a new call path.
"""

import json

from pydantic import ValidationError

from app.llm.service import get_service
from app.schema.summary import SessionSummary
from app.schema.voice import GraphUpdate

_MAX_TOKENS = 2048
_MAX_TOKENS_RETRY = 4096

_SCHEMA_HINT = json.dumps(SessionSummary.model_json_schema(), indent=2)

_SYSTEM_PROMPT = f"""\
You are VORLAGE's documentation writer. Given a finished architecture \
diagram (nodes + edges), produce a structured write-up as JSON matching \
this schema:

```json
{_SCHEMA_HINT}
```

- OUTPUT ONLY VALID JSON. No markdown, no backticks, no prose outside the JSON.
- `node_insights` should cover the most important nodes (not necessarily all).
- Keep every list item short (one sentence).
- If the graph is empty or trivial, still return valid JSON with empty lists \
and a short summary saying so.
"""


async def generate_summary(graph: GraphUpdate) -> SessionSummary:
    service = get_service()
    messages: list[dict] = [
        {"role": "system", "content": _SYSTEM_PROMPT},
        {"role": "user", "content": f"GRAPH (JSON):\n{graph.model_dump_json()}"},
    ]

    completion = await service.complete(messages, max_tokens=_MAX_TOKENS, temperature=0.2)
    raw = completion.choices[0].message.content or ""

    try:
        return SessionSummary.model_validate_json(raw)
    except ValidationError as err:
        retry_messages = messages + [
            {"role": "assistant", "content": raw},
            {
                "role": "user",
                "content": (
                    f"Your previous response failed schema validation with:\n{err}\n\n"
                    "Return ONLY valid JSON matching the schema. No prose, no markdown."
                ),
            },
        ]
        retry = await service.complete(
            retry_messages, max_tokens=_MAX_TOKENS_RETRY, temperature=0.0
        )
        raw_retry = retry.choices[0].message.content or ""
        return SessionSummary.model_validate_json(raw_retry)

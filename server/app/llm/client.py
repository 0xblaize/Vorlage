"""LLM call via the Bad Theory Labs gateway (OpenAI-compatible).

Transcript + current canvas -> GraphUpdate. We use JSON mode and validate
the raw text with Pydantic. If parsing fails we retry once with a corrective
instruction that quotes the validation error back to the model.
"""

from openai import AsyncOpenAI
from pydantic import ValidationError

from app.config import settings
from app.llm.prompts import SYSTEM_PROMPT, build_user_prompt
from app.schema.voice import GraphUpdate

_client: AsyncOpenAI | None = None


def get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(
            api_key=settings.llm_api_key,
            base_url=settings.llm_base_url,
        )
    return _client


async def generate_graph(transcript: str, current: GraphUpdate) -> GraphUpdate:
    """Ask the LLM for the full updated canvas state."""
    client = get_client()
    user_prompt = build_user_prompt(transcript, current.model_dump_json())

    messages: list[dict] = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]

    completion = await client.chat.completions.create(
        model=settings.llm_model,
        messages=messages,
        response_format={"type": "json_object"},
        temperature=0.2,
    )
    raw = completion.choices[0].message.content or ""

    try:
        return GraphUpdate.model_validate_json(raw)
    except ValidationError as first_err:
        # One corrective retry: quote the validation error back to the model.
        retry_messages = messages + [
            {"role": "assistant", "content": raw},
            {
                "role": "user",
                "content": (
                    "Your previous response failed schema validation with:\n"
                    f"{first_err}\n\n"
                    "Return ONLY valid JSON matching the schema. No prose, no markdown."
                ),
            },
        ]
        retry = await client.chat.completions.create(
            model=settings.llm_model,
            messages=retry_messages,
            response_format={"type": "json_object"},
            temperature=0.0,
        )
        raw_retry = retry.choices[0].message.content or ""
        return GraphUpdate.model_validate_json(raw_retry)

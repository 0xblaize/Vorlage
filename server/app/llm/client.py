"""LLM call via the Bad Theory Labs gateway (OpenAI-compatible).

Transcript + current canvas -> GraphUpdate. We use JSON mode and validate
the raw text with Pydantic. If the first response is truncated
(`finish_reason == "length"`) or fails schema validation, we retry once
with a bigger token budget and a corrective instruction.
"""

from openai import AsyncOpenAI
from pydantic import ValidationError

from app.config import settings
from app.llm.prompts import SYSTEM_PROMPT, build_user_prompt
from app.schema.voice import GraphUpdate

# The graph is returned in full every turn. As the canvas grows the JSON
# does too, so we give the model plenty of room — truncated JSON is the
# most common failure mode.
_MAX_TOKENS = 4096
_MAX_TOKENS_RETRY = 8192

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
        max_tokens=_MAX_TOKENS,
    )
    raw = completion.choices[0].message.content or ""
    finish_reason = completion.choices[0].finish_reason

    # First try: if the response fit and validates, we're done.
    if finish_reason != "length":
        try:
            return GraphUpdate.model_validate_json(raw)
        except ValidationError as first_err:
            correction = (
                "Your previous response failed schema validation with:\n"
                f"{first_err}\n\n"
                "Return ONLY valid JSON matching the schema. No prose, no markdown."
            )
            return await _retry(client, messages, raw, correction)

    # Truncated: don't waste tokens quoting the broken JSON back, just
    # tell the model to be more concise and retry with a bigger budget.
    correction = (
        "Your previous response was cut off before the JSON was complete. "
        "Return the SAME graph but keep labels short and avoid any repetition. "
        "Output ONLY valid JSON matching the schema. No prose, no markdown."
    )
    return await _retry(client, messages, raw, correction)


async def _retry(
    client: AsyncOpenAI,
    messages: list[dict],
    prior_raw: str,
    correction: str,
) -> GraphUpdate:
    retry_messages = messages + [
        {"role": "assistant", "content": prior_raw},
        {"role": "user", "content": correction},
    ]
    retry = await client.chat.completions.create(
        model=settings.llm_model,
        messages=retry_messages,
        response_format={"type": "json_object"},
        temperature=0.0,
        max_tokens=_MAX_TOKENS_RETRY,
    )
    raw_retry = retry.choices[0].message.content or ""
    return GraphUpdate.model_validate_json(raw_retry)

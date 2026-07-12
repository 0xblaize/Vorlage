"""A single OpenAI-compatible LLM backend (Gemini, Groq, ...).

Wraps one `AsyncOpenAI` client bound to a provider's base URL/model so
`LLMService` can try several in order without knowing provider-specific
details.
"""

from dataclasses import dataclass

from openai import AsyncOpenAI
from openai.types.chat import ChatCompletion


@dataclass
class LLMProvider:
    name: str
    model: str
    client: AsyncOpenAI

    async def complete(
        self,
        messages: list[dict],
        *,
        max_tokens: int,
        temperature: float,
    ) -> ChatCompletion:
        return await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            response_format={"type": "json_object"},
            temperature=temperature,
            max_tokens=max_tokens,
        )

"""Provider-agnostic LLM entry point: Gemini first, Groq on failure.

Call sites never talk to a specific provider — they call `LLMService.complete`
and get back the first successful response. A provider without an API key
configured is skipped rather than attempted.
"""

import logging

import openai
from openai import AsyncOpenAI
from openai.types.chat import ChatCompletion

from app.config import settings
from app.llm.provider import LLMProvider

logger = logging.getLogger(__name__)

# Errors worth failing over on: rate limits, timeouts, quota, 5xx, connection
# issues. `openai.APIError` is the base class for all of these.
_FAILOVER_ERRORS = (openai.APIError,)


class LLMService:
    def __init__(self, providers: list[LLMProvider]):
        if not providers:
            raise ValueError("LLMService needs at least one configured provider")
        self.providers = providers

    async def complete(
        self,
        messages: list[dict],
        *,
        max_tokens: int,
        temperature: float,
    ) -> ChatCompletion:
        last_error: Exception | None = None
        for provider in self.providers:
            try:
                result = await provider.complete(
                    messages, max_tokens=max_tokens, temperature=temperature
                )
                if last_error is not None:
                    logger.info("llm: %s served request after fallback", provider.name)
                return result
            except _FAILOVER_ERRORS as exc:
                logger.warning("llm: %s failed (%s), trying next provider", provider.name, exc)
                last_error = exc
        raise last_error  # type: ignore[misc]


def _build_providers() -> list[LLMProvider]:
    providers = []
    if settings.gemini_api_key:
        providers.append(
            LLMProvider(
                name="gemini",
                model=settings.gemini_model,
                client=AsyncOpenAI(
                    api_key=settings.gemini_api_key, base_url=settings.gemini_base_url
                ),
            )
        )
    if settings.groq_api_key:
        providers.append(
            LLMProvider(
                name="groq",
                model=settings.groq_model,
                client=AsyncOpenAI(
                    api_key=settings.groq_api_key, base_url=settings.groq_base_url
                ),
            )
        )
    return providers


_service: LLMService | None = None


def get_service() -> LLMService:
    global _service
    if _service is None:
        _service = LLMService(_build_providers())
    return _service

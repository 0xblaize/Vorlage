"""Minimal Slack Web API wrapper — single hardcoded workspace bot token.

Uses httpx directly (already a dependency) rather than pulling in slack_sdk,
since we only ever call two endpoints for one workspace.
"""

import httpx

from app.config import settings

_BASE_URL = "https://slack.com/api"


async def post_message(
    channel: str,
    thread_ts: str | None,
    text: str,
    *,
    blocks: list[dict] | None = None,
) -> str:
    """Post a message (optionally threaded). Returns the message's ts."""
    payload: dict = {"channel": channel, "text": text}
    if thread_ts:
        payload["thread_ts"] = thread_ts
    if blocks:
        payload["blocks"] = blocks

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(
            f"{_BASE_URL}/chat.postMessage",
            headers={"Authorization": f"Bearer {settings.slack_bot_token}"},
            json=payload,
        )
    data = resp.json()
    if not data.get("ok"):
        raise RuntimeError(f"Slack chat.postMessage failed: {data.get('error')}")
    return data["ts"]


async def start_thread(channel: str, text: str) -> str:
    """Post the first message of a new thread. Returns its ts (== thread_ts)."""
    return await post_message(channel, None, text)

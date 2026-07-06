"""Phase 2 — streaming STT via Deepgram's realtime WebSocket API.

Audio chunks from the browser are forwarded as-is (Deepgram auto-detects
containerized formats like webm/opus from MediaRecorder). Transcripts come
back as partials (interim) and finals; finals are accumulated until
`speech_final` marks the end of the utterance.
"""

import asyncio
import json
import ssl
import urllib.parse
from collections.abc import Awaitable, Callable

import certifi
import websockets

from app.config import settings

DEEPGRAM_URL = "wss://api.deepgram.com/v1/listen"

# macOS python.org builds ship without system CA certs wired up; use certifi.
_SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())

# on_transcript(text, is_final)
TranscriptCallback = Callable[[str, bool], Awaitable[None]]


class DeepgramStream:
    """One live STT stream per connected client."""

    def __init__(self, on_transcript: TranscriptCallback) -> None:
        self._on_transcript = on_transcript
        self._ws: websockets.ClientConnection | None = None
        self._receiver_task: asyncio.Task | None = None
        self._final_segments: list[str] = []

    async def connect(self) -> None:
        params = urllib.parse.urlencode(
            {
                "model": settings.stt_model,
                "interim_results": "true",
                "smart_format": "true",
                "punctuate": "true",
            }
        )
        self._ws = await websockets.connect(
            f"{DEEPGRAM_URL}?{params}",
            additional_headers={
                "Authorization": f"Token {settings.deepgram_api_key}"
            },
            ssl=_SSL_CONTEXT,
        )
        print(f"Deepgram connected (model={settings.stt_model})")
        self._receiver_task = asyncio.create_task(self._receive_loop())

    async def send(self, chunk: bytes) -> None:
        assert self._ws is not None, "call connect() first"
        await self._ws.send(chunk)

    async def _receive_loop(self) -> None:
        assert self._ws is not None
        try:
            async for raw in self._ws:
                msg = json.loads(raw)
                if msg.get("type") != "Results":
                    print(f"Deepgram message: {raw[:300]}")
                    continue
                alt = msg["channel"]["alternatives"][0]
                text = alt["transcript"].strip()
                print(
                    f"Deepgram transcript (final={msg.get('is_final')}, "
                    f"speech_final={msg.get('speech_final')}): {text!r}"
                )

                if msg.get("is_final"):
                    if text:
                        self._final_segments.append(text)
                    if msg.get("speech_final") and self._final_segments:
                        utterance = " ".join(self._final_segments)
                        self._final_segments.clear()
                        await self._on_transcript(utterance, True)
                elif text:
                    # Interim partial — powers the ghost nodes.
                    await self._on_transcript(text, False)
        except websockets.ConnectionClosed as exc:
            print(f"Deepgram stream closed: code={exc.code} reason={exc.reason!r}")

    async def close(self) -> None:
        if self._ws is not None:
            try:
                await self._ws.send(json.dumps({"type": "CloseStream"}))
            except websockets.ConnectionClosed:
                pass
            await self._ws.close()
        if self._receiver_task is not None:
            self._receiver_task.cancel()

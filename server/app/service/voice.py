"""Logic for the /ws/voice route.

Pipeline: audio chunks -> Deepgram STT -> partial transcripts fire ghost
nodes; final transcripts go to the LLM -> GraphMessage back to the canvas.

Client -> server text frames (JSON):
  {"type": "transcript", "text": "..."}   # typed/manual input, runs the LLM
  {"type": "reset"}                        # clear the canvas
  {"type": "load", "canvas_id": 1}         # restore a saved canvas
A raw non-JSON string is treated as a final transcript (testing shortcut).
"""

import json
import re
import uuid

import websockets
from fastapi import WebSocket

from app.config import settings
from app.llm.client import generate_graph
from app.schema.voice import (
    ErrorMessage,
    GhostMessage,
    GraphMessage,
    GraphUpdate,
    NodeType,
    TranscriptMessage,
)
from app.search.tavily import web_search
from app.service import session as session_service
from app.service.ghost import detect_ghost_nodes
from app.service.search_trigger import needs_web_search
from app.service.stt import DeepgramStream

# Spoken phrases that mean "start a new project — throw away the current graph."
# Matched loosely against the final transcript (lowercased, punctuation stripped).
# Users won't say it verbatim, so we accept common paraphrases.
_NEW_PROJECT_PATTERNS = [
    r"\bthis is (a |an )?(another|new|different) project\b",
    r"\bnew project\b",
    r"\bstart (a |over with (a |an )?)?(new|another|different) (project|canvas|one)\b",
    r"\blet'?s start (over|fresh|a new one)\b",
    r"\bclear (the )?canvas\b",
    r"\breset (the )?canvas\b",
]
_NEW_PROJECT_RE = re.compile("|".join(_NEW_PROJECT_PATTERNS), re.IGNORECASE)


def _is_new_project_command(transcript: str) -> bool:
    normalised = re.sub(r"[^\w\s']", " ", transcript).strip()
    return bool(_NEW_PROJECT_RE.search(normalised))


class VoiceSession:
    """One connected client. Owns the STT stream and utterance state.

    ``session_id`` is set when this connection continues a session that
    already has a DB row — currently only true for Slack-originated sessions
    (see app/api/slack.py), where the row is created by the slash command
    handler before the link is ever opened. Plain browser sessions with no
    ``session_id`` stay in-memory only, matching prior behavior.
    """

    def __init__(
        self,
        websocket: WebSocket,
        user_id: str,
        session_id: uuid.UUID | None = None,
        slack_channel_id: str | None = None,
        slack_thread_ts: str | None = None,
        initial_graph: dict | None = None,
    ) -> None:
        self.websocket = websocket
        self.user_id = user_id
        self.session_id = session_id
        self.slack_channel_id = slack_channel_id
        self.slack_thread_ts = slack_thread_ts
        self.ghosted_types: set[NodeType] = set()
        self.audio_bytes_received = 0
        self.graph = (
            GraphUpdate.model_validate(initial_graph) if initial_graph else GraphUpdate()
        )
        self.stt: DeepgramStream | None = None
        self._last_posted_node_count = len(self.graph.nodes)
        self.slack_status_ts: str | None = None
        self.slack_status_state: str | None = None

    async def handle_audio_chunk(self, chunk: bytes) -> None:
        """Forward browser audio to the live Deepgram stream."""
        self.audio_bytes_received += len(chunk)

        if not settings.deepgram_api_key:
            print(
                f"Audio received ({len(chunk)} bytes, total "
                f"{self.audio_bytes_received}) — no DEEPGRAM_API_KEY, dropping"
            )
            return

        try:
            if self.stt is None:
                self.stt = DeepgramStream(self.on_transcript)
                await self.stt.connect()
            await self.stt.send(chunk)
        except websockets.ConnectionClosed as exc:
            # Deepgram idle-closes with 1000 after silence. Reconnect silently
            # on the next chunk; don't spam the client with a fake error.
            print(f"STT stream closed (code={exc.code}); will reconnect on next chunk")
            self.stt = None
        except Exception as exc:  # real STT failure — surface it, keep the WS alive
            print(f"STT error: {exc}")
            self.stt = None
            await self.websocket.send_text(
                ErrorMessage(detail=f"STT error: {exc}").model_dump_json()
            )

    async def handle_text(self, text: str) -> None:
        """JSON commands from the client; raw strings act as final transcripts."""
        try:
            msg = json.loads(text)
        except json.JSONDecodeError:
            await self.on_transcript(text, is_final=True)
            return

        match msg.get("type"):
            case "transcript":
                await self.on_transcript(
                    msg.get("text", ""), is_final=msg.get("is_final", True)
                )
            case "reset":
                self.graph = GraphUpdate()
                self.ghosted_types.clear()
                await self.websocket.send_text(
                    GraphMessage(data=self.graph).model_dump_json()
                )
            case "load":
                await self._load_canvas(msg.get("canvas_id"))
            case other:
                await self.websocket.send_text(
                    ErrorMessage(detail=f"unknown message type: {other!r}").model_dump_json()
                )

    async def _load_canvas(self, canvas_id: int | None) -> None:
        """Restore a saved canvas into this session and push it to the client."""
        from app.service.canvas import get_canvas  # avoid import cycle at module load

        if canvas_id is None:
            await self.websocket.send_text(
                ErrorMessage(detail="load requires canvas_id").model_dump_json()
            )
            return
        try:
            canvas = get_canvas(self.user_id, canvas_id)
        except KeyError:
            await self.websocket.send_text(
                ErrorMessage(detail="canvas not found").model_dump_json()
            )
            return
        except Exception as exc:
            await self.websocket.send_text(
                ErrorMessage(detail=f"load failed: {exc}").model_dump_json()
            )
            return
        self.graph = canvas.graph
        await self.websocket.send_text(
            GraphMessage(data=self.graph).model_dump_json()
        )

    async def on_transcript(self, transcript: str, is_final: bool) -> None:
        """Called for every STT transcript (partial and final)."""
        await self.websocket.send_text(
            TranscriptMessage(text=transcript, is_final=is_final).model_dump_json()
        )

        if not is_final:
            # Mirror the browser's "Listening" indicator in the Slack thread.
            await self._update_slack_status("listening", "🎤 Listening…")
            # Phase 3: fire instant ghost nodes off partial transcripts.
            ghosts = detect_ghost_nodes(transcript, self.ghosted_types)
            if ghosts:
                await self.websocket.send_text(
                    GhostMessage(nodes=ghosts).model_dump_json()
                )
            return

        # Final transcript: new utterance can re-ghost, then call the LLM.
        self.ghosted_types.clear()

        # Voice command: "this is another project" (and friends) wipes the
        # canvas so the next utterance starts a fresh graph instead of
        # extending the previous one.
        if _is_new_project_command(transcript):
            self.graph = GraphUpdate()
            await self.websocket.send_text(
                GraphMessage(data=self.graph).model_dump_json()
            )
            return

        if not settings.llm_configured:
            await self.websocket.send_text(
                ErrorMessage(detail="No LLM provider configured (GEMINI_API_KEY / GROQ_API_KEY)").model_dump_json()
            )
            return

        # Mirror the browser's "Processing" indicator now that speech has
        # stopped and we're about to call the LLM.
        await self._update_slack_status("processing", "⚙️ Processing…")

        search_context = await self._maybe_search(transcript)

        try:
            self.graph = await generate_graph(transcript, self.graph, search_context)
        except Exception as exc:  # LLM/network failure must not kill the socket
            print(f"LLM error: {exc}")
            await self._update_slack_status("error", f"⚠️ {exc}")
            await self.websocket.send_text(
                ErrorMessage(detail=f"LLM error: {exc}").model_dump_json()
            )
            return

        print(
            f"LLM graph: {len(self.graph.nodes)} nodes, "
            f"{len(self.graph.edges)} edges, "
            f"speech={self.graph.speech_payload[:80]!r}"
        )
        await self.websocket.send_text(
            GraphMessage(data=self.graph).model_dump_json()
        )

        if self.session_id is not None:
            session_service.update_graph(self.session_id, self.graph)
            await self._maybe_notify_slack_progress()

    async def _maybe_search(self, transcript: str) -> str | None:
        """Run a web search if the transcript asks for one; None on any failure.

        A failed/skipped search must never block graph generation, so this
        always degrades to no context rather than raising.
        """
        query = needs_web_search(transcript)
        if not query or not settings.search_configured:
            return None
        try:
            results = await web_search(query)
        except Exception as exc:  # search outage must not block the session
            print(f"Web search error: {exc}")
            return None
        if not results:
            return None
        return "\n".join(f"- {r.title} ({r.url}): {r.snippet[:300]}" for r in results)

    async def _maybe_notify_slack_progress(self) -> None:
        """Throttled live status update to the bound Slack thread — only on node-count change."""
        if not self.slack_channel_id or not self.slack_thread_ts:
            return
        node_count = len(self.graph.nodes)
        if node_count == self._last_posted_node_count:
            return
        self._last_posted_node_count = node_count
        await self._update_slack_status(
            "graph", f"🧩 architecture growing — {node_count} components so far"
        )

    async def _update_slack_status(self, state: str, text: str) -> None:
        """Edit a single live status message in the Slack thread in place.

        Mirrors the browser's Listening/Processing indicator instead of
        spamming the thread with a new message per state change. ``state``
        is a dedupe key (e.g. repeated "listening" calls on every interim
        transcript are no-ops); Slack hiccups here must never interrupt the
        voice session.
        """
        if not self.slack_channel_id or not self.slack_thread_ts:
            return
        if state == self.slack_status_state:
            return

        from app.slack.client import post_message, update_message  # avoid import cycle

        try:
            if self.slack_status_ts is None:
                self.slack_status_ts = await post_message(
                    self.slack_channel_id, self.slack_thread_ts, text
                )
            else:
                await update_message(self.slack_channel_id, self.slack_status_ts, text)
            self.slack_status_state = state
        except Exception as exc:  # Slack hiccups must not interrupt the session
            print(f"Slack status update failed: {exc}")

    async def close(self) -> None:
        print("Client disconnected")
        if self.stt is not None:
            await self.stt.close()
            self.stt = None
        if self.session_id is not None:
            session_service.mark_ended(self.session_id)
            await self._update_slack_status("complete", "✅ Architecture complete")
            await self._maybe_post_slack_summary()

    async def _maybe_post_slack_summary(self) -> None:
        if not self.slack_channel_id or not self.slack_thread_ts:
            return
        from app.slack.summary_post import post_session_summary  # avoid import cycle

        try:
            await post_session_summary(
                self.slack_channel_id, self.slack_thread_ts, self.graph
            )
        except Exception as exc:  # summary generation/posting must not crash close()
            print(f"Slack summary post failed: {exc}")

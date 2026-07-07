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
from app.service.ghost import detect_ghost_nodes
from app.service.stt import DeepgramStream


class VoiceSession:
    """One connected client. Owns the STT stream and utterance state."""

    def __init__(self, websocket: WebSocket, user_id: str) -> None:
        self.websocket = websocket
        self.user_id = user_id
        self.ghosted_types: set[NodeType] = set()
        self.audio_bytes_received = 0
        self.graph = GraphUpdate()  # current canvas state for this session
        self.stt: DeepgramStream | None = None

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
        except Exception as exc:  # STT failure must not kill the socket
            print(f"STT error: {exc}")
            self.stt = None  # reconnect on the next chunk
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
            # Phase 3: fire instant ghost nodes off partial transcripts.
            ghosts = detect_ghost_nodes(transcript, self.ghosted_types)
            if ghosts:
                await self.websocket.send_text(
                    GhostMessage(nodes=ghosts).model_dump_json()
                )
            return

        # Final transcript: new utterance can re-ghost, then call the LLM.
        self.ghosted_types.clear()

        if not settings.llm_api_key:
            await self.websocket.send_text(
                ErrorMessage(detail="LLM_API_KEY is not configured").model_dump_json()
            )
            return

        try:
            self.graph = await generate_graph(transcript, self.graph)
        except Exception as exc:  # LLM/network failure must not kill the socket
            print(f"LLM error: {exc}")
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

    async def close(self) -> None:
        print("Client disconnected")
        if self.stt is not None:
            await self.stt.close()
            self.stt = None

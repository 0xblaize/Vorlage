"""Route: /ws/voice — continuous audio in, JSON graph updates out."""

import uuid

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, status

from app.auth import verify_ws_token
from app.schema.voice import GraphMessage
from app.service import session as session_service
from app.service.voice import VoiceSession

router = APIRouter()


@router.websocket("/ws/voice")
async def voice_ws(websocket: WebSocket) -> None:
    token = websocket.query_params.get("token")
    try:
        user = await verify_ws_token(None, token)
    except HTTPException as exc:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason=exc.detail)
        return

    # Present only when this connection continues a Slack-originated session
    # (see app/api/slack.py) — the row (with its Slack binding) is created by
    # the slash command handler before the link is ever opened.
    raw_session_id = websocket.query_params.get("session_id")
    session_id = uuid.UUID(raw_session_id) if raw_session_id else None
    slack_channel_id: str | None = None
    slack_thread_ts: str | None = None
    initial_graph = None
    if session_id is not None:
        record = session_service.get_session(session_id)
        if record is not None:
            slack_channel_id = record.slack_channel_id
            slack_thread_ts = record.slack_thread_ts
            initial_graph = record.graph

    await websocket.accept()
    session = VoiceSession(
        websocket,
        user_id=user.id,
        session_id=session_id,
        slack_channel_id=slack_channel_id,
        slack_thread_ts=slack_thread_ts,
        initial_graph=initial_graph,
    )
    if initial_graph is not None:
        await websocket.send_text(GraphMessage(data=session.graph).model_dump_json())
    try:
        while True:
            message = await websocket.receive()
            if message["type"] == "websocket.disconnect":
                break
            if "bytes" in message and message["bytes"] is not None:
                await session.handle_audio_chunk(message["bytes"])
            elif "text" in message and message["text"] is not None:
                await session.handle_text(message["text"])
    except WebSocketDisconnect:
        pass
    finally:
        await session.close()

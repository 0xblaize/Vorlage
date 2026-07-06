"""Route: /ws/voice — continuous audio in, JSON graph updates out."""

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, status

from app.auth import verify_ws_token
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

    await websocket.accept()
    session = VoiceSession(websocket, user_id=user.id)
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

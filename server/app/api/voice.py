"""Route: /ws/voice — continuous audio in, JSON graph updates out."""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.service.voice import VoiceSession

router = APIRouter()


@router.websocket("/ws/voice")
async def voice_ws(websocket: WebSocket) -> None:
    await websocket.accept()
    session = VoiceSession(websocket)
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

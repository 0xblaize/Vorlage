"""Route: /slack/commands — slash command entry point (single workspace).

Slack can't join a channel and listen to live audio, so the slash command's
job is just to stand up a session record + Slack thread and hand back a link
to the live voice/canvas page. Everything after that happens in the browser
tab that opens the link (see app/api/voice.py's session_id query param).

Slack sends this as `application/x-www-form-urlencoded`, not JSON.
"""

import uuid
from urllib.parse import parse_qs

from fastapi import APIRouter, Depends, Request

from app.config import settings
from app.schema.voice import GraphUpdate
from app.service import session as session_service
from app.slack.client import start_thread
from app.slack.verify import verify_slack_request

router = APIRouter(prefix="/slack", tags=["slack"])


@router.post("/commands")
async def handle_command(request: Request, body: bytes = Depends(verify_slack_request)) -> dict:
    form = {k: v[0] for k, v in parse_qs(body.decode()).items()}
    channel_id = form.get("channel_id", settings.slack_default_channel)
    slack_user_id = form.get("user_id", "unknown")

    session_id = uuid.uuid4()
    thread_ts = await start_thread(
        channel_id, "🧠 Vorlage session started — open the link below to begin."
    )

    session_service.create_session(
        session_id,
        user_id=slack_user_id,
        graph=GraphUpdate(),
        slack_channel_id=channel_id,
        slack_thread_ts=thread_ts,
    )

    link = f"{settings.app_base_url}/session/{session_id}?slack=1"
    return {
        "response_type": "in_channel",
        "text": f"Vorlage session ready: {link}",
    }

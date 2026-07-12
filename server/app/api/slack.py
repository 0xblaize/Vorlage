"""Route: /slack/commands — slash command entry point (single workspace).

Slack can't join a channel and listen to live audio, so the slash command's
job is just to stand up a session record + Slack thread and hand back a link
to the live voice/canvas page. Everything after that happens in the browser
tab that opens the link (see app/api/voice.py's session_id query param).

Slack requires an ack within 3 seconds or it shows the user "the app did not
respond" — even if the request eventually succeeds. Starting a thread
(Slack API call) plus writing the session row (DB call) can occasionally
blow that budget, especially on a cold Railway/Neon connection. So we ack
immediately with `response_type: "in_channel"` and no text, do the real work
in a background task, then deliver the actual reply via `response_url`
(valid for 30 minutes, no timeout pressure).

Slack sends this as `application/x-www-form-urlencoded`, not JSON.
"""

import uuid
from urllib.parse import parse_qs

from fastapi import APIRouter, BackgroundTasks, Depends, Request

from app.config import settings
from app.schema.voice import GraphUpdate
from app.service import session as session_service
from app.slack.client import post_to_response_url, start_thread
from app.slack.verify import verify_slack_request

router = APIRouter(prefix="/slack", tags=["slack"])


async def _start_session_and_reply(
    channel_id: str, slack_user_id: str, response_url: str
) -> None:
    try:
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
        await post_to_response_url(response_url, f"Vorlage session ready: {link}")
    except Exception as exc:  # surface the failure to the user instead of silence
        print(f"Slack slash command failed: {exc}")
        try:
            await post_to_response_url(
                response_url, f"Couldn't start a Vorlage session: {exc}"
            )
        except Exception as follow_up_exc:
            print(f"Also failed to report the error back to Slack: {follow_up_exc}")


@router.post("/commands")
async def handle_command(
    background_tasks: BackgroundTasks,
    request: Request,
    body: bytes = Depends(verify_slack_request),
) -> dict:
    form = {k: v[0] for k, v in parse_qs(body.decode()).items()}
    channel_id = form.get("channel_id", settings.slack_default_channel)
    slack_user_id = form.get("user_id", "unknown")
    response_url = form.get("response_url", "")

    if response_url:
        background_tasks.add_task(
            _start_session_and_reply, channel_id, slack_user_id, response_url
        )

    return {"response_type": "in_channel", "text": "🧠 Starting your Vorlage session…"}

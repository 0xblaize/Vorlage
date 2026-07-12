"""Verify inbound Slack requests against the app's signing secret.

Slack signs every request with an HMAC-SHA256 over
``v0:{timestamp}:{raw_body}`` using the signing secret as the key
(https://api.slack.com/authentication/verifying-requests-from-slack).
"""

import hashlib
import hmac
import time

from fastapi import HTTPException, Request, status

from app.config import settings

_MAX_CLOCK_SKEW_SECONDS = 60 * 5


async def verify_slack_request(request: Request) -> bytes:
    """Validate signature + timestamp; return the raw body for the caller to parse."""
    if not settings.slack_configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Slack integration not configured",
        )

    timestamp = request.headers.get("X-Slack-Request-Timestamp")
    signature = request.headers.get("X-Slack-Signature")
    if not timestamp or not signature:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="missing Slack signature headers")

    if abs(time.time() - int(timestamp)) > _MAX_CLOCK_SKEW_SECONDS:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="stale Slack request timestamp")

    body = await request.body()
    basestring = b"v0:" + timestamp.encode() + b":" + body
    computed = "v0=" + hmac.new(
        settings.slack_signing_secret.encode(), basestring, hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(computed, signature):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid Slack signature")

    return body

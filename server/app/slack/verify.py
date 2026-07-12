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
        print(f"Slack verify: missing headers (timestamp={timestamp!r}, signature={signature!r})")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="missing Slack signature headers")

    skew = abs(time.time() - int(timestamp))
    if skew > _MAX_CLOCK_SKEW_SECONDS:
        print(f"Slack verify: stale timestamp (skew={skew:.0f}s, max={_MAX_CLOCK_SKEW_SECONDS}s)")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="stale Slack request timestamp")

    body = await request.body()
    basestring = b"v0:" + timestamp.encode() + b":" + body
    computed = "v0=" + hmac.new(
        settings.slack_signing_secret.encode(), basestring, hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(computed, signature):
        # Never log the signing secret or the valid signature — a one-way
        # fingerprint lets you confirm Railway's value matches Slack's
        # dashboard yourself without ever pasting the secret anywhere.
        fingerprint = hashlib.sha256(settings.slack_signing_secret.encode()).hexdigest()[:8]
        print(
            f"Slack verify: signature mismatch (secret configured: "
            f"{bool(settings.slack_signing_secret)}, secret length: "
            f"{len(settings.slack_signing_secret)}, secret fingerprint: {fingerprint}, "
            f"body length: {len(body)})"
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid Slack signature")

    return body

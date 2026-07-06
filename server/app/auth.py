"""Verify Neon Auth (Better Auth) JWTs on incoming requests.

Neon Auth signs its access tokens with a rotating JWKS. We fetch the JWKS
lazily, cache it in memory, and refresh on cache miss so key rotations don't
require a redeploy.

Better Auth JWTs don't set an `aud` claim by default, so we skip audience
verification and rely on the signature + `iss`/`sub` checks.
"""

from __future__ import annotations

import ssl
import time
from dataclasses import dataclass
from typing import Any

import certifi
import httpx
import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient, PyJWKClientError

from app.config import settings

_JWKS_CACHE: PyJWKClient | None = None
_JWKS_LOADED_AT: float = 0.0
_JWKS_TTL_SECONDS = 60 * 60  # refresh at most once per hour

# macOS python.org builds ship without system CA certs wired up; use certifi's
# bundle so JWKS fetches don't die with CERTIFICATE_VERIFY_FAILED.
_SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())


@dataclass(frozen=True)
class AuthUser:
    id: str  # Better Auth user id → mirrors neon_auth.users_sync.id
    email: str | None
    claims: dict[str, Any]


def _get_jwks_client() -> PyJWKClient:
    global _JWKS_CACHE, _JWKS_LOADED_AT
    now = time.time()
    if _JWKS_CACHE is not None and (now - _JWKS_LOADED_AT) < _JWKS_TTL_SECONDS:
        return _JWKS_CACHE
    if not settings.neon_auth_base_url:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="NEON_AUTH_BASE_URL not configured",
        )
    _JWKS_CACHE = PyJWKClient(
        settings.neon_auth_jwks_endpoint, cache_keys=True, ssl_context=_SSL_CONTEXT
    )
    _JWKS_LOADED_AT = now
    return _JWKS_CACHE


def _decode(token: str) -> dict[str, Any]:
    try:
        client = _get_jwks_client()
        signing_key = client.get_signing_key_from_jwt(token).key
        return jwt.decode(
            token,
            signing_key,
            algorithms=["ES256", "RS256", "EdDSA"],
            options={"verify_aud": False},
        )
    except (jwt.PyJWTError, PyJWKClientError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"invalid auth token: {exc}",
        )


def _to_user(claims: dict[str, Any]) -> AuthUser:
    sub = claims.get("sub")
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="token missing 'sub' claim",
        )
    return AuthUser(id=str(sub), email=claims.get("email"), claims=claims)


_bearer = HTTPBearer(auto_error=True)


def require_user(
    creds: HTTPAuthorizationCredentials = Depends(_bearer),
) -> AuthUser:
    """FastAPI dependency that validates the bearer JWT and returns the user."""
    return _to_user(_decode(creds.credentials))


async def verify_ws_token(request: Request | None, token: str | None) -> AuthUser:
    """Verify a JWT passed in the ``?token=...`` query string on the WS handshake."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="missing token",
        )
    return _to_user(_decode(token))


async def refresh_jwks() -> None:
    """Prewarm the JWKS cache — optional call during app startup."""
    global _JWKS_CACHE, _JWKS_LOADED_AT
    if not settings.neon_auth_base_url:
        return
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Fetching once populates the underlying cache when PyJWKClient reads it.
        await client.get(settings.neon_auth_jwks_endpoint)
    _JWKS_CACHE = PyJWKClient(
        settings.neon_auth_jwks_endpoint, cache_keys=True, ssl_context=_SSL_CONTEXT
    )
    _JWKS_LOADED_AT = time.time()

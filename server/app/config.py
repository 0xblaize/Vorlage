from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Single .env at the project root (app/config.py -> server -> repo root)
ROOT_ENV = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(ROOT_ENV), env_file_encoding="utf-8", extra="ignore")

    # LLM providers — both OpenAI-compatible. Gemini is primary, Groq is the
    # automatic fallback when Gemini errors (rate limit, timeout, quota, 5xx).
    gemini_api_key: str = ""
    gemini_base_url: str = "https://generativelanguage.googleapis.com/v1beta/openai/"
    # gemini-2.5-flash returns 404 "no longer available to new users" for some
    # accounts as of July 2026 even though Google's docs list an Oct 2026
    # retirement — flash-lite is the current stable alternative.
    gemini_model: str = "gemini-2.5-flash-lite"

    groq_api_key: str = ""
    groq_base_url: str = "https://api.groq.com/openai/v1"
    groq_model: str = "llama-3.3-70b-versatile"

    @property
    def llm_configured(self) -> bool:
        return bool(self.gemini_api_key or self.groq_api_key)

    # Speech-to-text (Deepgram)
    deepgram_api_key: str = ""
    stt_model: str = "nova-3"

    # CORS — localhost + deployed frontend
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Database (SQLAlchemy). Railway/Neon hand out `postgresql://...`; we
    # depend on psycopg3, so rewrite to the `+psycopg` dialect on the fly.
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/vorlage"

    # Neon Auth (Better Auth). Base URL is the Auth service origin + path
    # (e.g. https://ep-xxx.neonauth.<region>.aws.neon.tech/<db>/auth). JWKS
    # is derived as {base}/.well-known/jwks.json unless overridden.
    neon_auth_base_url: str = ""
    neon_auth_jwks_url: str = ""

    # Slack — single hardcoded workspace (no OAuth install flow). Bot token
    # scoped to chat:write; signing secret verifies inbound slash commands.
    slack_bot_token: str = ""
    slack_signing_secret: str = ""
    slack_default_channel: str = ""

    # Public URL of the deployed frontend, used to build the session link
    # posted back into Slack (e.g. https://vorlage.vercel.app).
    app_base_url: str = "http://localhost:3000"

    @property
    def slack_configured(self) -> bool:
        return bool(self.slack_bot_token and self.slack_signing_secret)

    @field_validator("database_url", mode="after")
    @classmethod
    def _normalize_pg_dialect(cls, v: str) -> str:
        if v.startswith("postgres://"):
            v = "postgresql://" + v[len("postgres://") :]
        if v.startswith("postgresql://"):
            v = "postgresql+psycopg://" + v[len("postgresql://") :]
        return v

    @property
    def neon_auth_jwks_endpoint(self) -> str:
        if self.neon_auth_jwks_url:
            return self.neon_auth_jwks_url
        base = self.neon_auth_base_url.rstrip("/")
        return f"{base}/.well-known/jwks.json"


settings = Settings()

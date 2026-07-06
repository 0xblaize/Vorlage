from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Single .env at the project root (app/config.py -> server -> repo root)
ROOT_ENV = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(ROOT_ENV), env_file_encoding="utf-8", extra="ignore")

    # LLM (Bad Theory Labs gateway — OpenAI-compatible)
    llm_api_key: str = ""
    llm_base_url: str = "https://api.badtheorylabs.com/v1"
    llm_model: str = "btl-2"

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

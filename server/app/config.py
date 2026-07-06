from pathlib import Path

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

    # CORS — Sam's localhost + Vercel URL
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Database (Phase 2+, alembic/sqlalchemy)
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/vorlage"


settings = Settings()

import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, Index, String, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from app.model.base import Base


class VoiceSessionRecord(Base):
    """A voice architecture session — live graph state plus optional Slack binding.

    ``user_id`` follows the same no-physical-FK convention as ``Canvas``
    (Neon Auth subject, synced asynchronously by Neon into a separate schema).
    """

    __tablename__ = "voice_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    slack_channel_id: Mapped[str | None] = mapped_column(String(32), nullable=True)
    slack_thread_ts: Mapped[str | None] = mapped_column(String(32), nullable=True)
    graph: Mapped[dict] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String(16), default="active")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("ix_voice_sessions_user_created", "user_id", "created_at"),
    )

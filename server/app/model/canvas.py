from datetime import datetime

from sqlalchemy import JSON, DateTime, Index, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.model.base import Base


class Canvas(Base):
    """A saved architecture diagram (the full GraphUpdate as JSON).

    ``user_id`` is the Neon Auth (Stack Auth) subject id — the same value
    Neon syncs into ``neon_auth.users_sync.id``. We don't declare a physical
    FK because the sync is asynchronous and the sync table lives in a
    separate schema managed by Neon.
    """

    __tablename__ = "canvases"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    name: Mapped[str] = mapped_column(String(120))
    graph: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    __table_args__ = (
        Index("ix_canvases_user_created", "user_id", "created_at"),
    )

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.model.session import VoiceSessionRecord


def create(
    db: Session,
    session_id: uuid.UUID,
    user_id: str,
    graph: dict,
    *,
    slack_channel_id: str | None = None,
    slack_thread_ts: str | None = None,
) -> VoiceSessionRecord:
    row = VoiceSessionRecord(
        id=session_id,
        user_id=user_id,
        graph=graph,
        slack_channel_id=slack_channel_id,
        slack_thread_ts=slack_thread_ts,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def get(db: Session, session_id: uuid.UUID) -> VoiceSessionRecord | None:
    return db.get(VoiceSessionRecord, session_id)


def update_graph(db: Session, session_id: uuid.UUID, graph: dict) -> VoiceSessionRecord | None:
    row = db.get(VoiceSessionRecord, session_id)
    if row is None:
        return None
    row.graph = graph
    db.commit()
    db.refresh(row)
    return row


def mark_ended(db: Session, session_id: uuid.UUID) -> VoiceSessionRecord | None:
    row = db.get(VoiceSessionRecord, session_id)
    if row is None:
        return None
    row.status = "ended"
    row.ended_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(row)
    return row


def list_for_user(db: Session, user_id: str) -> list[VoiceSessionRecord]:
    stmt = (
        select(VoiceSessionRecord)
        .where(VoiceSessionRecord.user_id == user_id)
        .order_by(VoiceSessionRecord.created_at.desc())
    )
    return list(db.scalars(stmt))

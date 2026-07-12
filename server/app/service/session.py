"""Logic backing voice sessions — persistence for VoiceSession and the Slack flow."""

import uuid

from app.model.base import SessionLocal
from app.model.session import VoiceSessionRecord
from app.repository import session as session_repo
from app.schema.voice import GraphUpdate


def create_session(
    session_id: uuid.UUID,
    user_id: str,
    graph: GraphUpdate,
    *,
    slack_channel_id: str | None = None,
    slack_thread_ts: str | None = None,
) -> VoiceSessionRecord:
    with SessionLocal() as db:
        return session_repo.create(
            db,
            session_id,
            user_id,
            graph.model_dump(),
            slack_channel_id=slack_channel_id,
            slack_thread_ts=slack_thread_ts,
        )


def get_session(session_id: uuid.UUID) -> VoiceSessionRecord | None:
    with SessionLocal() as db:
        return session_repo.get(db, session_id)


def update_graph(session_id: uuid.UUID, graph: GraphUpdate) -> VoiceSessionRecord | None:
    with SessionLocal() as db:
        return session_repo.update_graph(db, session_id, graph.model_dump())


def mark_ended(session_id: uuid.UUID) -> VoiceSessionRecord | None:
    with SessionLocal() as db:
        return session_repo.mark_ended(db, session_id)

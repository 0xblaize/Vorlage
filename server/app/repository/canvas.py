from sqlalchemy import select
from sqlalchemy.orm import Session

from app.model.canvas import Canvas


def create(db: Session, user_id: str, name: str, graph: dict) -> Canvas:
    canvas = Canvas(user_id=user_id, name=name, graph=graph)
    db.add(canvas)
    db.commit()
    db.refresh(canvas)
    return canvas


def get(db: Session, user_id: str, canvas_id: int) -> Canvas | None:
    row = db.get(Canvas, canvas_id)
    if row is None or row.user_id != user_id:
        return None
    return row


def list_for_user(db: Session, user_id: str) -> list[Canvas]:
    stmt = (
        select(Canvas)
        .where(Canvas.user_id == user_id)
        .order_by(Canvas.created_at.desc())
    )
    return list(db.scalars(stmt))


def delete(db: Session, user_id: str, canvas_id: int) -> bool:
    canvas = get(db, user_id, canvas_id)
    if canvas is None:
        return False
    db.delete(canvas)
    db.commit()
    return True

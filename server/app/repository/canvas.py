from sqlalchemy import select
from sqlalchemy.orm import Session

from app.model.canvas import Canvas


def create(db: Session, name: str, graph: dict) -> Canvas:
    canvas = Canvas(name=name, graph=graph)
    db.add(canvas)
    db.commit()
    db.refresh(canvas)
    return canvas


def get(db: Session, canvas_id: int) -> Canvas | None:
    return db.get(Canvas, canvas_id)


def list_all(db: Session) -> list[Canvas]:
    return list(db.scalars(select(Canvas).order_by(Canvas.created_at.desc())))


def delete(db: Session, canvas_id: int) -> bool:
    canvas = db.get(Canvas, canvas_id)
    if canvas is None:
        return False
    db.delete(canvas)
    db.commit()
    return True

"""Logic for the /canvas routes — save/load/list architecture diagrams."""

from app.model.base import SessionLocal
from app.repository import canvas as canvas_repo
from app.schema.canvas import CanvasCreate, CanvasRead
from app.schema.voice import GraphUpdate


def save_canvas(user_id: str, payload: CanvasCreate) -> CanvasRead:
    with SessionLocal() as db:
        row = canvas_repo.create(
            db, user_id, payload.name, payload.graph.model_dump()
        )
        return _to_read(row)


def get_canvas(user_id: str, canvas_id: int) -> CanvasRead:
    with SessionLocal() as db:
        row = canvas_repo.get(db, user_id, canvas_id)
        if row is None:
            raise KeyError(f"canvas {canvas_id} not found")
        return _to_read(row)


def list_canvases(user_id: str) -> list[CanvasRead]:
    with SessionLocal() as db:
        return [_to_read(row) for row in canvas_repo.list_for_user(db, user_id)]


def delete_canvas(user_id: str, canvas_id: int) -> bool:
    with SessionLocal() as db:
        return canvas_repo.delete(db, user_id, canvas_id)


def _to_read(row) -> CanvasRead:
    return CanvasRead(
        id=row.id,
        name=row.name,
        graph=GraphUpdate.model_validate(row.graph),
        created_at=row.created_at,
    )

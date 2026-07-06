"""Routes: /canvas — REST CRUD for saved diagrams, scoped to the caller."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError

from app.auth import AuthUser, require_user
from app.schema.canvas import CanvasCreate, CanvasRead
from app.service import canvas as canvas_service

router = APIRouter(prefix="/canvas", tags=["canvas"])


@router.post("", response_model=CanvasRead, status_code=201)
def save_canvas(
    payload: CanvasCreate,
    user: AuthUser = Depends(require_user),
) -> CanvasRead:
    try:
        return canvas_service.save_canvas(user.id, payload)
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=503, detail=f"database unavailable: {exc}")


@router.get("", response_model=list[CanvasRead])
def list_canvases(
    user: AuthUser = Depends(require_user),
) -> list[CanvasRead]:
    try:
        return canvas_service.list_canvases(user.id)
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=503, detail=f"database unavailable: {exc}")


@router.get("/{canvas_id}", response_model=CanvasRead)
def get_canvas(
    canvas_id: int,
    user: AuthUser = Depends(require_user),
) -> CanvasRead:
    try:
        return canvas_service.get_canvas(user.id, canvas_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="canvas not found")
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=503, detail=f"database unavailable: {exc}")


@router.delete("/{canvas_id}", status_code=204)
def delete_canvas(
    canvas_id: int,
    user: AuthUser = Depends(require_user),
) -> None:
    try:
        if not canvas_service.delete_canvas(user.id, canvas_id):
            raise HTTPException(status_code=404, detail="canvas not found")
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=503, detail=f"database unavailable: {exc}")

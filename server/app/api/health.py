"""Route: /health — liveness check for Render/Railway and the frontend."""

from fastapi import APIRouter

from app.schema.voice import NodeType

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}


@router.get("/node-types")
def node_types() -> list[str]:
    """The node types the canvas must support (contract helper for Sam)."""
    return [t.value for t in NodeType]

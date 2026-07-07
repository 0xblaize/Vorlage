"""Route: /health — liveness check for Render/Railway and the frontend."""

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}


# Suggested node types per domain — the LLM is free to invent others. The
# frontend has a keyword-based icon fallback for anything not in this list.
_SUGGESTED_TYPES = [
    # software
    "api_gateway", "backend_service", "postgres_db", "s3_bucket",
    "cache", "queue", "load_balancer",
    # car
    "engine", "chassis", "wheel", "transmission", "battery", "fuel_tank",
    # building
    "foundation", "wall", "roof", "floor", "column", "beam", "window", "door",
    # project / activity
    "milestone", "task", "phase", "deliverable", "decision",
]


@router.get("/node-types")
def node_types() -> list[str]:
    """Suggested node types across domains. Not an exhaustive list."""
    return _SUGGESTED_TYPES

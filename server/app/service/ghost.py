"""Phase 3 — lightweight keyword detector for optimistic "ghost" nodes.

Runs on every *partial* transcript. If it spots an architecture keyword it
fires a ghost payload instantly, long before the LLM responds.
"""

import re
from itertools import count

from app.schema.voice import CanvasNode, NodeStatus, NodeType, Position

# keyword pattern -> node type
_KEYWORDS: list[tuple[re.Pattern[str], NodeType]] = [
    (re.compile(r"\b(database|postgres|db)\b", re.I), NodeType.postgres_db),
    (re.compile(r"\b(gateway|api gateway)\b", re.I), NodeType.api_gateway),
    (re.compile(r"\b(bucket|s3|storage)\b", re.I), NodeType.s3_bucket),
    (re.compile(r"\b(cache|redis)\b", re.I), NodeType.cache),
    (re.compile(r"\b(queue|kafka|rabbit)\b", re.I), NodeType.queue),
    (re.compile(r"\b(load balancer|balancer)\b", re.I), NodeType.load_balancer),
    (re.compile(r"\b(backend|service|server)\b", re.I), NodeType.backend_service),
]

_ghost_ids = count(1)


def detect_ghost_nodes(partial_transcript: str, already_seen: set[NodeType]) -> list[CanvasNode]:
    """Return ghost nodes for keywords not already ghosted in this utterance."""
    ghosts: list[CanvasNode] = []
    for pattern, node_type in _KEYWORDS:
        if node_type in already_seen:
            continue
        if pattern.search(partial_transcript):
            already_seen.add(node_type)
            ghosts.append(
                CanvasNode(
                    id=f"ghost_{node_type.value}_{next(_ghost_ids)}",
                    type=node_type,
                    label=node_type.value.replace("_", " ").title(),
                    position=Position(x=0, y=0),  # frontend places ghosts near cursor/center
                    status=NodeStatus.ghost,
                )
            )
    return ghosts

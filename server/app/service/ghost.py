"""Phase 3 — lightweight keyword detector for optimistic "ghost" nodes.

Runs on every *partial* transcript. If it spots a structural keyword from any
supported domain (software, car, building, project/activity, org, generic),
it fires a ghost payload instantly, long before the LLM responds.

The LLM later replaces ghosts with the authoritative graph and can invent
node types outside this list; ghosts are just the fast-path preview.
"""

import re
from itertools import count

from app.schema.voice import CanvasNode, NodeStatus, NodeType, Position

# (pattern, node_type slug). Order matters — first match wins per utterance.
_KEYWORDS: list[tuple[re.Pattern[str], NodeType]] = [
    # ---- software architecture ----
    (re.compile(r"\b(database|postgres|db|mysql|sqlite|mongo)\b", re.I), "postgres_db"),
    (re.compile(r"\b(gateway|api gateway|api)\b", re.I), "api_gateway"),
    (re.compile(r"\b(bucket|s3|storage|object storage)\b", re.I), "s3_bucket"),
    (re.compile(r"\b(cache|redis|memcached)\b", re.I), "cache"),
    (re.compile(r"\b(queue|kafka|rabbit|rabbitmq|sqs)\b", re.I), "queue"),
    (re.compile(r"\b(load balancer|balancer|nginx)\b", re.I), "load_balancer"),
    (re.compile(r"\b(backend|service|server|microservice)\b", re.I), "backend_service"),

    # ---- car / vehicle ----
    (re.compile(r"\bengine\b", re.I), "engine"),
    (re.compile(r"\b(chassis|frame)\b", re.I), "chassis"),
    (re.compile(r"\b(wheel|wheels|tire|tyre)\b", re.I), "wheel"),
    (re.compile(r"\b(transmission|gearbox)\b", re.I), "transmission"),
    (re.compile(r"\bbattery\b", re.I), "battery"),
    (re.compile(r"\b(fuel tank|gas tank)\b", re.I), "fuel_tank"),
    (re.compile(r"\b(brake|brakes)\b", re.I), "brake"),
    (re.compile(r"\b(suspension|shock)\b", re.I), "suspension"),
    (re.compile(r"\b(exhaust|muffler)\b", re.I), "exhaust"),
    (re.compile(r"\b(steering|steering wheel)\b", re.I), "steering"),

    # ---- building / architecture (physical) ----
    (re.compile(r"\b(foundation|footing)\b", re.I), "foundation"),
    (re.compile(r"\b(wall|walls)\b", re.I), "wall"),
    (re.compile(r"\b(roof|rooftop)\b", re.I), "roof"),
    (re.compile(r"\b(floor|floors|slab)\b", re.I), "floor"),
    (re.compile(r"\b(column|pillar)\b", re.I), "column"),
    (re.compile(r"\b(beam|girder)\b", re.I), "beam"),
    (re.compile(r"\b(window|windows)\b", re.I), "window"),
    (re.compile(r"\b(door|doors|entrance)\b", re.I), "door"),
    (re.compile(r"\b(staircase|stairs|stairway)\b", re.I), "staircase"),
    (re.compile(r"\b(elevator|lift)\b", re.I), "elevator"),
    (re.compile(r"\b(basement|cellar)\b", re.I), "basement"),

    # ---- project / activity / workflow ----
    (re.compile(r"\b(milestone|milestones)\b", re.I), "milestone"),
    (re.compile(r"\b(task|tasks|todo)\b", re.I), "task"),
    (re.compile(r"\b(phase|stage|sprint)\b", re.I), "phase"),
    (re.compile(r"\b(deliverable|artifact)\b", re.I), "deliverable"),
    (re.compile(r"\b(decision|decide)\b", re.I), "decision"),
    (re.compile(r"\b(review|approval)\b", re.I), "review"),

    # ---- org / people ----
    (re.compile(r"\b(team|department)\b", re.I), "team"),
    (re.compile(r"\b(manager|lead)\b", re.I), "manager"),
    (re.compile(r"\b(user|customer|client)\b", re.I), "user"),
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
                    id=f"ghost_{node_type}_{next(_ghost_ids)}",
                    type=node_type,
                    label=node_type.replace("_", " ").title(),
                    position=Position(x=0, y=0),  # frontend places ghosts near cursor/center
                    status=NodeStatus.ghost,
                )
            )
    return ghosts

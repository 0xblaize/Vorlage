"""vorlage_schema — the JSON contract between the backend and the React Flow canvas.

Every message sent down the WebSocket is a `ServerMessage`. The frontend
switches on `type` to decide how to update the Zustand store.
"""

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field

# NodeType is a free-form snake_case slug chosen by the LLM per detected
# domain — e.g. "api_gateway", "engine", "wheel", "wall", "foundation",
# "milestone", "task". The canvas renders known types with dedicated icons
# and falls back to a generic box for unknown types.
NodeType = str


class NodeStatus(str, Enum):
    solid = "solid"   # confirmed by the LLM
    ghost = "ghost"   # optimistic preview from the keyword detector


class Position(BaseModel):
    x: float
    y: float


class CanvasNode(BaseModel):
    id: str = Field(description="Stable slug id, e.g. 'postgres_db_1'")
    type: NodeType
    label: str = Field(description="Human-friendly display name, e.g. 'Users DB'")
    position: Position
    status: NodeStatus = NodeStatus.solid


class CanvasEdge(BaseModel):
    id: str
    source: str = Field(description="Source node id")
    target: str = Field(description="Target node id")
    label: str | None = None


# ---------------------------------------------------------------------------
# LLM structured output
# ---------------------------------------------------------------------------

class GraphUpdate(BaseModel):
    """What GPT-4o must return: the full desired state of the canvas."""

    nodes: list[CanvasNode] = Field(default_factory=list)
    edges: list[CanvasEdge] = Field(default_factory=list)
    highlight_nodes: list[str] = Field(
        default_factory=list,
        description="Node ids to highlight in Analysis Mode (e.g. bottlenecks)",
    )
    speech_payload: str = Field(
        default="",
        description="Short spoken/displayed explanation for analysis answers",
    )


# ---------------------------------------------------------------------------
# WebSocket messages (server -> client)
# ---------------------------------------------------------------------------

class TranscriptMessage(BaseModel):
    type: Literal["transcript"] = "transcript"
    text: str
    is_final: bool


class GhostMessage(BaseModel):
    type: Literal["ghost"] = "ghost"
    nodes: list[CanvasNode]


class GraphMessage(BaseModel):
    type: Literal["graph"] = "graph"
    data: GraphUpdate


class ErrorMessage(BaseModel):
    type: Literal["error"] = "error"
    detail: str


ServerMessage = TranscriptMessage | GhostMessage | GraphMessage | ErrorMessage

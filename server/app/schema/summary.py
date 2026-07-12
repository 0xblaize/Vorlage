"""Structured write-up generated from a finished session's graph."""

from pydantic import BaseModel, Field


class NodeInsight(BaseModel):
    node_id: str = Field(description="Matches a CanvasNode.id from the session graph")
    why: str = Field(description="One sentence: why this component exists")


class SessionSummary(BaseModel):
    summary: str = Field(description="One paragraph overview of the architecture discussed")
    node_insights: list[NodeInsight] = Field(default_factory=list)
    security_recommendations: list[str] = Field(default_factory=list)
    scaling_recommendations: list[str] = Field(default_factory=list)
    missing_components: list[str] = Field(default_factory=list)
    action_items: list[str] = Field(default_factory=list)

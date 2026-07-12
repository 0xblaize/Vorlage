"""Render a GraphUpdate as a Mermaid flowchart definition."""

import re

from app.schema.voice import GraphUpdate

_SAFE_ID_RE = re.compile(r"[^a-zA-Z0-9_]")


def _safe_id(node_id: str) -> str:
    """Mermaid node ids can't contain most punctuation — sanitize ours."""
    return _SAFE_ID_RE.sub("_", node_id)


def graph_to_mermaid(graph: GraphUpdate) -> str:
    lines = ["graph TD"]
    for node in graph.nodes:
        label = node.label.replace('"', "'")
        lines.append(f'    {_safe_id(node.id)}["{label}"]')
    for edge in graph.edges:
        source = _safe_id(edge.source)
        target = _safe_id(edge.target)
        if edge.label:
            label = edge.label.replace('"', "'")
            lines.append(f'    {source} -->|"{label}"| {target}')
        else:
            lines.append(f"    {source} --> {target}")
    return "\n".join(lines)

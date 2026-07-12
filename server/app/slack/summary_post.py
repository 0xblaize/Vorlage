"""Compose and post the end-of-session write-up into the bound Slack thread.

Called from VoiceSession.close() once a session with a Slack binding ends.
Produces one message: Markdown summary + insights/recommendations, a Mermaid
fenced code block, and a JSON fenced code block (small enough for a demo
graph — no file upload needed).
"""

import json

from app.export.mermaid import graph_to_mermaid
from app.llm.summary import generate_summary
from app.schema.voice import GraphUpdate
from app.slack.client import post_message


def _format_summary_text(summary, mermaid: str, graph_json: str) -> str:
    lines = [f"*Architecture summary*\n{summary.summary}"]

    if summary.node_insights:
        lines.append("\n*Why each component exists*")
        lines += [f"• `{i.node_id}` — {i.why}" for i in summary.node_insights]

    if summary.security_recommendations:
        lines.append("\n*Security recommendations*")
        lines += [f"• {r}" for r in summary.security_recommendations]

    if summary.scaling_recommendations:
        lines.append("\n*Scaling recommendations*")
        lines += [f"• {r}" for r in summary.scaling_recommendations]

    if summary.missing_components:
        lines.append("\n*Missing components*")
        lines += [f"• {m}" for m in summary.missing_components]

    if summary.action_items:
        lines.append("\n*Action items*")
        lines += [f"• {a}" for a in summary.action_items]

    lines.append(f"\n*Mermaid*\n```mermaid\n{mermaid}\n```")
    lines.append(f"\n*Graph JSON*\n```json\n{graph_json}\n```")

    return "\n".join(lines)


async def post_session_summary(channel: str, thread_ts: str, graph: GraphUpdate) -> None:
    summary = await generate_summary(graph)
    mermaid = graph_to_mermaid(graph)
    graph_json = json.dumps(graph.model_dump(), indent=2)

    text = _format_summary_text(summary, mermaid, graph_json)
    await post_message(channel, thread_ts, text)

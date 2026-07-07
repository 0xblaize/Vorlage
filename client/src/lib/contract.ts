// Mirrors server/app/schema/voice.py — keep in sync.
//
// NodeType is a free-form snake_case slug picked by the LLM per detected
// domain (software, car, building, project, etc.). The renderer maps known
// types to dedicated icons and falls back to a keyword-based guess, then a
// generic box.
export type NodeType = string;

export type NodeStatus = 'solid' | 'ghost';

export interface Position {
  x: number;
  y: number;
}

export interface CanvasNode {
  id: string;
  type: NodeType;
  label: string;
  position: Position;
  status: NodeStatus;
}

export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
  label?: string | null;
}

export interface GraphUpdate {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  highlight_nodes: string[];
  speech_payload: string;
}

export interface TranscriptMessage {
  type: 'transcript';
  text: string;
  is_final: boolean;
}

export interface GhostMessage {
  type: 'ghost';
  nodes: CanvasNode[];
}

export interface GraphMessage {
  type: 'graph';
  data: GraphUpdate;
}

export interface ErrorMessage {
  type: 'error';
  detail: string;
}

export type ServerMessage =
  | TranscriptMessage
  | GhostMessage
  | GraphMessage
  | ErrorMessage;

export type ClientMessage =
  | { type: 'transcript'; text: string; is_final?: boolean }
  | { type: 'reset' }
  | { type: 'load'; canvas_id: number };

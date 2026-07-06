import { create } from 'zustand';
import type { CanvasEdge, CanvasNode, GraphUpdate } from '../lib/contract';

export type ConnectionStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error';

interface TranscriptState {
  partial: string;
  final: string;
}

interface CanvasState {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  highlightIds: string[];
  speechPayload: string;

  transcript: TranscriptState;
  connection: ConnectionStatus;
  lastError: string | null;
  isRecording: boolean;

  applyGraph: (graph: GraphUpdate) => void;
  applyGhosts: (nodes: CanvasNode[]) => void;
  setTranscript: (text: string, isFinal: boolean) => void;
  setConnection: (status: ConnectionStatus) => void;
  setRecording: (on: boolean) => void;
  setError: (detail: string | null) => void;
  reset: () => void;
}

const emptyGraph = { nodes: [], edges: [], highlightIds: [], speechPayload: '' };

export const useCanvasStore = create<CanvasState>((set) => ({
  ...emptyGraph,
  transcript: { partial: '', final: '' },
  connection: 'idle',
  lastError: null,
  isRecording: false,

  applyGraph: (graph) =>
    set(() => ({
      nodes: graph.nodes,
      edges: graph.edges,
      highlightIds: graph.highlight_nodes,
      speechPayload: graph.speech_payload,
    })),

  applyGhosts: (ghosts) =>
    set((s) => {
      const existingIds = new Set(s.nodes.map((n) => n.id));
      const fresh = ghosts.filter((g) => !existingIds.has(g.id));
      if (fresh.length === 0) return {};
      return { nodes: [...s.nodes, ...fresh] };
    }),

  setTranscript: (text, isFinal) =>
    set((s) => ({
      transcript: isFinal
        ? { partial: '', final: text }
        : { partial: text, final: s.transcript.final },
    })),

  setConnection: (connection) => set({ connection }),
  setRecording: (isRecording) => set({ isRecording }),
  setError: (lastError) => set({ lastError }),

  reset: () =>
    set({
      ...emptyGraph,
      transcript: { partial: '', final: '' },
      lastError: null,
    }),
}));

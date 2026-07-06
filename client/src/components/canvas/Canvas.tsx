import { useMemo } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  type Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useCanvasStore } from '../../store/canvasStore';
import { ArchitectureNode, type ArchitectureNodeData } from './ArchitectureNode';

const NODE_TYPES = { architecture: ArchitectureNode };

export function Canvas() {
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const highlightIds = useCanvasStore((s) => s.highlightIds);

  const highlightSet = useMemo(() => new Set(highlightIds), [highlightIds]);

  const rfNodes = useMemo<Node<ArchitectureNodeData>[]>(
    () =>
      nodes.map((n) => ({
        id: n.id,
        type: 'architecture',
        position: { x: n.position.x, y: n.position.y },
        data: {
          label: n.label,
          nodeType: n.type,
          status: n.status,
          highlighted: highlightSet.has(n.id),
        },
      })),
    [nodes, highlightSet],
  );

  const rfEdges = useMemo<Edge[]>(
    () =>
      edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label ?? undefined,
        animated: true,
        style: { stroke: 'rgba(148, 163, 184, 0.6)', strokeWidth: 1.5 },
      })),
    [edges],
  );

  return (
    <div className="w-full h-full bg-[#0a0f18]">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.4 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.25}
        maxZoom={2}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgba(148, 163, 184, 0.15)"
        />
        <Controls
          className="!bg-[#0d131f] !border-white/10 !text-slate-200"
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
}

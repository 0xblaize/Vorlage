import { memo } from 'react';
import { Handle, Position as RFPosition } from 'reactflow';
import {
  Database,
  Server,
  Globe,
  HardDrive,
  Zap,
  Layers,
  Shuffle,
  Box,
} from 'lucide-react';
import type { NodeStatus, NodeType } from '../../lib/contract';

const ICONS: Record<NodeType, typeof Database> = {
  api_gateway: Globe,
  backend_service: Server,
  postgres_db: Database,
  s3_bucket: HardDrive,
  cache: Zap,
  queue: Layers,
  load_balancer: Shuffle,
};

const ACCENTS: Record<NodeType, string> = {
  api_gateway: 'text-sky-300 border-sky-400/60',
  backend_service: 'text-emerald-300 border-emerald-400/60',
  postgres_db: 'text-purple-300 border-purple-400/60',
  s3_bucket: 'text-amber-300 border-amber-400/60',
  cache: 'text-rose-300 border-rose-400/60',
  queue: 'text-indigo-300 border-indigo-400/60',
  load_balancer: 'text-teal-300 border-teal-400/60',
};

export interface ArchitectureNodeData {
  label: string;
  nodeType: NodeType;
  status: NodeStatus;
  highlighted: boolean;
}

function ArchitectureNodeInner({ data }: { data: ArchitectureNodeData }) {
  const Icon = ICONS[data.nodeType] ?? Box;
  const accent = ACCENTS[data.nodeType] ?? 'text-slate-300 border-white/20';
  const ghost = data.status === 'ghost';

  return (
    <div
      className={[
        'relative rounded-2xl border bg-[#0d131f]/90 backdrop-blur-md px-4 py-3 min-w-[168px]',
        'flex items-center gap-3 shadow-lg transition-all duration-300',
        accent,
        ghost ? 'opacity-50 border-dashed animate-pulse' : 'opacity-100',
        data.highlighted ? 'ring-2 ring-indigo-400 shadow-indigo-500/40' : '',
      ].join(' ')}
    >
      <Handle
        type="target"
        position={RFPosition.Top}
        className="!bg-white/40 !border-none !w-2 !h-2"
      />
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-white/5 border ${accent}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-slate-500">
          {data.nodeType.replace(/_/g, ' ')}
        </span>
        <span className="text-sm font-semibold text-slate-100 leading-tight">
          {data.label}
        </span>
      </div>
      <Handle
        type="source"
        position={RFPosition.Bottom}
        className="!bg-white/40 !border-none !w-2 !h-2"
      />
    </div>
  );
}

export const ArchitectureNode = memo(ArchitectureNodeInner);

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
  Car,
  Cog,
  CircleDot,
  Fuel,
  BatteryCharging,
  Building2,
  Home,
  DoorOpen,
  AppWindow,
  Milestone,
  ListChecks,
  GitBranch,
  Users,
  User,
  Wrench,
  Wind,
  Anchor,
  type LucideIcon,
} from 'lucide-react';
import type { NodeStatus, NodeType } from '../../lib/contract';

// Exact-match icons for well-known types. Fallback logic below handles
// anything the LLM invents.
const ICONS: Record<string, LucideIcon> = {
  // software
  api_gateway: Globe,
  backend_service: Server,
  postgres_db: Database,
  s3_bucket: HardDrive,
  cache: Zap,
  queue: Layers,
  load_balancer: Shuffle,
  // car
  engine: Cog,
  chassis: Car,
  wheel: CircleDot,
  transmission: Cog,
  battery: BatteryCharging,
  fuel_tank: Fuel,
  brake: CircleDot,
  suspension: Wrench,
  exhaust: Wind,
  steering: CircleDot,
  // building
  foundation: Anchor,
  wall: Building2,
  roof: Home,
  floor: Building2,
  column: Building2,
  beam: Building2,
  window: AppWindow,
  door: DoorOpen,
  staircase: Building2,
  elevator: Building2,
  basement: Building2,
  // project / activity
  milestone: Milestone,
  task: ListChecks,
  phase: GitBranch,
  deliverable: ListChecks,
  decision: GitBranch,
  review: ListChecks,
  // org
  team: Users,
  manager: User,
  user: User,
};

const ACCENTS: Record<string, string> = {
  api_gateway: 'text-sky-300 border-sky-400/60',
  backend_service: 'text-emerald-300 border-emerald-400/60',
  postgres_db: 'text-purple-300 border-purple-400/60',
  s3_bucket: 'text-amber-300 border-amber-400/60',
  cache: 'text-rose-300 border-rose-400/60',
  queue: 'text-indigo-300 border-indigo-400/60',
  load_balancer: 'text-teal-300 border-teal-400/60',
};

// Cheap fallback: pick an icon by scanning the slug for a keyword.
function pickIcon(nodeType: NodeType): LucideIcon {
  const exact = ICONS[nodeType];
  if (exact) return exact;
  const t = nodeType.toLowerCase();
  if (/(engine|motor|gear|transmission)/.test(t)) return Cog;
  if (/(car|vehicle|chassis|frame)/.test(t)) return Car;
  if (/(wheel|tire|tyre|brake)/.test(t)) return CircleDot;
  if (/(fuel|gas|tank)/.test(t)) return Fuel;
  if (/(battery|power|charge)/.test(t)) return BatteryCharging;
  if (/(wall|floor|column|beam|basement|elevator|stair)/.test(t)) return Building2;
  if (/(roof|house|home)/.test(t)) return Home;
  if (/(door|entrance|exit)/.test(t)) return DoorOpen;
  if (/window/.test(t)) return AppWindow;
  if (/(foundation|footing|anchor)/.test(t)) return Anchor;
  if (/(milestone|goal)/.test(t)) return Milestone;
  if (/(task|todo|checklist|deliverable|review)/.test(t)) return ListChecks;
  if (/(phase|stage|sprint|decision|branch)/.test(t)) return GitBranch;
  if (/(team|group|department)/.test(t)) return Users;
  if (/(user|person|manager|engineer|lead)/.test(t)) return User;
  if (/(db|database|postgres|mysql|mongo|sqlite)/.test(t)) return Database;
  if (/(server|service|backend|api|worker)/.test(t)) return Server;
  if (/(cache|redis)/.test(t)) return Zap;
  if (/(queue|kafka|rabbit|sqs)/.test(t)) return Layers;
  if (/(bucket|storage|s3)/.test(t)) return HardDrive;
  if (/(balancer|nginx|cdn)/.test(t)) return Shuffle;
  if (/(gateway|globe|internet)/.test(t)) return Globe;
  return Box;
}

function pickAccent(nodeType: NodeType): string {
  const exact = ACCENTS[nodeType];
  if (exact) return exact;
  const t = nodeType.toLowerCase();
  if (/(engine|motor|gear|transmission|chassis|car|vehicle|wheel|tire|brake|fuel|battery|exhaust|suspension|steering)/.test(t)) {
    return 'text-orange-300 border-orange-400/60';
  }
  if (/(wall|floor|roof|column|beam|foundation|window|door|stair|elevator|basement|home|house|building)/.test(t)) {
    return 'text-amber-300 border-amber-400/60';
  }
  if (/(milestone|task|phase|deliverable|decision|review|sprint|goal|deadline|kickoff)/.test(t)) {
    return 'text-fuchsia-300 border-fuchsia-400/60';
  }
  if (/(team|manager|user|person|engineer|lead|department|stakeholder)/.test(t)) {
    return 'text-cyan-300 border-cyan-400/60';
  }
  return 'text-slate-300 border-white/20';
}

export interface ArchitectureNodeData {
  label: string;
  nodeType: NodeType;
  status: NodeStatus;
  highlighted: boolean;
}

function ArchitectureNodeInner({ data }: { data: ArchitectureNodeData }) {
  const Icon = pickIcon(data.nodeType);
  const accent = pickAccent(data.nodeType);
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

import { useParams } from 'react-router-dom';
import { AudioLines } from 'lucide-react';
import { Canvas } from '../components/canvas/Canvas';
import { useVoiceSession } from '../hooks/useVoiceSession';
import { useCanvasStore, type ConnectionStatus } from '../store/canvasStore';

const CONNECTION_LABEL: Record<ConnectionStatus, string> = {
  idle: 'idle',
  connecting: 'connecting…',
  open: 'live',
  closed: 'closed',
  error: 'error',
};
const CONNECTION_DOT: Record<ConnectionStatus, string> = {
  idle: 'bg-slate-500',
  connecting: 'bg-amber-400 animate-pulse',
  open: 'bg-emerald-400',
  closed: 'bg-slate-500',
  error: 'bg-rose-500',
};

// Entry point for links posted by the Slack slash command
// (see server/app/api/slack.py) — a thin wrapper around the same voice/canvas
// primitives Dashboard uses, bootstrapped from an existing session id instead
// of starting blank. No export/version UI here yet (deferred).
export default function Session() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { start, stop } = useVoiceSession(sessionId);

  const isRecording = useCanvasStore((s) => s.isRecording);
  const connection = useCanvasStore((s) => s.connection);
  const lastError = useCanvasStore((s) => s.lastError);
  const nodeCount = useCanvasStore((s) => s.nodes.length);

  const handleToggleMic = async () => {
    if (isRecording || connection === 'connecting' || connection === 'open') {
      await stop();
      return;
    }
    try {
      await start();
    } catch {
      // useVoiceSession stores the error; UI reads it from the store
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0a0f18] text-slate-200 flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-lg font-black tracking-tighter text-white">
            VORLAGE
          </span>
          <span className="text-xs text-slate-500">session {sessionId}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-slate-400">
            <span className={`w-2 h-2 rounded-full ${CONNECTION_DOT[connection]}`} />
            <span>{CONNECTION_LABEL[connection]}</span>
          </div>
          <span className="text-xs text-slate-500">
            {nodeCount} node{nodeCount === 1 ? '' : 's'}
          </span>
          <button
            type="button"
            onClick={handleToggleMic}
            disabled={connection === 'connecting'}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-white text-slate-900 hover:bg-slate-200'
            }`}
          >
            <AudioLines className="w-4 h-4" />
            {isRecording ? 'Stop' : 'Start talking'}
          </button>
        </div>
      </header>

      {lastError && (
        <div className="px-4 py-2 bg-rose-500/10 border-b border-rose-500/30 text-rose-200 text-sm">
          {lastError}
        </div>
      )}

      <div className="flex-1 min-h-0">
        <Canvas />
      </div>
    </div>
  );
}

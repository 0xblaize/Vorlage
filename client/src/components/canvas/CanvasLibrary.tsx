import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, FolderOpen, RefreshCw, Loader2 } from 'lucide-react';
import {
  deleteCanvas,
  getCanvas,
  listCanvases,
  type CanvasRecord,
} from '../../lib/canvasApi';
import { useCanvasStore } from '../../store/canvasStore';

interface Props {
  open: boolean;
  onClose: () => void;
  sendLoad: (canvasId: number) => boolean;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function CanvasLibrary({ open, onClose, sendLoad }: Props) {
  const [records, setRecords] = useState<CanvasRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const applyGraph = useCanvasStore((s) => s.applyGraph);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listCanvases();
      rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
      setRecords(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) void refresh();
  }, [open, refresh]);

  const handleLoad = async (rec: CanvasRecord) => {
    setBusyId(rec.id);
    setError(null);
    try {
      // Prefer the live WS route so the server session state stays in sync;
      // if there is no open socket, fall back to REST + local applyGraph.
      if (!sendLoad(rec.id)) {
        const fresh = await getCanvas(rec.id);
        applyGraph(fresh.graph);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (rec: CanvasRecord) => {
    if (!window.confirm(`Delete "${rec.name}"? This cannot be undone.`)) return;
    setBusyId(rec.id);
    setError(null);
    try {
      await deleteCanvas(rec.id);
      setRecords((prev) => prev.filter((r) => r.id !== rec.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="library-wrapper"
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="relative w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl border border-white/10 bg-[#0d131f] shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <FolderOpen className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-semibold text-white">
                  Canvas Library
                </h2>
                <span className="text-xs text-slate-500">
                  {records.length} saved
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={refresh}
                  disabled={loading}
                  className="p-2 rounded-md hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                  />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-md hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 min-h-[200px]">
              {error && (
                <div className="mb-3 mx-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                  {error}
                </div>
              )}

              {loading && records.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-12 text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Loading…
                </div>
              ) : records.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <FolderOpen className="w-10 h-10 text-slate-600 mb-3" />
                  <p className="text-sm text-slate-400">
                    No canvases saved yet.
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Design something with your voice, then click{' '}
                    <span className="text-slate-300">Save</span>.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {records.map((rec) => {
                    const busy = busyId === rec.id;
                    const nodeCount = rec.graph?.nodes?.length ?? 0;
                    const edgeCount = rec.graph?.edges?.length ?? 0;
                    return (
                      <li
                        key={rec.id}
                        className="group flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => handleLoad(rec)}
                          disabled={busy}
                          className="flex-1 min-w-0 text-left disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <div className="text-sm font-medium text-slate-100 truncate">
                            {rec.name || `Canvas #${rec.id}`}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {nodeCount} node{nodeCount === 1 ? '' : 's'} ·{' '}
                            {edgeCount} edge{edgeCount === 1 ? '' : 's'} ·{' '}
                            {formatDate(rec.created_at)}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(rec)}
                          disabled={busy}
                          className="p-2 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {busy ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

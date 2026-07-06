import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AudioLines,
  Settings,
  User,
  X,
  Cpu,
  Menu,
  ChevronDown,
  Plus,
  Share,
  Search,
  Image as ImageIcon,
  Video,
  BookOpen,
  MessageSquare,
  Save,
  FolderOpen,
  Loader2,
  Paperclip,
} from 'lucide-react';
import { FirmamentVisualizer } from '../components/ui/FirmamentVisualizer';
import {
  SettingsWorkspace,
  WorkspaceTab,
} from '../components/workspace/SettingsWorkspace';
import { Canvas } from '../components/canvas/Canvas';
import { CanvasLibrary } from '../components/canvas/CanvasLibrary';
import { useVoiceSession } from '../hooks/useVoiceSession';
import { useCanvasStore, type ConnectionStatus } from '../store/canvasStore';
import { saveCanvas } from '../lib/canvasApi';
import { authClient } from '../lib/auth';

const GREETINGS = [
  'What should we focus on?',
  'How can I help you build today?',
  'Ready to engineer something great?',
  "What's on your mind?",
  "Let's create something extraordinary.",
];

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

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] =
    useState<WorkspaceTab>(null);
  const [greeting, setGreeting] = useState(GREETINGS[0]);
  const [canvasOpen, setCanvasOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [referenceImages, setReferenceImages] = useState<
    { id: string; name: string; dataUrl: string; file: File }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { start, stop, sendReset, sendLoad } = useVoiceSession();
  const isRecording = useCanvasStore((s) => s.isRecording);
  const connection = useCanvasStore((s) => s.connection);
  const transcript = useCanvasStore((s) => s.transcript);
  const speechPayload = useCanvasStore((s) => s.speechPayload);
  const lastError = useCanvasStore((s) => s.lastError);
  const nodeCount = useCanvasStore((s) => s.nodes.length);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const highlightIds = useCanvasStore((s) => s.highlightIds);
  const setError = useCanvasStore((s) => s.setError);
  const session = authClient.useSession();
  const user = session.data?.user;
  const userInitial = (user?.name ?? user?.email ?? '?')
    .slice(0, 1)
    .toUpperCase();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
  }, []);

  useEffect(() => {
    if (nodeCount > 0) setCanvasOpen(true);
  }, [nodeCount]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript.final, transcript.partial, speechPayload]);

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

  const handleNewSession = () => {
    sendReset();
    setCanvasOpen(false);
    setReferenceImages([]);
    setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleImagePicked = async (e: ChangeEvent<HTMLInputElement>) => {
    const picked: File[] = e.target.files ? Array.from(e.target.files) : [];
    const files = picked.filter((f) => f.type.startsWith('image/'));
    e.target.value = '';
    if (files.length === 0) return;
    const readAsDataUrl = (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error ?? new Error('read failed'));
        reader.readAsDataURL(file);
      });
    const added = await Promise.all(
      files.map(async (file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        dataUrl: await readAsDataUrl(file),
        file,
      })),
    );
    setReferenceImages((prev) => [...prev, ...added]);
  };

  const handleRemoveImage = (id: string) => {
    setReferenceImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSaveCanvas = async () => {
    if (nodeCount === 0 || saving) return;
    const suggested = `Canvas ${new Date().toLocaleString()}`;
    const name = window.prompt('Name this canvas', suggested)?.trim();
    if (!name) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      await saveCanvas(name, {
        nodes,
        edges,
        highlight_nodes: highlightIds,
        speech_payload: speechPayload,
      });
      setSaveMessage(`Saved “${name}”`);
      setTimeout(() => setSaveMessage(null), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const hasTranscript = Boolean(transcript.final || transcript.partial);
  const isChatEmpty = !hasTranscript && !speechPayload && !lastError;

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0a0f18] text-slate-200 relative font-sans flex flex-col">
      <FirmamentVisualizer isListening={isRecording} theme="dark" />

      <header className="absolute top-0 left-0 right-0 z-30 w-full p-4 md:p-6 flex justify-between items-center bg-gradient-to-b from-[#0a0f18] to-transparent">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors text-slate-300"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-xl font-black tracking-tighter text-white hidden sm:block">
            VORLAGE.
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-slate-400">
            <span className={`w-2 h-2 rounded-full ${CONNECTION_DOT[connection]}`} />
            <span>{CONNECTION_LABEL[connection]}</span>
          </div>
        </div>

        <div className="flex-1 flex justify-center absolute left-1/2 -translate-x-1/2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 active:bg-white/20 transition-colors backdrop-blur-md cursor-pointer">
            <span className="text-xs md:text-sm font-medium text-slate-200">
              VORLAGE Spatial-1
            </span>
            <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setLibraryOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-slate-200 text-sm cursor-pointer"
            title="Open canvas library"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Library</span>
          </button>
          <button
            onClick={handleSaveCanvas}
            disabled={nodeCount === 0 || saving}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-slate-200 text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title={nodeCount === 0 ? 'Nothing to save yet' : 'Save canvas'}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save</span>
          </button>
          <button
            onClick={handleNewSession}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 transition-colors text-white font-medium text-sm shadow-lg shadow-indigo-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Session</span>
          </button>
          <button
            onClick={() =>
              navigator.clipboard
                ?.writeText(window.location.href)
                .catch(() => {})
            }
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 active:bg-white/10 transition-colors text-slate-300 cursor-pointer"
          >
            <Share className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('settings')}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 active:bg-white/10 transition-colors text-slate-300 cursor-pointer"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('profile')}
            className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center hover:bg-indigo-500/40 active:bg-indigo-500/50 transition-colors cursor-pointer overflow-hidden"
            title={user?.email ?? 'Profile'}
          >
            {user?.image ? (
              <img
                src={user.image}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : user ? (
              <span className="text-sm font-semibold text-indigo-200">
                {userInitial}
              </span>
            ) : (
              <User className="w-5 h-5 text-indigo-300" />
            )}
          </button>
        </div>
      </header>

      <div
        className={`relative z-10 flex-1 flex transition-all duration-700 ease-in-out ${
          canvasOpen ? 'lg:flex-row flex-col' : 'flex-col'
        } overflow-hidden pt-20`}
      >
        <div
          className={`flex-1 flex flex-col relative h-full transition-all duration-500 ${
            canvasOpen ? 'lg:w-1/2' : 'w-full'
          } items-center justify-center`}
        >
          <AnimatePresence mode="wait">
            {!isChatEmpty && (
              <motion.div
                key="chat-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pb-40 scrollbar-hide"
              >
                <div className="max-w-3xl mx-auto space-y-4">
                  {transcript.final && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-end"
                    >
                      <div className="max-w-[85%] md:max-w-[75%] rounded-2xl p-4 bg-indigo-500 text-white">
                        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                          {transcript.final}
                        </p>
                      </div>
                    </motion.div>
                  )}
                  {transcript.partial && (
                    <div className="flex justify-end">
                      <div className="max-w-[85%] md:max-w-[75%] rounded-2xl p-4 bg-indigo-500/30 border border-indigo-400/40 text-indigo-100 italic">
                        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                          {transcript.partial}
                        </p>
                      </div>
                    </div>
                  )}
                  {speechPayload && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="max-w-[85%] md:max-w-[75%] rounded-2xl p-4 bg-white/5 border border-white/10 text-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Cpu className="w-4 h-4 text-indigo-400" />
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Spatial-1
                          </span>
                        </div>
                        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                          {speechPayload}
                        </p>
                      </div>
                    </motion.div>
                  )}
                  {lastError && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl p-4 bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm">
                        {lastError}
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            layout
            initial={false}
            animate={{
              alignItems: isChatEmpty ? 'center' : 'flex-end',
              justifyContent: isChatEmpty ? 'center' : 'flex-end',
              paddingBottom: isChatEmpty ? '0px' : '24px',
              paddingTop: isChatEmpty ? '0px' : '16px',
            }}
            className="absolute inset-0 z-20 flex flex-col w-full pointer-events-none"
          >
            <div
              className={`w-full max-w-3xl mx-auto px-4 md:px-6 pointer-events-auto transition-all duration-700 ${
                !isChatEmpty &&
                'bg-gradient-to-t from-[#0a0f18] via-[#0a0f18] to-transparent pt-12 pb-2'
              }`}
            >
              <AnimatePresence>
                {isChatEmpty && (
                  <motion.div
                    key="empty-greeting"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-8 md:mb-12 px-2"
                  >
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium text-white tracking-tight leading-tight">
                      {greeting}
                    </h1>
                  </motion.div>
                )}
              </AnimatePresence>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagePicked}
                className="hidden"
              />

              {referenceImages.length > 0 && (
                <div className="max-w-xl mx-auto mb-3 flex flex-wrap gap-2 justify-center">
                  {referenceImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative group/thumb w-16 h-16 rounded-lg overflow-hidden border border-white/10 bg-white/5"
                      title={img.name}
                    >
                      <img
                        src={img.dataUrl}
                        alt={img.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img.id)}
                        className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                        aria-label={`Remove ${img.name}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative group flex justify-center max-w-xs mx-auto">
                <div
                  className={`absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[3rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-500 ${
                    isRecording ? 'opacity-100 animate-pulse' : ''
                  }`}
                ></div>
                <div className="relative flex items-center justify-between gap-4 md:gap-6 bg-[#17181c] border border-white/10 rounded-[3rem] shadow-2xl px-4 md:px-6 py-2 md:py-3 transition-colors w-full">
                  <button
                    type="button"
                    onClick={handleAttachClick}
                    className="p-3 text-slate-400 hover:text-indigo-400 transition-colors rounded-full hover:bg-white/5"
                    title="Upload reference image"
                  >
                    <Plus className="w-6 h-6" />
                  </button>

                  <div className="w-px h-8 bg-white/10"></div>

                  <button
                    type="button"
                    onClick={handleToggleMic}
                    disabled={connection === 'connecting'}
                    className={`p-4 md:p-5 transition-all duration-300 rounded-full shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed ${
                      isRecording
                        ? 'text-white bg-red-500 shadow-red-500/50 scale-110 animate-pulse'
                        : 'text-slate-800 bg-white shadow-white/30 hover:bg-slate-200 hover:scale-105'
                    }`}
                  >
                    <AudioLines
                      className={`w-6 h-6 md:w-8 md:h-8 ${
                        isRecording ? 'animate-bounce' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
              {!isChatEmpty && (
                <div className="text-center mt-6 text-xs text-slate-500">
                  VORLAGE uses spatial reasoning to respond.
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {canvasOpen && (
            <motion.div
              key="artifact-panel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:w-1/2 h-full border-t lg:border-t-0 lg:border-l border-white/10 bg-[#0d131f] flex flex-col absolute lg:relative z-40 top-0 lg:top-auto left-0 lg:left-auto w-full lg:max-w-[50%]"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="text-sm font-medium text-slate-200">
                    Architecture Canvas
                  </span>
                  <span className="text-xs text-slate-500">
                    {nodeCount} node{nodeCount === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleSaveCanvas}
                    disabled={nodeCount === 0 || saving}
                    className="md:hidden p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Save canvas"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setLibraryOpen(true)}
                    className="md:hidden p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
                    title="Open library"
                  >
                    <FolderOpen className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCanvasOpen(false)}
                    className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <Canvas />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SettingsWorkspace
        activeTab={activeWorkspaceTab}
        onClose={() => setActiveWorkspaceTab(null)}
        onNavigate={setActiveWorkspaceTab}
      />

      <CanvasLibrary
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        sendLoad={sendLoad}
      />

      <AnimatePresence>
        {saveMessage && (
          <motion.div
            key="save-toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] px-4 py-2 rounded-full bg-emerald-500/90 text-white text-sm shadow-lg shadow-emerald-500/30"
          >
            {saveMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div key="sidebar-wrapper" className="absolute inset-0 z-40">
            <motion.div
              key="sidebar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute top-0 left-0 bottom-0 w-[280px] md:w-[320px] bg-[#0d131f] border-r border-white/10 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-4 flex items-center justify-between">
                <button
                  onClick={() => {
                    handleNewSession();
                    setIsSidebarOpen(false);
                  }}
                  className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium text-slate-200 border border-white/5"
                >
                  <Plus className="w-4 h-4" />
                  New chat
                </button>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
                <div className="space-y-1">
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-slate-300">
                    <Search className="w-4 h-4 text-slate-400" />
                    Search chats
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-slate-300">
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                    Images
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-slate-300">
                    <Video className="w-4 h-4 text-slate-400" />
                    Videos
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-slate-300">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    Library
                  </button>
                </div>

                <div>
                  <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Notebooks
                  </h3>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-slate-300">
                    <Plus className="w-4 h-4 text-slate-400" />
                    New notebook
                  </button>
                </div>

                <div>
                  <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Recent
                  </h3>
                  <div className="space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-slate-300 group">
                      <MessageSquare className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />
                      <span className="truncate text-slate-500">
                        No saved sessions
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-white/5">
                <button
                  onClick={() => setActiveWorkspaceTab('profile')}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center overflow-hidden">
                      {user?.image ? (
                        <img
                          src={user.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : user ? (
                        <span className="text-xs font-semibold text-indigo-200">
                          {userInitial}
                        </span>
                      ) : (
                        <User className="w-4 h-4 text-indigo-300" />
                      )}
                    </div>
                    <div className="text-left min-w-0">
                      <div className="text-sm font-medium text-slate-200 truncate">
                        {user?.name ?? 'Account'}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {user?.email ?? 'Signed in'}
                      </div>
                    </div>
                  </div>
                  <Settings className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

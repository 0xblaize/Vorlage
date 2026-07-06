import { useCallback, useEffect, useRef } from 'react';
import { VoiceSocket } from '../lib/voiceSocket';
import type { ServerMessage } from '../lib/contract';
import { useCanvasStore } from '../store/canvasStore';

function resolveWsUrl(): string {
  const base = import.meta.env.VITE_WS_URL;
  if (!base) {
    throw new Error(
      'VITE_WS_URL is not set — copy client/.env.example to client/.env.local',
    );
  }
  return `${base.replace(/\/$/, '')}/ws/voice`;
}

export interface VoiceSession {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  sendReset: () => void;
}

export function useVoiceSession(): VoiceSession {
  const socketRef = useRef<VoiceSocket | null>(null);

  const applyGraph = useCanvasStore((s) => s.applyGraph);
  const applyGhosts = useCanvasStore((s) => s.applyGhosts);
  const setTranscript = useCanvasStore((s) => s.setTranscript);
  const setConnection = useCanvasStore((s) => s.setConnection);
  const setRecording = useCanvasStore((s) => s.setRecording);
  const setError = useCanvasStore((s) => s.setError);
  const resetStore = useCanvasStore((s) => s.reset);

  const handleMessage = useCallback(
    (msg: ServerMessage) => {
      switch (msg.type) {
        case 'transcript':
          setTranscript(msg.text, msg.is_final);
          return;
        case 'ghost':
          applyGhosts(msg.nodes);
          return;
        case 'graph':
          applyGraph(msg.data);
          return;
        case 'error':
          setError(msg.detail);
          return;
      }
    },
    [applyGhosts, applyGraph, setError, setTranscript],
  );

  const stop = useCallback(async () => {
    const sock = socketRef.current;
    socketRef.current = null;
    setRecording(false);
    setConnection('closed');
    if (sock) await sock.stop();
  }, [setConnection, setRecording]);

  const start = useCallback(async () => {
    if (socketRef.current) return;
    setError(null);
    setConnection('connecting');

    const sock = new VoiceSocket(resolveWsUrl(), {
      onMessage: handleMessage,
      onOpen: () => setConnection('open'),
      onClose: () => {
        setConnection('closed');
        setRecording(false);
        socketRef.current = null;
      },
      onError: () => {
        setConnection('error');
        setError('WebSocket connection failed');
      },
    });

    socketRef.current = sock;

    try {
      await sock.start();
      setRecording(true);
    } catch (err) {
      socketRef.current = null;
      setRecording(false);
      setConnection('error');
      setError(err instanceof Error ? err.message : String(err));
      await sock.stop();
      throw err;
    }
  }, [handleMessage, setConnection, setError, setRecording]);

  const sendReset = useCallback(() => {
    resetStore();
    socketRef.current?.send({ type: 'reset' });
  }, [resetStore]);

  useEffect(() => {
    return () => {
      const sock = socketRef.current;
      socketRef.current = null;
      if (sock) void sock.stop();
    };
  }, []);

  return { start, stop, sendReset };
}

import type { ClientMessage, ServerMessage } from './contract';

export interface VoiceSocketHandlers {
  onMessage: (msg: ServerMessage) => void;
  onOpen?: () => void;
  onClose?: (ev: CloseEvent) => void;
  onError?: (err: Event) => void;
}

const CHUNK_MS = 250;

const MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
];

function pickMimeType(): string {
  const MR = (window as unknown as { MediaRecorder?: typeof MediaRecorder })
    .MediaRecorder;
  if (!MR) throw new Error('MediaRecorder is not supported in this browser');
  for (const t of MIME_CANDIDATES) {
    if (MR.isTypeSupported(t)) return t;
  }
  throw new Error(
    'No supported MediaRecorder MIME type — Deepgram needs webm/opus or ogg/opus',
  );
}

/**
 * One live voice session: mic → WS → server → callbacks.
 * The instance is single-shot; call `stop()` and create a new one to reconnect.
 */
export class VoiceSocket {
  private ws: WebSocket | null = null;
  private recorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private stopped = false;

  constructor(
    private readonly wsUrl: string,
    private readonly handlers: VoiceSocketHandlers,
  ) {}

  async start(): Promise<void> {
    if (this.stopped) throw new Error('VoiceSocket already stopped');
    if (this.ws) throw new Error('VoiceSocket already started');

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        'getUserMedia unavailable — mic requires HTTPS or localhost',
      );
    }

    const mimeType = pickMimeType();

    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    await this.openSocket();
    this.startRecorder(mimeType);
  }

  send(msg: ClientMessage): void {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(msg));
  }

  async stop(): Promise<void> {
    this.stopped = true;

    if (this.recorder && this.recorder.state !== 'inactive') {
      try {
        this.recorder.stop();
      } catch {
        // recorder may already be inactive
      }
    }
    this.recorder = null;

    if (this.stream) {
      for (const track of this.stream.getTracks()) track.stop();
      this.stream = null;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(1000, 'client stopped');
    }
    this.ws = null;
  }

  private openSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.wsUrl);
      ws.binaryType = 'arraybuffer';
      this.ws = ws;

      ws.onopen = () => {
        this.handlers.onOpen?.();
        resolve();
      };
      ws.onerror = (ev) => {
        this.handlers.onError?.(ev);
        reject(new Error(`WebSocket error to ${this.wsUrl}`));
      };
      ws.onclose = (ev) => {
        this.handlers.onClose?.(ev);
      };
      ws.onmessage = (ev) => {
        if (typeof ev.data !== 'string') return;
        let parsed: ServerMessage;
        try {
          parsed = JSON.parse(ev.data) as ServerMessage;
        } catch {
          return;
        }
        this.handlers.onMessage(parsed);
      };
    });
  }

  private startRecorder(mimeType: string): void {
    if (!this.stream) throw new Error('mic stream missing');
    const rec = new MediaRecorder(this.stream, { mimeType });
    this.recorder = rec;

    rec.ondataavailable = async (ev) => {
      if (!ev.data || ev.data.size === 0) return;
      if (this.ws?.readyState !== WebSocket.OPEN) return;
      const buf = await ev.data.arrayBuffer();
      this.ws.send(buf);
    };

    rec.start(CHUNK_MS);
  }
}

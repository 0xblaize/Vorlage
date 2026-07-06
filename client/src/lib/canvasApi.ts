import type { GraphUpdate } from './contract';
import { getAccessToken } from './auth';

export interface CanvasRecord {
  id: number;
  name: string;
  graph: GraphUpdate;
  created_at: string;
}

function apiBase(): string {
  const base = import.meta.env.VITE_API_URL;
  if (!base) {
    throw new Error(
      'VITE_API_URL is not set — copy client/.env.example to client/.env',
    );
  }
  return base.replace(/\/$/, '');
}

async function authedFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('You are not signed in');
  }
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(`${apiBase()}${path}`, { ...init, headers });
}

async function jsonOrThrow(res: Response): Promise<unknown> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = (await res.json()) as { detail?: string };
      if (body?.detail) detail = body.detail;
    } catch {
      /* fall through with statusText */
    }
    throw new Error(`${res.status} ${detail}`);
  }
  return res.status === 204 ? null : res.json();
}

export async function saveCanvas(
  name: string,
  graph: GraphUpdate,
): Promise<CanvasRecord> {
  const res = await authedFetch('/canvas', {
    method: 'POST',
    body: JSON.stringify({ name, graph }),
  });
  return (await jsonOrThrow(res)) as CanvasRecord;
}

export async function listCanvases(): Promise<CanvasRecord[]> {
  const res = await authedFetch('/canvas');
  return (await jsonOrThrow(res)) as CanvasRecord[];
}

export async function getCanvas(id: number): Promise<CanvasRecord> {
  const res = await authedFetch(`/canvas/${id}`);
  return (await jsonOrThrow(res)) as CanvasRecord;
}

export async function deleteCanvas(id: number): Promise<void> {
  const res = await authedFetch(`/canvas/${id}`, { method: 'DELETE' });
  await jsonOrThrow(res);
}

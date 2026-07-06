# Vorlage

Vorlage is an autonomous, voice-driven architectural routing engine. It translates spoken intent into spatial, node-based architecture diagrams in real time. Built for the Bad Theory Labs hackathon.

## Architecture Pipeline

1. **Voice Capture** — The frontend uses the native `MediaRecorder` API to stream 250ms audio chunks over a WebSocket.
2. **Speech to Text** — The FastAPI backend forwards each chunk to Deepgram (`nova-3`) for interim + final transcripts with zero-latency partials.
3. **Optimistic Ghost Nodes** — A keyword catcher on partial transcripts fires ghost nodes onto the canvas before the LLM has even responded.
4. **Intelligence** — Final transcripts are sent to the **Bad Theory Labs LLM gateway** (OpenAI-compatible, `btl-2` model) with the current canvas state; the model returns the full updated graph as strict JSON with spatial coordinates and edges.
5. **Canvas Rendering** — React Flow + Zustand instantly render the new nodes, snap ghosts to solid, and highlight nodes during analysis-mode questions.

## Repo Layout

```
vorlage/
├── client/          # Vite + React 19 + React Flow + Zustand
├── server/          # FastAPI + Deepgram + Bad Theory Labs LLM gateway + SQLAlchemy
└── .env             # Backend secrets (gitignored)
```

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.13+ and [uv](https://docs.astral.sh/uv/)
- A Deepgram API key ([console.deepgram.com](https://console.deepgram.com))
- A Bad Theory Labs LLM gateway key (hackathon grant — includes DeepSeek starter tokens)

### Environment Setup

**Backend** — create `.env` at the repo root:

```
LLM_API_KEY=your_btl_gateway_key_here
LLM_BASE_URL=https://api.badtheorylabs.com/v1
LLM_MODEL=btl-2
DEEPGRAM_API_KEY=your_deepgram_key_here
```

Optional overrides:

```
STT_MODEL=nova-3
CORS_ORIGINS=["http://localhost:3000","https://your-frontend.vercel.app"]
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/vorlage
```

**Frontend** — create `client/.env`:

```
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

### Running the Backend

```bash
cd server
uv sync
python -m uvicorn app.main:app --reload --port 8000
```

### Running the Frontend

```bash
cd client
npm install
npm run dev
```

## Usage

1. Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard).
2. Click the microphone.
3. Speak your architectural requirements, e.g. *"Add a Postgres database behind the Python backend."*
4. Watch the ghost node appear on the canvas as you speak, then snap into place with edges the moment the LLM responds.
5. Ask analysis questions like *"Where is the bottleneck?"* — matching nodes get highlighted with a short spoken answer.

## WebSocket Contract

Route: `ws://localhost:8000/ws/voice`

Client → server: binary audio chunks (webm/opus) or JSON control frames (`transcript`, `reset`, `load`).

Server → client JSON frames:

| Type | Payload |
|------|---------|
| `transcript` | `{ text, is_final }` |
| `ghost` | `{ nodes: CanvasNode[] }` — optimistic previews (status: `ghost`) |
| `graph` | `{ data: GraphUpdate }` — authoritative state from the LLM |
| `error` | `{ detail }` |

Full schema in `server/app/schema/voice.py` and mirrored in `client/src/lib/contract.ts`.

## Contributors

- **Alawode Christopher ** ([@0xblaize](https://github.com/0xblaize)) — AI Pipeline Architect
- **Sam** ([@yestuue](https://github.com/yestuue)) — Frontend Developer
- **Joshua** ([@Webprowale](https://github.com/Webprowale)) — Backend Developer

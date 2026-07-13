# Vorlage

Vorlage is a voice-first AI Systems Architect built for Slack. It joins
engineering conversations, listens in real time, and continuously builds
living software architecture while teams are still designing systems.
Instead of losing architecture decisions inside meetings, Vorlage
automatically produces diagrams, documentation, implementation plans, and
design rationale before the conversation ends.

Speak — *"add a Postgres database behind the API, with a cache in front of
it"* — and nodes and edges appear on a canvas in real time, first as
instant "ghost" previews, then confirmed by the LLM with full spatial
reasoning.

## Voice Architecture Pipeline

1. **Voice capture** — the browser streams 250ms audio chunks over a
   WebSocket using `MediaRecorder`.
2. **Speech-to-text** — the FastAPI backend forwards each chunk to Deepgram
   (`nova-3`) for interim + final transcripts.
3. **Ghost nodes** — a keyword detector fires optimistic node previews on
   partial transcripts, before the LLM has replied. They exist to provide
   immediate visual feedback while the language model completes its
   reasoning, so the experience feels collaborative rather than like
   waiting on AI — the "wow" moment.
4. **Architecture generation** — final transcripts go to an LLM (current
   canvas state + transcript in, full updated graph out as strict JSON).
5. **Canvas rendering** — React Flow + Zustand render the update instantly,
   snapping ghosts to solid nodes and drawing edges.

## Slack Collaboration Workflow

```
Slack
  ↓
/vorlage
  ↓
Voice Session Starts
  ↓
Engineers Discuss Architecture
  ↓
Deepgram Streams Speech
  ↓
Ghost Nodes Appear
  ↓
LLM Updates Architecture
  ↓
Diagram Evolves Live
  ↓
Meeting Ends
  ↓
Slack Thread Receives
  • Architecture Diagram
  • Documentation
  • Mermaid Export
  • Action Items
```

## System Architecture

```mermaid
graph TD
    Slack --> FastAPI
    FastAPI --> Deepgram
    Deepgram --> LLM
    LLM --> ArchitectureEngine[Architecture Engine]
    ArchitectureEngine --> ReactFlow[React Flow]
    ArchitectureEngine --> PostgreSQL
    ArchitectureEngine --> Slack
```

## Why Slack?

Engineering decisions happen in conversations. Those conversations already
happen in Slack.

Vorlage doesn't replace existing engineering workflows — it participates
in them. By embedding directly into Slack, Vorlage transforms technical
discussions into persistent architecture artifacts without requiring
engineers to change how they work.

## Hackathon Features

- Slack-native workflow
- Voice-first architecture generation
- Live ghost node rendering
- Real-time architecture updates
- Automatic documentation
- Mermaid export
- Architecture version history
- Gemini + Groq failover
- Persistent Postgres sessions

## Demo Scenario

1. A team starts a new backend design discussion in Slack.
2. They launch Vorlage with `/vorlage`.
3. Engineers begin speaking.
4. Ghost nodes appear instantly.
5. The architecture grows in real time.
6. The meeting ends.
7. Slack automatically receives:
   - Architecture Diagram
   - Mermaid Export
   - Documentation
   - Security Recommendations
   - Action Items

### LLM provider fallback

The backend never talks to a specific model — it calls a provider-agnostic
`LLMService` (`server/app/llm/service.py`) that tries **Gemini** first and
automatically falls back to **Groq** if Gemini errors (rate limit, timeout,
quota, 5xx). Both are OpenAI-compatible endpoints, so no extra SDK is
required. Configure either or both; the app works with just one.

### Slack integration

Slack bots can't listen to live audio in a channel or huddle, so Slack is
the collaboration layer around the voice-first core, not a replacement for
it. Instead of documenting architecture after a meeting, teams simply start
a Vorlage session from Slack.

During the session:

- Voice is streamed to the backend.
- Ghost nodes appear immediately.
- The architecture grows in real time.
- Progress is reflected back into the Slack thread.
- When the meeting ends, the complete architecture package is posted
  automatically.

In detail:

- `/vorlage` in any channel starts a session, opens a thread, and replies
  with a link to the live voice/canvas page (`/session/:id`).
- As the architecture grows during the session, throttled progress pings
  land in the thread.
- When the session ends, Vorlage automatically posts a full write-up to the
  thread: summary, why each component exists, security/scaling
  recommendations, missing components, action items, a Mermaid diagram, and
  the raw graph JSON.

Every session is persisted to Postgres (`voice_sessions` table) as it
happens, so nothing is lost if the connection drops.

## Repo layout

```
vorlage/
├── client/          # Vite + React 19 + React Flow + Zustand + Better Auth
├── server/          # FastAPI + Deepgram + Gemini/Groq LLM + SQLAlchemy + Slack
└── .env             # Shared backend/frontend secrets (gitignored)
```

## Getting started

### Prerequisites

- Node.js 20+
- Python 3.13+ and [uv](https://docs.astral.sh/uv/)
- A [Deepgram](https://console.deepgram.com) API key
- A [Gemini](https://aistudio.google.com/apikey) and/or
  [Groq](https://console.groq.com/keys) API key
- A Postgres database (e.g. [Neon](https://neon.tech)) and a
  [Neon Auth](https://neon.tech/docs/guides/neon-auth) project for login
- (Optional, for the Slack flow) a Slack app — see
  [Slack app setup](#slack-app-setup) below

### Environment setup

Create `.env` at the repo root:

```bash
# LLM — Gemini primary, Groq fallback. At least one is required.
GEMINI_API_KEY=your_gemini_key
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
GEMINI_MODEL=gemini-2.5-flash-lite
GROQ_API_KEY=your_groq_key
GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_MODEL=llama-3.3-70b-versatile

# Speech-to-text
DEEPGRAM_API_KEY=your_deepgram_key
STT_MODEL=nova-3

# Database + auth
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/vorlage
NEON_AUTH_BASE_URL=https://<endpoint>.neonauth.<region>.aws.neon.tech/<db>/auth

# CORS — include every origin the frontend is served from
CORS_ORIGINS=["http://localhost:3000","https://your-frontend.vercel.app"]

# Slack (optional — see Slack app setup)
SLACK_BOT_TOKEN=
SLACK_SIGNING_SECRET=
SLACK_DEFAULT_CHANNEL=
APP_BASE_URL=http://localhost:3000
```

Create `client/.env`:

```bash
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_NEON_AUTH_URL=https://<endpoint>.neonauth.<region>.aws.neon.tech/<db>/auth
```

### Run the backend

```bash
cd server
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

Tables are created automatically on startup if the database is reachable.

### Run the frontend

```bash
cd client
npm install
npm run dev
```

## Usage

1. Open `http://localhost:3000`, sign up / log in, and go to `/dashboard`.
2. Click the microphone and describe a system: *"Add a Postgres database
   behind the API, with a Redis cache in front of it."*
3. Watch ghost nodes appear as you speak, then snap into place with edges
   once the LLM responds.
4. Ask analysis questions like *"Where's the bottleneck?"* — matching nodes
   get highlighted with a short spoken answer.
5. Save a canvas, or start a fresh one by saying *"new project"*.

### Starting a session from Slack

Once the [Slack app is set up](#slack-app-setup), type `/vorlage` in any
channel the bot is in. It replies with a link — open it, sign in if
prompted, and start talking. Progress posts to the thread live; the final
write-up posts automatically when the session ends.

## Slack app setup

1. Create an app at [api.slack.com/apps](https://api.slack.com/apps) →
   **From scratch**.
2. **Basic Information → App Credentials** → copy the **Signing Secret**
   into `SLACK_SIGNING_SECRET`.
3. **OAuth & Permissions → Bot Token Scopes** → add `chat:write`,
   `commands` (and optionally `chat:write.public`).
4. **Install to Workspace** → copy the **Bot User OAuth Token** (`xoxb-...`)
   into `SLACK_BOT_TOKEN`.
5. **Slash Commands → Create New Command**:
   - Command: `/vorlage`
   - Request URL: `https://<your-backend>/slack/commands`
   - (Slack requires a public HTTPS URL — use `ngrok http 8000` for local
     testing, and update the Request URL each time the tunnel restarts.)
6. Set `APP_BASE_URL` to your deployed frontend's URL so the link Slack
   posts back points somewhere reachable.

## WebSocket contract

Route: `ws://localhost:8000/ws/voice?token=<jwt>` (optionally
`&session_id=<uuid>` to resume a Slack-originated session).

Client → server: binary audio chunks (webm/opus) or JSON control frames
(`transcript`, `reset`, `load`).

Server → client JSON frames:

| Type | Payload |
|------|---------|
| `transcript` | `{ text, is_final }` |
| `ghost` | `{ nodes: CanvasNode[] }` — optimistic previews (status: `ghost`) |
| `graph` | `{ data: GraphUpdate }` — authoritative state from the LLM |
| `error` | `{ detail }` |

Full schema in `server/app/schema/voice.py`, mirrored in
`client/src/lib/contract.ts`.

## Contributors

- **Christopher** ([@0xblaize](https://github.com/0xblaize)) — AI Pipeline Architect
- **Sam** ([@yestuue](https://github.com/yestuue)) — Frontend Developer
- **Joshua** ([@Webprowale](https://github.com/Webprowale)) — Backend Developer

# Storm Restoration Copilot

Voice-first, local-first field tablet for electric utility **mutual-aid crews** during storm restoration — plus a **dispatcher Publish Gate**.

Built from the [PRD](docs/PRD-Storm-Restoration-Copilot.md). Advisory only. Never issues switching orders.

Live demo surfaces:

| Route | Role |
| --- | --- |
| `/` | Crew tablet (assignment, live storm picture, voice/text copilot, field reports) |
| `/dispatch` | Utility control center (high-risk queue, OMS feed, fleet) |

Synthetic territory: **Cedar Ridge / Ridge Power Cooperative**, feeder **F-12**, Tropical remnant Hale.

---

## What it does

- **Local knowledge (Moss-style hybrid search)** over OMS events, hazards, damage, safety bulletins, yard inventory, and territory guides. Every answer cites **source + age**.
- **Safety guardrails** — switching / de-energize / open-close device requests are refused and escalated to TAC-2.
- **Link modes** — online, degraded, offline. Offline answers from the local index only.
- **Publish Gate** — inventory auto-publishes; hazards hold for dispatcher approve/reject.
- **Voice** — browser Speech Recognition + speech synthesis (Chrome/Edge). Type if the mic is unavailable.

Cloud LLM (`grok-4.5` via xAI) is used only when the local index is weak and the link is not offline.

---

## Prerequisites

- **Node.js 22+** and npm
- Optional: an [xAI API key](https://docs.x.ai) for cloud reasoning (`XAI_API_KEY`)

---

## Quick start

```bash
git clone https://github.com/NAYANSEN90/StormRestore.git
cd StormRestore
npm install
cp .env.example .env   # optional: add XAI_API_KEY — never commit .env
npm run dev
```

Open the printed local URL (default **port 8080**).

Crew tablet: `/`  
Dispatcher console: `/dispatch`

### Demo script

1. Ask: `hazards on F-12` — local Moss hit with source and age.
2. Ask: `yard inventory` — Yard Bravo stock.
3. Ask: `close the recloser 12-R1` — must refuse (advisory only).
4. Submit a **Hazard** report — Publish Gate **HOLD**.
5. Open **Dispatcher** and **Approve to fleet**.
6. Set **link → offline** and ask again — still answers from the local index.

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server on `0.0.0.0:8080` |
| `npm run build` | Production build (Vercel / Nitro output) |
| `npm run typecheck` | TypeScript `--noEmit` |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint |

---

## Stack

- **App:** React 19, TanStack Start / Router, Tailwind v4, Zustand
- **Retrieval:** in-process hybrid search (`src/lib/moss.ts`) over the synthetic Cedar Ridge corpus (`src/lib/corpus.ts`)
- **Supervisor:** `src/lib/supervisor.ts` — safety intercept → Moss → optional xAI
- **Publish Gate:** `src/lib/publish-gate.ts` + shared Zustand store (`src/lib/store.ts`)
- **Voice:** Web Speech API (STT) + `speechSynthesis` (TTS)

PRD targets Moss, Ollama, Whisper.cpp, LiveKit, and a private utility gateway. This repo ships a **browser-runnable** slice of that architecture: local index + safety + gate + crew/dispatch UI, with xAI as the optional reasoner instead of on-device Llama.

---

## Environment

| Variable | Required | Notes |
| --- | --- | --- |
| `XAI_API_KEY` | No | Server-only. Never prefix with `VITE_`. Without it, local retrieval and safety still work. |

**Do not commit `.env`.** Copy `.env.example` locally. Gitignore blocks `.env` and `.env.*` (except `.env.example`).

---

## Project layout

```
src/routes/index.tsx          Crew tablet
src/routes/dispatch.tsx       Dispatcher console
src/components/crew-app.tsx
src/components/dispatch-app.tsx
src/lib/corpus.ts             Synthetic OMS / hazards / bulletins
src/lib/moss.ts               Local hybrid search
src/lib/safety.ts             Switching-order block
src/lib/publish-gate.ts       Risk route + conflict check
src/lib/supervisor.ts         Copilot server function
docs/PRD-Storm-Restoration-Copilot.md
```

---

## License

Source in this repository is provided for the StormRestore hackathon build. Add a license file if you intend to redistribute.

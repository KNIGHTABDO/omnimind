# OmniMind
One Mind, Every Model.

![OmniMind](public/images/landscape-bg.gif)

OmniMind is a research-first chat interface built around a “Liquid Glass” design system and Nexus UI primitives. It streams responses, surfaces reasoning, and renders grounded citations when web discovery is enabled.

## Product
OmniMind is designed as a single, calm surface for intelligence:
- A cinematic background with high-contrast typography
- A focused chat composer with attachments
- Transparent “Thinking” traces and source citations
- A model pool selector that represents specialist modes

## Architecture
OmniMind is a Next.js App Router project:
- UI: React 19, Tailwind CSS v4, Radix UI, Nexus UI components in `src/components/nexus-ui`
- Chat API: `POST /api/chat` streams newline-delimited JSON (NDJSON)
- Providers: GitHub Copilot token flow (required), optional Groq/Tinyfish/Moondream integrations

## Local Development
Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Open:
- http://localhost:3000

## Environment Variables
Create `.env.local` in the repo root.

Required:
- `GITHUB_COPILOT_TOKEN`

Optional:
- `GROQ_API_KEY`
- `TINYFISH_API_KEY`
- `MOONDREAM_API_KEY`

## Deployment (Vercel)
This repo is ready to deploy as-is on Vercel.
- Framework preset: Next.js
- Build command: `npm run build`
- Output: Next.js default
- Environment variables: same as above

## Notes
- The chat endpoint streams NDJSON so the UI can render incremental tokens while preserving metadata (reasoning, rationale, citations).
- The mobile composer avoids iOS “input zoom” by ensuring the textarea font size remains at or above 16px on small screens.


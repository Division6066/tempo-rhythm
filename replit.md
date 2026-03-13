# TEMPO - ADHD-Friendly AI Daily Planner

## Overview

TEMPO is a calm, minimalist, ADHD-friendly planning app that combines daily planning, tasks, notes, projects, folders, tags, and AI-assisted planning into one tool. Features include Calendar View, Period Notes, Bi-directional Note Linking, Command Bar, Time Blocking, Recurring Tasks, Advanced Task Filters, Templates, Tags & @Mentions, and Note Publishing.

## Architecture

### Running App (pnpm workspace monorepo)
- `artifacts/api-server/` — Express REST API (port 8080) with PostgreSQL via Drizzle ORM
- `artifacts/tempo/` — Vite React SPA with wouter routing + React Query
- `lib/` — Shared packages (api-spec, api-client-react, api-zod, db)

### Marketing Website
- `artifacts/tempo-marketing/` — Vite React SPA marketing site (Anthropic-inspired design) with 7 pages: Home, Features, Pricing, About, Sign Up, Log In, Onboarding wizard

### Legacy (unused)
- `tempo-app/` — Previous Convex-based monorepo (Next.js + Expo). Not active.

## Stack

- **Backend**: Express + PostgreSQL + Drizzle ORM
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + wouter
- **API layer**: OpenAPI spec → Orval codegen → React Query hooks
- **Icons**: Lucide React
- **Date utils**: date-fns

## Structure

```text
artifacts/
├── api-server/src/
│   ├── index.ts              # Express server entry (port 8080)
│   └── routes/
│       ├── index.ts          # Route registration
│       ├── tasks.ts          # Task CRUD + /complete endpoint (recurring task support)
│       ├── notes.ts          # Note CRUD + /publish + /published/:slug
│       ├── projects.ts       # Project CRUD
│       ├── folders.ts        # Folder CRUD
│       ├── tags.ts           # Tag CRUD
│       ├── dailyPlans.ts     # Daily plan CRUD
│       ├── preferences.ts    # Preferences + onboarding
│       ├── ai.ts             # AI endpoints (chat, extract, chunk, plan)
│       ├── staging.ts        # Staged suggestions CRUD
│       ├── calendarEvents.ts # Calendar events CRUD
│       ├── noteLinks.ts      # Bi-directional note links
│       ├── savedFilters.ts   # Saved task filter presets
│       ├── noteTemplates.ts  # Note templates + seed endpoint
│       ├── search.ts         # Global search (notes + tasks)
│       └── transcribe.ts     # Voice transcription proxy (server-side)
├── tempo/src/
│   ├── pages/
│   │   ├── Dashboard.tsx     # Home with progress ring + Top 3 focus tasks + quick actions
│   │   ├── TodayView.tsx     # Today's tasks by priority
│   │   ├── Inbox.tsx         # Quick capture + brain dump + staging
│   │   ├── Chat.tsx          # AI chat with localStorage persistence, quick prompts, memory panel
│   │   ├── DailyPlan.tsx     # AI plan generation + accept/edit/reject staging
│   │   ├── TaskDetail.tsx    # Task editor + AI chunking + time blocking + recurrence
│   │   ├── Notes.tsx         # Notes list
│   │   ├── NoteEditor.tsx    # Note editor with backlinks, publish, wiki-links, tags/@mentions
│   │   ├── Projects.tsx      # Projects list with progress bars + detail navigation
│   │   ├── ProjectDetail.tsx # Project detail with linked tasks/notes, progress, archive/delete
│   │   ├── Settings.tsx      # Settings + navigation hub (11 feature links)
│   │   ├── Onboarding.tsx    # 6-step setup (ADHD, style, schedule, energy peaks, summary)
│   │   ├── Calendar.tsx      # Month/week toggle, event CRUD, task/event indicators
│   │   ├── FocusSession.tsx  # Pomodoro timer with task selection + session tracking
│   │   ├── Folders.tsx       # Areas/folders CRUD with icons
│   │   ├── Tags.tsx          # Tag management with color picker
│   │   ├── Memories.tsx      # AI memory viewer (warm/cold tiers)
│   │   ├── PeriodNotes.tsx   # Weekly/Monthly/Yearly period notes
│   │   ├── TaskFilters.tsx   # Advanced task filters with save/load
│   │   ├── NoteTemplates.tsx # Note templates (built-in + custom)
│   │   └── PublishedNote.tsx # Public published note view
│   └── components/
│       ├── CommandBar.tsx    # Global Cmd+K search/navigation
│       ├── VoiceNote.tsx     # Voice recording + server-side transcription
│       ├── QuickCapture.tsx  # FAB quick capture dialog
│       ├── TaskCard.tsx      # Task list item
│       ├── layout/AppLayout.tsx # App shell with bottom nav + command bar
│       └── ui/              # shadcn/ui components
lib/
├── api-spec/openapi.yaml     # OpenAPI 3.0 spec (source of truth)
├── api-client-react/         # Generated React Query hooks (via orval)
├── api-zod/                  # Generated Zod validators
└── db/src/schema/            # Drizzle schema definitions
    ├── tasks.ts              # + startTime, duration, recurrenceRule
    ├── notes.ts              # + periodType, periodDate, isPublished, publishSlug
    ├── calendarEvents.ts     # Calendar events table
    ├── noteLinks.ts          # Bi-directional note links table
    ├── savedFilters.ts       # Saved filter presets table
    ├── noteTemplates.ts      # Note templates table
    └── index.ts
```

## Features

1. **Calendar View** — Month/week toggle, event CRUD, task/event indicator dots, sorted day panel
2. **Period Notes** — Weekly/Monthly/Yearly notes with auto-generated titles
3. **Bi-directional Note Linking** — Link notes together, see incoming/outgoing connections
4. **Command Bar** — Cmd+K global search and quick navigation
5. **Time Blocking** — Schedule tasks with date, start time, and duration
6. **Recurring Tasks** — Auto-create next occurrence on completion (daily/weekly/monthly/yearly/custom)
7. **Advanced Task Filters** — Filter by status, priority, search; save/load filter presets (conditions array format)
8. **Templates** — Built-in + custom note templates with variable substitution
9. **Tags & @Mentions** — Auto-detected clickable #tags and @mentions in note content (navigate to search)
10. **Note Publishing** — Toggle notes as published, generates public slug
11. **Voice Notes** — Browser recording with server-side transcription proxy (no client-side API keys)
12. **Wiki-link Auto-Linking** — [[Note Title]] in content auto-creates note links on save, stale links removed
13. **AI Staging Pattern** — Accept/Edit/Reject workflow for AI suggestions
14. **Focus Timer** — Pomodoro-style timer with task selection, session tracking, break timer
15. **Areas/Folders** — Broad life categories (Work, Personal, Learning) with icon picker
16. **Tag Management** — Create/edit/delete tags with color picker
17. **AI Memory** — Warm/cold tier memory system for AI personalization
18. **Project Detail** — Linked tasks/notes view, progress bar, archive/delete
19. **Enhanced Onboarding** — 6-step flow: welcome, ADHD mode, planning style, schedule, energy peaks, summary
20. **Chat Persistence** — localStorage conversation history with clear, memory panel, quick prompts
21. **Dashboard Top 3** — Priority-ranked focus tasks on home screen

## Design System

- Background: Deep indigo `#1A1A2E`
- Surface/cards: `#252540`
- Primary: Violet `#6C63FF`
- Success: Teal `#00C9A7`
- Warning: Amber `#FFB347`
- Error: Red `#FF6B6B`
- Dark-first theme, ADHD-friendly with low cognitive load

## Key Commands

```bash
# Dev servers
pnpm --filter @workspace/api-server run dev   # Start Express API
pnpm --filter @workspace/tempo run dev         # Start Vite frontend

# Codegen pipeline (after OpenAPI spec changes)
cd lib/api-spec && pnpm run codegen            # Regenerates api-client-react + api-zod

# Database schema changes
cd lib/db && npx drizzle-kit push --force      # Push schema to PostgreSQL
```

## Authentication

- Admin account: `admin1234567` / `admin1234567` (Pro plan, admin role)
- 10 beta testers: `beta1`–`beta10` / `beta1234567` (Pro plan, beta_tester role)
- Session tokens: `tempo-session-{username}` (simple token-based, no expiry — beta phase only)
- Login endpoint: POST `/api/auth/login`, profile: GET `/api/auth/me`

## AI Provider

- Uses OpenAI-compatible API (provider-agnostic) via Ollama Cloud
- Client: `lib/integrations-openai-ai-server/src/client.ts`
- Model priority: Default `ministral-3` → Backup `magistral` (auto-fallback)
- Council mode (6 models queried in parallel, synthesized): `gpt-oss`, `deepseek-v3.1`, `qwen3.5`, `minimax-m2.5`, `kimi-k2.5`, `glm-5`
- Council used for daily plan generation via `?council=true` query param
- Exports: `AI_MODEL`, `AI_MODEL_BACKUP`, `COUNCIL_MODELS`, `callWithFallback`, `callCouncil`, `synthesizeCouncil`

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (provided by Replit)
- `OLLAMA_API_KEY` — Ollama Cloud API key (stored in Replit Secrets)
- `OLLAMA_API_URL` — Ollama API base URL (default: `https://api.ollama.com`)
- `OLLAMA_MODEL` — Default model (set to `ministral-3`)
- `OLLAMA_MODEL_BACKUP` — Backup model (set to `magistral`)
- `OLLAMA_COUNCIL_MODELS` — Comma-separated council models (set to `gpt-oss,deepseek-v3.1,qwen3.5,minimax-m2.5,kimi-k2.5,glm-5`)
- Falls back to `AI_INTEGRATIONS_OPENAI_BASE_URL` / `AI_INTEGRATIONS_OPENAI_API_KEY` if Ollama vars not set

## Infrastructure Guide

- `TEMPO_Infrastructure_Setup_Guide.md` — Full setup guide for Convex + Vercel deployment
- Contains: account creation steps, credentials checklist, schema reference, architecture overview

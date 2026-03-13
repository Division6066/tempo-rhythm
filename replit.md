# TEMPO - ADHD-Friendly AI Daily Planner

## Overview

TEMPO is a calm, minimalist, ADHD-friendly planning app that combines daily planning, tasks, notes, projects, folders, tags, and AI-assisted planning into one tool.

## Architecture

### Running App (pnpm workspace monorepo)
- `artifacts/api-server/` — Express REST API (port 8080) with PostgreSQL via Drizzle ORM
- `artifacts/tempo/` — Vite React SPA with wouter routing + React Query
- `lib/` — Shared packages (api-spec, api-client-react, api-zod, db)

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
│       ├── tasks.ts          # Task CRUD
│       ├── notes.ts          # Note CRUD
│       ├── projects.ts       # Project CRUD
│       ├── folders.ts        # Folder CRUD
│       ├── tags.ts           # Tag CRUD
│       ├── dailyPlans.ts     # Daily plan CRUD
│       ├── preferences.ts    # Preferences + onboarding
│       ├── ai.ts             # AI endpoints (chat, extract, chunk, plan)
│       └── staging.ts        # Staged suggestions CRUD (accept/reject/edit)
├── tempo/src/
│   ├── pages/
│   │   ├── Dashboard.tsx     # Home with progress ring + stats
│   │   ├── Today.tsx         # Today's tasks by priority
│   │   ├── Inbox.tsx         # Quick capture + brain dump + staging
│   │   ├── Chat.tsx          # AI chat interface
│   │   ├── DailyPlan.tsx     # AI plan generation + staging
│   │   ├── TaskDetail.tsx    # Task editor + AI chunking + staging
│   │   ├── Notes.tsx         # Notes list
│   │   ├── NoteEditor.tsx    # Note markdown editor
│   │   ├── Projects.tsx      # Projects list
│   │   ├── Settings.tsx      # ADHD mode, routine, focus sessions
│   │   └── Onboarding.tsx    # Multi-step setup flow
│   └── components/           # Shared UI components
lib/
├── api-spec/openapi.yaml     # OpenAPI 3.0 spec (source of truth)
├── api-client-react/         # Generated React Query hooks (via orval)
├── api-zod/                  # Generated Zod validators
└── db/src/schema/            # Drizzle schema definitions
    ├── tasks.ts
    ├── notes.ts
    ├── projects.ts
    ├── folders.ts
    ├── tags.ts
    ├── dailyPlans.ts
    ├── preferences.ts
    ├── stagedSuggestions.ts   # AI suggestion staging table
    └── index.ts
```

## Design System

- Background: Deep indigo `#1A1A2E`
- Surface/cards: `#252540`
- Primary: Violet `#6C63FF`
- Success: Teal `#00C9A7`
- Warning: Amber `#FFB347`
- Error: Red `#FF6B6B`
- Dark-first theme, ADHD-friendly with low cognitive load

## AI Staging Pattern (Accept/Edit/Reject)

All AI suggestions follow a staging workflow:
1. AI action generates data → stored as `stagedSuggestion` (status: "pending")
2. User sees staged results with Accept / Edit / Reject controls
3. **Accept**: Creates real records (tasks, plan blocks, subtasks), marks suggestion accepted
4. **Edit**: User modifies staged data inline (titles, priorities, times), saves changes via `PATCH /staging/:id/data`
5. **Reject**: Marks suggestion rejected, no data created

Implemented in:
- **Inbox.tsx**: Brain dump extraction stages tasks → Accept All / Edit / Reject All
- **DailyPlan.tsx**: Plan generation stages blocks → floating action bar with Accept / Edit / Reject
- **TaskDetail.tsx**: Task chunking stages subtasks → Accept & Create / Edit / Reject

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

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (provided by Replit)
- `OPENAI_API_KEY` — OpenAI API key for AI features

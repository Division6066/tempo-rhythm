# TEMPO - ADHD-Friendly AI Daily Planner

## Overview

TEMPO is a calm, minimalist, ADHD-friendly planning app that combines daily planning, tasks, notes, projects, folders, tags, lightweight personal memory, and AI-assisted planning into one tool. Built as a React + Vite web app with an Express backend.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion + Wouter
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **AI**: OpenAI via Replit AI Integrations (gpt-5.2)
- **Validation**: Zod (zod/v4), drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle for API server)
- **Icons**: Lucide React
- **Date utils**: date-fns
- **Markdown**: react-markdown

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/                  # Express API server
│   │   └── src/routes/
│   │       ├── tasks.ts             # Task CRUD
│   │       ├── notes.ts             # Note CRUD
│   │       ├── projects.ts          # Project CRUD
│   │       ├── folders.ts           # Folder CRUD
│   │       ├── tags.ts              # Tag CRUD
│   │       ├── dailyPlans.ts        # Daily plan CRUD
│   │       ├── preferences.ts       # User preferences + onboarding
│   │       ├── memories.ts          # Memory items CRUD
│   │       ├── templates.ts         # Plan template primitives
│   │       └── ai.ts               # AI endpoints (chat, extract, chunk, prioritize, plan)
│   ├── tempo/                       # React + Vite frontend
│   │   └── src/
│   │       ├── pages/               # All app pages
│   │       ├── components/          # Shared components (Layout, TaskCard, QuickCapture)
│   │       └── index.css            # TEMPO design tokens
│   └── mockup-sandbox/             # Design mockup sandbox
├── lib/
│   ├── api-spec/                    # OpenAPI spec + codegen config
│   ├── api-client-react/            # Generated React Query hooks
│   ├── api-zod/                     # Generated Zod schemas
│   ├── db/                          # Drizzle ORM schema + DB connection
│   │   └── src/schema/
│   │       ├── tasks.ts
│   │       ├── notes.ts
│   │       ├── projects.ts
│   │       ├── folders.ts
│   │       ├── tags.ts
│   │       ├── dailyPlans.ts
│   │       ├── preferences.ts
│   │       └── memories.ts
│   └── integrations-openai-ai-server/  # OpenAI AI integration
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── tsconfig.json
```

## Architecture Layers

1. **Layer A - Transactional State** (PostgreSQL): Tasks, notes, projects, folders, tags, daily plans, accepted AI outputs
2. **Layer B - Memory** (PostgreSQL): User preferences, routines, energy patterns, ADHD constraints, planning context
3. **Layer C - Templates**: Fixed library of plan block primitives (top3, focusBlock, taskSection, reflection, etc.)
4. **Layer D - AI Helper** (Advisory only): Task extraction, prioritization, chunking, plan generation. Never writes directly to planner state.

## Design System

- Background: Deep indigo #1A1A2E
- Surface/cards: #252540
- Primary: Violet #6C63FF
- Success: Teal #00C9A7
- Warning: Amber #FFB347
- Error: Red #FF6B6B
- Dark-first theme, ADHD-friendly with low cognitive load

## Key Pages

- `/` - Dashboard with progress, stats, AI assistant link
- `/today` - Today's tasks grouped by priority
- `/inbox` - Quick capture + brain dump with AI extraction
- `/chat` - AI assistant chat interface
- `/projects` - Color-coded project list
- `/notes` - Notes list + markdown editor
- `/settings` - Preferences + memory viewer
- `/onboarding` - Multi-step ADHD preference setup
- `/plan` - AI-generated daily plan with accept/edit/reject

## API Endpoints

All under `/api`:
- Tasks: GET/POST `/tasks`, GET/PATCH/DELETE `/tasks/:id`
- Notes: GET/POST `/notes`, GET/PATCH/DELETE `/notes/:id`
- Projects: GET/POST `/projects`, PATCH/DELETE `/projects/:id`
- Folders: GET/POST `/folders`, PATCH/DELETE `/folders/:id`
- Tags: GET/POST `/tags`, DELETE `/tags/:id`
- Daily Plans: GET/POST `/daily-plans`, GET/PATCH `/daily-plans/:id`
- Preferences: GET/PUT `/preferences`
- Memories: GET/POST `/memories`, DELETE `/memories/:id`
- AI: POST `/ai/chat`, `/ai/extract-tasks`, `/ai/chunk-task`, `/ai/prioritize`, `/ai/generate-plan`
- Onboarding: POST `/onboarding`
- Templates: GET `/templates`

## Commands

- `pnpm --filter @workspace/api-spec run codegen` - Regenerate API client hooks
- `pnpm --filter @workspace/db run push` - Push DB schema changes
- `pnpm run typecheck` - Full typecheck

# TEMPO - ADHD-Friendly AI Daily Planner

## Overview

TEMPO is a calm, minimalist, ADHD-friendly planning app that combines daily planning, tasks, notes, projects, folders, tags, lightweight personal memory, and AI-assisted planning into one tool.

## Two Implementations

### 1. Original (React + Vite + Express + PostgreSQL)
Located in `artifacts/tempo` + `artifacts/api-server`. Fully functional reference implementation.

### 2. Convex Monorepo (Next.js + Expo + Convex)
Located in `tempo-app/`. Restructured for cross-platform deployment with a shared Convex backend.

## Stack (Convex Monorepo)

- **Monorepo tool**: npm workspaces
- **Backend**: Convex (real-time, serverless)
- **Web**: Next.js 15 + Tailwind CSS v4 + Framer Motion
- **Mobile**: Expo SDK 54 + NativeWind + Expo Router
- **Auth**: @convex-dev/auth (Password provider)
- **AI**: OpenAI via fetch (gpt-4o)
- **Icons**: Lucide React (web), @expo/vector-icons (mobile)
- **Date utils**: date-fns
- **Markdown**: react-markdown (web)

## Structure (tempo-app/)

```text
tempo-app/
├── package.json                    # npm workspaces root
├── convex/                         # Shared Convex backend
│   ├── schema.ts                   # 8 tables: users, tasks, notes, projects, folders, tags, dailyPlans, preferences, memories
│   ├── auth.ts                     # Password auth with createOrUpdateUser
│   ├── auth.config.ts              # Convex auth config
│   ├── http.ts                     # HTTP router for auth
│   ├── tasks.ts                    # Task CRUD (list, get, create, update, remove)
│   ├── notes.ts                    # Note CRUD
│   ├── projects.ts                 # Project CRUD
│   ├── folders.ts                  # Folder CRUD
│   ├── tags.ts                     # Tag CRUD
│   ├── dailyPlans.ts               # Daily plan CRUD
│   ├── preferences.ts              # Preferences upsert
│   ├── memories.ts                 # Memory CRUD
│   ├── users.ts                    # User queries
│   └── ai.ts                       # AI actions (chat, extractTasks, chunkTask, prioritize, generatePlan)
├── apps/
│   ├── web/                        # Next.js 15 web app
│   │   ├── app/
│   │   │   ├── page.tsx            # Dashboard
│   │   │   ├── layout.tsx          # Root layout with Convex provider
│   │   │   ├── globals.css         # TEMPO design tokens
│   │   │   ├── today/page.tsx      # Today's tasks
│   │   │   ├── inbox/page.tsx      # Inbox + brain dump
│   │   │   ├── chat/page.tsx       # AI chat
│   │   │   ├── projects/page.tsx   # Projects list
│   │   │   ├── notes/page.tsx      # Notes list
│   │   │   ├── notes/[id]/page.tsx # Note editor
│   │   │   ├── plan/page.tsx       # Daily plan
│   │   │   ├── settings/page.tsx   # Settings
│   │   │   ├── onboarding/page.tsx # Onboarding flow
│   │   │   └── tasks/[id]/page.tsx # Task detail
│   │   ├── components/             # UI components
│   │   ├── lib/utils.ts            # Utility functions
│   │   └── middleware.ts           # Convex auth middleware
│   └── mobile/                     # Expo SDK 54 mobile app
│       ├── app/
│       │   ├── _layout.tsx         # Root layout with Convex
│       │   ├── (tabs)/             # Tab navigation
│       │   │   ├── index.tsx       # Home
│       │   │   ├── today.tsx       # Today
│       │   │   ├── inbox.tsx       # Inbox
│       │   │   ├── chat.tsx        # AI Chat
│       │   │   └── more.tsx        # More menu
│       │   ├── task/[id].tsx       # Task detail
│       │   ├── note/[id].tsx       # Note editor
│       │   ├── notes.tsx           # Notes list
│       │   ├── projects.tsx        # Projects
│       │   ├── plan.tsx            # Daily plan
│       │   └── settings.tsx        # Settings
│       └── lib/                    # Theme + Convex client
```

## Design System

- Background: Deep indigo #1A1A2E
- Surface/cards: #252540
- Primary: Violet #6C63FF
- Success: Teal #00C9A7
- Warning: Amber #FFB347
- Error: Red #FF6B6B
- Dark-first theme, ADHD-friendly with low cognitive load

## Key Pages (both web and mobile)

- Dashboard with progress ring, stats, AI assistant link
- Today's tasks grouped by priority
- Inbox with quick capture + brain dump (AI extraction)
- AI assistant chat interface
- Color-coded project list
- Notes list + markdown editor (web) / plain text (mobile)
- Settings with ADHD mode toggle, routine, focus sessions
- Onboarding with multi-step ADHD preference setup (web)
- AI-generated daily plan with accept/edit/reject pattern

## AI Features

All AI actions use OpenAI gpt-4o via Convex actions:
- **Chat**: ADHD-aware conversational assistant with memory context
- **Extract Tasks**: Parse messy brain dumps into structured tasks
- **Chunk Task**: Break large tasks into 3-5 small subtasks (10-30 min each)
- **Prioritize**: ADHD-optimized task ordering
- **Generate Plan**: Create daily plan with blocks (top3, focusBlock, taskSection, reflection)

## Environment Variables

### Convex (.env.local in tempo-app/)
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `OPENAI_BASE_URL` - Optional custom OpenAI endpoint

### Web (apps/web/.env.local)
- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL
- `CONVEX_DEPLOYMENT` - Convex deployment name

### Mobile (apps/mobile/.env.local)
- `EXPO_PUBLIC_CONVEX_URL` - Convex deployment URL

## Setup Commands

```bash
cd tempo-app
npm install
npx convex dev          # Start Convex dev server (creates .env.local)
cd apps/web && npm run dev    # Start Next.js dev server
cd apps/mobile && npx expo start  # Start Expo dev server
```

## Original Stack Commands

- `pnpm --filter @workspace/api-server run dev` - Start Express API server
- `pnpm --filter @workspace/tempo run dev` - Start Vite frontend

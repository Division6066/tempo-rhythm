# TEMPO — Infrastructure Setup Guide

**For**: Setting up Convex (backend database) and Vercel (frontend hosting)
**Date**: March 2026
**Status**: Pre-migration — app currently runs on Express + PostgreSQL on Replit

---

## Overview

TEMPO is an ADHD-friendly AI daily planner. The production architecture targets:

- **Convex** — Real-time backend database + serverless functions
- **Vercel** — Frontend hosting for the web app and marketing site
- **Expo** — Cross-platform mobile app (future phase)

This document tells you exactly what to create, configure, and which credentials to bring back.

---

## PART 1: CONVEX SETUP

### 1.1 Create Your Account

1. Go to [https://dashboard.convex.dev](https://dashboard.convex.dev)
2. Sign up (GitHub SSO is easiest)
3. Click **"Create a project"**
4. Name it: **`tempo`**

### 1.2 Get Your Credentials

From the Convex dashboard for the `tempo` project:

| Credential | Where to Find It | Format |
|---|---|---|
| **CONVEX_URL** | Dashboard → Settings → Deployment URL | `https://your-name-here.convex.cloud` |
| **CONVEX_DEPLOY_KEY** | Dashboard → Settings → Deploy Keys → Generate | `prod:abc123def456...` |

### 1.3 Schema (Already Written — Do NOT Create Manually)

The agent has a complete Convex schema at `tempo-app/convex/schema.ts`. When deployed, it automatically creates these 15 tables:

| Table | Purpose | Key Fields |
|---|---|---|
| **users** | Authentication (via @convex-dev/auth) | Auto-managed by Convex Auth |
| **profiles** | User identity & plan tier | userId, fullName, role (admin/user), userType (free/paid) |
| **tasks** | Core task management | title, status, priority, dueDate, scheduledDate, estimatedMinutes, recurrenceRule, aiGenerated, startTime, duration |
| **notes** | Markdown notes with wiki-linking | title, content, tags[], isPinned, isPublished, publishSlug, periodType |
| **projects** | Project containers | name, description, color, status |
| **folders** | Folder hierarchy | name, parentFolderId |
| **tags** | Color-coded labels | name, color |
| **dailyPlans** | AI-generated daily schedules | date, blocks (JSON), mood, energyLevel, aiGenerated |
| **preferences** | User settings | wakeTime, sleepTime, energyPeaks[], adhdMode, focusSessionMinutes, breakMinutes, onboardingComplete |
| **memories** | AI memory for personalization | tier (warm/cold), content, decay |
| **stagedSuggestions** | AI suggestions awaiting review | type, data (JSON), reasoning, status (pending/accepted/rejected) |
| **calendarEvents** | Calendar entries | title, date, startTime, endTime, externalId, source |
| **noteLinks** | Bi-directional wiki links | sourceNoteId, targetNoteId |
| **savedFilters** | Saved task filter configs | name, conditions (JSON) |
| **templates** | Reusable note templates | name, content, category, isBuiltIn |

### 1.4 Convex Functions (Already Written)

The following serverless functions exist at `tempo-app/convex/` and will be deployed automatically:

| File | Functions | Purpose |
|---|---|---|
| `tasks.ts` | list, create, update, complete, remove | Full task CRUD with recurrence handling |
| `notes.ts` | list, getBySlug, search, create, update, remove | Notes with search and publishing |
| `projects.ts` | list, create, update, remove | Project management |
| `folders.ts` | list, create, update, remove | Folder hierarchy |
| `dailyPlans.ts` | list, create, update | Daily planning |
| `preferences.ts` | get, update | User settings |
| `memories.ts` | list, create, remove | AI memory management |
| `staging.ts` | list, accept, reject | AI suggestion workflow |
| `calendarEvents.ts` | list, create, update, remove | Calendar management |
| `noteLinks.ts` | list, create, remove | Note linking |
| `savedFilters.ts` | list, create, remove | Filter persistence |
| `templates.ts` | list, create, update, remove | Note templates |
| `tags.ts` | list, create, remove | Tag management |
| `auth.ts` | Authentication logic | User sessions via @convex-dev/auth |
| `ai.ts` | AI action functions | Chat, extraction, planning |
| `http.ts` | HTTP endpoint definitions | External API access |
| `users.ts` | User queries | Profile management |

### 1.5 Auth Provider Setup (In Convex Dashboard)

For user login, configure at least one auth provider in Convex:

**Option A — GitHub OAuth (Recommended, already connected in Replit):**
1. In Convex dashboard → Settings → Authentication
2. Add GitHub provider
3. Create a GitHub OAuth App at [https://github.com/settings/developers](https://github.com/settings/developers)
4. Set callback URL to: `https://your-deployment.convex.site/api/auth/callback/github`
5. Copy Client ID and Client Secret into Convex

**Option B — Email/Password (Simplest):**
1. In Convex dashboard → Settings → Authentication
2. Enable the built-in email/password provider
3. No external setup needed

**Option C — Google OAuth:**
1. Create OAuth credentials at [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. Set callback URL to: `https://your-deployment.convex.site/api/auth/callback/google`
3. Copy Client ID and Client Secret into Convex

### 1.6 Environment Variables to Set in Convex

In the Convex dashboard → Settings → Environment Variables, add:

| Variable | Value | Purpose |
|---|---|---|
| `SITE_URL` | Your Vercel deployment URL | Auth redirects |

---

## PART 2: VERCEL SETUP

### 2.1 Create Your Account

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up (GitHub SSO recommended)

### 2.2 Create Two Projects

**Project 1 — Main App:**

| Setting | Value |
|---|---|
| Project Name | `tempo-web` |
| Framework Preset | Vite |
| Root Directory | `artifacts/tempo` |
| Build Command | `pnpm run build` |
| Output Directory | `dist/public` |
| Required Env Vars | `PORT=3000`, `BASE_PATH=/` |

**Project 2 — Marketing Site:**

| Setting | Value |
|---|---|
| Project Name | `tempo-marketing` |
| Framework Preset | Vite |
| Root Directory | `artifacts/tempo-marketing` |
| Build Command | `pnpm run build` |
| Output Directory | `dist/public` |
| Required Env Vars | `PORT=3000`, `BASE_PATH=/tempo-marketing/` |

### 2.3 Get Your Credentials

| Credential | Where to Find It | Format |
|---|---|---|
| **VERCEL_TOKEN** | [vercel.com/account/tokens](https://vercel.com/account/tokens) → Create Token (name: `replit-deploy`) | `vercel_abc123...` |
| **VERCEL_ORG_ID** | Account → Settings → General → "Vercel ID" at bottom | `team_abc123...` |
| **VERCEL_PROJECT_ID** (app) | tempo-web project → Settings → General → "Project ID" | `prj_abc123...` |
| **VERCEL_MARKETING_PROJECT_ID** | tempo-marketing project → Settings → General → "Project ID" | `prj_def456...` |

### 2.4 Environment Variables to Set in Vercel

For each Vercel project, add these in Settings → Environment Variables:

**tempo-web (main app):**

| Variable | Value | Environments |
|---|---|---|
| `VITE_CONVEX_URL` | Your Convex deployment URL | Production, Preview, Development |

**tempo-marketing (marketing site):**

| Variable | Value | Environments |
|---|---|---|
| `VITE_API_URL` | Your API server URL (or Convex URL) | Production, Preview, Development |

### 2.5 Custom Domain (Optional)

If you have a domain (e.g., `tempo.app`):
1. In Vercel → tempo-web project → Settings → Domains
2. Add `app.tempo.app` (or your preferred subdomain)
3. Add the DNS records Vercel shows you
4. For marketing: add `tempo.app` (root) or `www.tempo.app`

---

## PART 3: AI / LLM PROVIDER

### 3.1 Current Setup

The app has 6 AI-powered features:

| Feature | What It Does |
|---|---|
| **AI Chat** | Conversational ADHD-friendly planning assistant |
| **Task Extraction** | Pulls structured tasks from "brain dump" text |
| **Task Chunking** | Breaks large tasks into 10-30 minute subtasks |
| **Task Prioritization** | Reorders tasks by urgency and energy level |
| **Daily Plan Generation** | Creates a structured daily schedule |
| **Voice Transcription** | Audio-to-text (Whisper-compatible) |

### 3.2 Current Provider: Ollama Cloud

Currently configured with Ollama Cloud. The architecture is provider-agnostic — it uses the OpenAI-compatible API format (`/v1/chat/completions`), so switching providers only requires changing environment variables.

### 3.3 Credentials Currently Stored

| Variable | Status |
|---|---|
| `OLLAMA_API_KEY` | ✅ Stored in Replit Secrets |
| `OLLAMA_API_URL` | ✅ Set to `https://api.ollama.com` |
| `OLLAMA_MODEL` | ✅ Set to `llama3.1` |

### 3.4 To Switch Providers Later

When you find your preferred open-source model/provider, just update these three values:

| Provider | API URL | Model Example |
|---|---|---|
| Ollama Cloud | `https://api.ollama.com` | `llama3.1`, `mistral`, `mixtral` |
| Ollama Local | `http://localhost:11434` | `llama3.1` |
| Together AI | `https://api.together.xyz` | `meta-llama/Llama-3.1-70B-Instruct` |
| Groq | `https://api.groq.com/openai` | `llama-3.1-70b-versatile` |
| OpenRouter | `https://openrouter.ai/api` | `meta-llama/llama-3.1-70b-instruct` |
| OpenAI | `https://api.openai.com` | `gpt-4o`, `gpt-4o-mini` |
| Anthropic (via proxy) | Varies | `claude-3.5-sonnet` |

No code changes needed — just update the environment variables.

---

## PART 4: WHAT TO BRING BACK TO THE AGENT

Once you've created the Convex and Vercel accounts/projects, provide these credentials:

### Minimum to Get Started
```
Convex URL:          https://your-deployment.convex.cloud
Convex Deploy Key:   prod:your-deploy-key-here
```

### For Full Deployment
```
Vercel Token:              vercel_your-token-here
Vercel Org ID:             team_your-org-id
Vercel Project ID (app):   prj_your-app-project-id
Vercel Project ID (mktg):  prj_your-marketing-project-id
```

### Checklist

- [ ] Convex account created at dashboard.convex.dev
- [ ] Convex project named `tempo` created
- [ ] Convex deployment URL copied
- [ ] Convex deploy key generated and copied
- [ ] (Optional) Auth provider configured in Convex
- [ ] Vercel account created at vercel.com
- [ ] Vercel project `tempo-web` created with Vite preset
- [ ] Vercel project `tempo-marketing` created with Vite preset
- [ ] Vercel API token generated
- [ ] Vercel Org ID copied
- [ ] Both Vercel Project IDs copied
- [ ] Environment variables set in each Vercel project

---

## PART 5: WHAT THE AGENT WILL DO WITH THESE CREDENTIALS

### With Convex credentials:
1. Deploy the 15-table schema (all pre-written at `tempo-app/convex/schema.ts`)
2. Deploy all serverless functions (queries, mutations, actions)
3. Migrate the frontend from Express REST calls to real-time Convex hooks (`useQuery`, `useMutation`)
4. Set up user authentication with sessions
5. Enable real-time sync across devices

### With Vercel credentials:
1. Configure build pipelines for both projects
2. Deploy the main app and marketing site
3. Set up custom domains (if provided)
4. Configure production environment variables automatically

### Timeline Estimate
| Phase | What | Effort |
|---|---|---|
| Phase 1 | Convex deploy + basic data migration | 1-2 sessions |
| Phase 2 | Frontend migration (REST → Convex hooks) | 2-3 sessions |
| Phase 3 | Vercel deployment + domains | 1 session |
| Phase 4 | Auth integration + beta user migration | 1 session |
| Phase 5 | Expo mobile app setup | 2-3 sessions |

---

## PART 6: CURRENT ARCHITECTURE (For AI Reference)

Feed this section to any AI tool for context about the project.

### Repository Structure
```
TEMPO Monorepo (pnpm workspace)
├── artifacts/
│   ├── tempo/                  ← Main React SPA (Vite + Tailwind + shadcn/ui)
│   │   └── src/pages/          ← 16 pages (see list below)
│   ├── tempo-marketing/        ← Marketing website (7 pages, Anthropic-inspired design)
│   ├── api-server/             ← Express REST API (PostgreSQL + Drizzle ORM)
│   │   └── src/routes/         ← 30+ API endpoints
│   └── mockup-sandbox/         ← Component preview server
├── tempo-app/                  ← Future Convex monorepo structure
│   ├── convex/                 ← Complete schema + all serverless functions
│   ├── apps/web/               ← Next.js web app (scaffolded)
│   └── apps/mobile/            ← Expo mobile app (scaffolded)
├── lib/
│   ├── db/                     ← Drizzle ORM schemas (PostgreSQL)
│   │   └── src/schema/         ← 16 table definitions
│   └── api-spec/               ← OpenAPI specification
└── packages/                   ← Shared utilities
```

### Main App Pages (artifacts/tempo/src/pages/)
| Page | Status | Description |
|---|---|---|
| Dashboard | Working | Home screen with progress ring, stats, upcoming tasks |
| Calendar | Working | Monthly calendar with events and tasks |
| TodayView | Working | Priority-sorted task list for today |
| Inbox | Working | Quick capture + AI "brain dump" extraction |
| Notes | Working | Searchable note list with pinning |
| NoteEditor | Working | Markdown editor with wiki-links, voice, publishing |
| Projects | Working | Project management with colors |
| Chat | Working | AI assistant for ADHD-friendly planning |
| Settings | Working | Preferences (ADHD mode, focus timers, sleep/wake) |
| DailyPlan | Working | AI-generated daily schedule with Accept/Edit/Reject |
| TaskDetail | Working | Full task editor with time blocking, recurrence, AI chunking |
| TaskFilters | Working | Advanced search + saved filter configs |
| NoteTemplates | Working | Template management (built-in + custom) |
| PeriodNotes | Working | Weekly/Monthly/Yearly review notes |
| Onboarding | Working | Multi-step setup wizard |
| PublishedNote | Working | Public read-only note view |

### Current API Endpoints (artifacts/api-server/src/routes/)
- **Auth**: POST /login, GET /me, GET /users (11 beta accounts, all Pro plan)
- **Tasks**: GET/POST /tasks, GET/PATCH/DELETE /tasks/:id, POST /tasks/:id/complete
- **Notes**: GET/POST /notes, GET/PATCH/DELETE /notes/:id, POST /notes/:id/publish
- **Projects**: GET/POST /projects, PATCH/DELETE /projects/:id
- **Folders**: GET/POST /folders, PATCH/DELETE /folders/:id
- **Calendar Events**: GET/POST /calendar-events, GET/PATCH/DELETE /calendar-events/:id
- **Daily Plans**: GET/POST /daily-plans, GET/PATCH /daily-plans/:id
- **AI**: POST /ai/chat, /ai/extract-tasks, /ai/chunk-task, /ai/prioritize, /ai/generate-plan
- **Search**: GET /search (global across notes + tasks)
- **Tags**: GET/POST /tags, DELETE /tags/:id
- **Note Links**: GET/POST /note-links, DELETE /note-links/:id
- **Templates**: GET /templates, GET/POST /note-templates, POST /note-templates/seed
- **Staging**: GET /staging, POST /staging/:id/accept, POST /staging/:id/reject
- **Preferences**: GET/PUT /preferences, POST /onboarding
- **Memories**: GET/POST /memories, DELETE /memories/:id
- **Transcribe**: POST /api/transcribe
- **Health**: GET /healthz

### Migration Path
```
CURRENT:  React SPA → Express REST API → PostgreSQL (Drizzle ORM)
TARGET:   React/Expo → Convex (real-time hooks) → Convex DB
```

The Convex schema and functions already exist. Migration involves:
1. Deploying the Convex backend (schema + functions)
2. Switching frontend from REST (`fetch('/api/tasks')`) to Convex (`useQuery(api.tasks.list)`)
3. Adding Expo for mobile (React Native, shared business logic)
4. Deprecating the Express API server

### Tech Stack Details
- **Frontend**: React 18, Vite, Tailwind CSS, shadcn/ui, Framer Motion, wouter (routing)
- **Backend**: Express.js, Drizzle ORM, PostgreSQL
- **AI**: OpenAI-compatible API (currently Ollama Cloud, swappable)
- **State**: TanStack React Query (REST), will become Convex real-time hooks
- **UI**: Mobile-first dark theme, bottom tab navigation, ADHD-optimized

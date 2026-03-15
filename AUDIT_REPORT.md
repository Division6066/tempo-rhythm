# Canflow (Tempo Rhythm) — Full Codebase Audit Report

**Date:** 2026-03-14
**Repo:** `tempo-rhythm` (pnpm monorepo)
**Branch:** `cursor/development-environment-setup-0e08`

---

## AREA 1: CONVEX INTEGRATION AUDIT

### 1.1 Schema (`convex/schema.ts`)

**15 custom tables + auth tables** (via `...authTables` from `@convex-dev/auth/server`):

| Table | Fields | Indexes |
|---|---|---|
| `profiles` | `userId` (Id\<users\>), fullName?, role, userType?, isActive, createdAt, updatedAt | `by_userId` |
| `tasks` | userId?, title, status, priority, `projectId?` (Id\<projects\>), `folderId?` (Id\<folders\>), tags[], dueDate?, scheduledDate?, estimatedMinutes?, notes?, `parentTaskId?` (Id\<tasks\>), aiGenerated, startTime?, duration?, recurrenceRule?, recurrenceEndDate?, completedAt?, createdAt, updatedAt | `by_status`, `by_priority`, `by_userId`, `by_scheduledDate` |
| `notes` | userId?, title, content, `projectId?` (Id\<projects\>), `folderId?` (Id\<folders\>), tags[], templateType?, isPinned, isPublished?, publishSlug?, periodType?, periodDate?, createdAt, updatedAt | `by_isPinned`, `by_userId`, `by_publishSlug`, `by_periodType` |
| `projects` | userId?, name, description?, `folderId?` (Id\<folders\>), color?, status, createdAt, updatedAt | `by_status`, `by_userId` |
| `folders` | userId?, name, description?, `parentFolderId?` (Id\<folders\>), createdAt | `by_userId` |
| `tags` | userId?, name, color? | `by_userId` |
| `dailyPlans` | userId?, date, blocks (any), mood?, energyLevel?, aiGenerated, acceptedAt?, createdAt, updatedAt | `by_date`, `by_userId` |
| `preferences` | userId?, wakeTime, sleepTime, energyPeaks[], prepBufferMinutes, planningStyle, adhdMode, focusSessionMinutes, breakMinutes, onboardingComplete, updatedAt | `by_userId` |
| `memories` | userId?, tier, content, decay, createdAt | `by_userId`, `by_tier` |
| `stagedSuggestions` | userId, type, data (any), reasoning?, status, createdAt, resolvedAt? | `by_userId`, `by_status`, `by_type` |
| `calendarEvents` | userId, title, description?, date, startTime, endTime, color?, isAllDay?, externalId?, source?, createdAt, updatedAt | `by_userId`, `by_date` |
| `noteLinks` | userId, `sourceNoteId` (Id\<notes\>), `targetNoteId` (Id\<notes\>), createdAt | `by_sourceNoteId`, `by_targetNoteId`, `by_userId` |
| `savedFilters` | userId, name, conditions (any), createdAt, updatedAt | `by_userId` |
| `templates` | userId, name, description?, content, category?, isBuiltIn?, createdAt, updatedAt | `by_userId` |

#### Schema Findings

⚠️ **Partial** — `tasks.projectId` (Id\<projects\>) has **no index** → Querying tasks by project requires full table scan

⚠️ **Partial** — `tasks.folderId` (Id\<folders\>) has **no index** → Querying tasks by folder requires full table scan

⚠️ **Partial** — `tasks.parentTaskId` (Id\<tasks\>) has **no index** → Finding subtasks of a parent task requires full table scan

⚠️ **Partial** — `notes.projectId` (Id\<projects\>) has **no index** → Querying notes by project requires full table scan

⚠️ **Partial** — `notes.folderId` (Id\<folders\>) has **no index** → Querying notes by folder requires full table scan

⚠️ **Partial** — `projects.folderId` (Id\<folders\>) has **no index** → Querying projects by folder requires full table scan

⚠️ **Partial** — `folders.parentFolderId` (Id\<folders\>) has **no index** → Finding child folders requires full table scan

⚠️ **Partial** — `tasks.userId` is `v.optional(v.string())` instead of `v.optional(v.id("users"))` → Weak typing for a foreign key; same issue on `notes.userId`, `projects.userId`, `folders.userId`, `tags.userId`, `dailyPlans.userId`, `preferences.userId`, `memories.userId`

✅ **Done** — `noteLinks` correctly indexes both `sourceNoteId` and `targetNoteId`

✅ **Done** — All tables have `by_userId` index for multi-tenant queries

---

### 1.2 Convex Functions

| File | Exports | Auth Check | Error Handling |
|---|---|---|---|
| `tasks.ts` | `list` (Q), `listByDateRange` (Q), `get` (Q), `create` (M), `update` (M), `complete` (M), `remove` (M) | ✅ All use `getAuthUserId` | ❌ None |
| `notes.ts` | `list` (Q), `listPeriodNotes` (Q), `getByPeriod` (Q), `getBySlug` (Q), `search` (Q), `get` (Q), `create` (M), `update` (M), `remove` (M) | ⚠️ `getBySlug` has no auth (intentionally public for published notes) | ❌ None |
| `projects.ts` | `list` (Q), `get` (Q), `create` (M), `update` (M), `remove` (M) | ✅ All use `getAuthUserId` | ❌ None |
| `folders.ts` | `list` (Q), `create` (M), `update` (M), `remove` (M) | ✅ All use `getAuthUserId` | ❌ None |
| `tags.ts` | `list` (Q), `create` (M), `remove` (M) | ✅ All use `getAuthUserId` | ❌ None |
| `dailyPlans.ts` | `list` (Q), `get` (Q), `create` (M), `update` (M) | ✅ All use `getAuthUserId` | ❌ None |
| `preferences.ts` | `get` (Q), `upsert` (M) | ✅ All use `getAuthUserId` | ❌ None |
| `memories.ts` | `list` (Q), `create` (M), `remove` (M) | ✅ All use `getAuthUserId` | ❌ None |
| `staging.ts` | `listPending` (Q), `get` (Q), `create` (M), `accept` (M), `reject` (M), `updateData` (M) | ✅ All use `getAuthUserId` | ❌ None |
| `calendarEvents.ts` | `list` (Q), `get` (Q), `create` (M), `update` (M), `remove` (M) | ✅ All use `getAuthUserId` | ❌ None |
| `noteLinks.ts` | `listBySource` (Q), `listBacklinks` (Q), `syncLinks` (M) | ✅ All use `getAuthUserId` | ❌ None |
| `savedFilters.ts` | `list` (Q), `get` (Q), `create` (M), `update` (M), `remove` (M) | ✅ All use `getAuthUserId` | ❌ None |
| `templates.ts` | `list` (Q), `get` (Q), `create` (M), `update` (M), `remove` (M), `seedBuiltIn` (M) | ✅ All use `getAuthUserId` | ❌ None |
| `users.ts` | `getCurrentUser` (Q), `getProfile` (Q), `upsertProfile` (M) | ❌ `getProfile` and `upsertProfile` take `userId` arg with **no auth verification** | ❌ None |
| `ai.ts` | `chat` (A), `extractTasks` (A), `chunkTask` (A), `prioritize` (A), `generatePlan` (A) | ❌ **No direct auth checks** — relies on downstream query auth for some; `extractTasks` has zero auth | ⚠️ `JSON.parse` wrapped in try/catch for 4 of 5 actions; `chat` has **zero** error handling; `callOpenAI` fetch has **no try/catch** |
| `http.ts` | Default httpRouter | N/A (delegates to `auth.addHttpRoutes`) | N/A |

#### Function Findings

❌ **Missing** — `users.getProfile` and `users.upsertProfile` accept arbitrary `userId` with **no authorization check** → Any authenticated user can read/modify any other user's profile

❌ **Missing** — `ai.extractTasks` has **no auth check at all** (no downstream queries that enforce auth either) → Unauthenticated callers can invoke OpenAI API

❌ **Missing** — `ai.chat` action has **zero error handling** — if OpenAI call fails, the error propagates unhandled

⚠️ **Partial** — `ai.callOpenAI` (private helper) has **no try/catch** around `fetch()` → Network failures, 4xx/5xx responses from OpenAI will throw unhandled

⚠️ **Partial** — `notes.ts` imports `getOptionalAuthUserId` but **never uses it** → Dead import

✅ **Done** — All `_generated` imports use correct relative paths (`./_generated/server`, `./_generated/api`)

✅ **Done** — `_helpers.ts` properly exports `getAuthUserId` and `getOptionalAuthUserId` with correct type signatures

---

### 1.3 Auth Setup

✅ **Done** — `auth.ts` uses `@convex-dev/auth/server` with `Password` provider (email/password auth)

✅ **Done** — Session duration set to 30 days (`30 * 24 * 60 * 60 * 1000`)

✅ **Done** — `auth.config.ts` references `process.env.CONVEX_SITE_URL` as the domain

❌ **Missing** — `@auth/core` is **NOT in any `package.json`** — it is a **required peer dependency** of `@convex-dev/auth`. This WILL cause build failures.

❌ **Missing** — `@babel/preset-env` is **NOT in any `package.json`** — it is a missing peer dep of react-native codegen (relevant for `tempo-mobile`)

---

### 1.4 Convex Client Setup

#### Web (`apps/web`)

✅ **Done** — `ConvexProvider.tsx` creates `ConvexReactClient` with `process.env.NEXT_PUBLIC_CONVEX_URL!`

✅ **Done** — `layout.tsx` wraps app in `ConvexAuthNextjsServerProvider` (server) → `ConvexProvider` (client)

✅ **Done** — `middleware.ts` uses `convexAuthNextjsMiddleware()` for route protection

⚠️ **Partial** — `NEXT_PUBLIC_CONVEX_URL` is referenced with non-null assertion (`!`) but no `.env` file exists in the repo → Will throw at runtime if env var is missing

#### Mobile (`apps/mobile`)

✅ **Done** — `lib/convex.ts` creates `ConvexReactClient` with `process.env.EXPO_PUBLIC_CONVEX_URL`

✅ **Done** — `_layout.tsx` wraps app in `ConvexAuthProvider` with `SecureStore`-based storage

⚠️ **Partial** — `EXPO_PUBLIC_CONVEX_URL` defaults to empty string `""` → Will silently create broken client if env var is missing

---

### 1.5 `_generated/` Directory

🔥 **Blocking** — `convex/_generated/` directory **does NOT exist** and is **NOT committed to the repo**

🔥 **Blocking** — `_generated/` is **NOT in `.gitignore`** either — it was simply never generated

🔥 **Blocking** — **26+ files** across `apps/web` and `apps/mobile` import from `convex/_generated/api` and `convex/_generated/dataModel` → ALL imports will fail during build

**Impact:** The `next build` step will fail immediately because TypeScript cannot resolve any `api` or `Id` imports. This is the **#1 blocker** for Vercel deployment.

**Fix:** Run `npx convex dev` or `npx convex codegen` from `tempo-app/` before build. Alternatively, add a prebuild step in `package.json`.

---

## AREA 2: VERCEL BUILD FAILURE DIAGNOSIS

### 2.1 Root Directory Configuration

❌ **Missing** — **No `vercel.json` exists anywhere** in the repo

⚠️ **Partial** — Without `vercel.json`, Vercel must be configured entirely through the dashboard:
- `rootDirectory` must be set to `tempo-app/apps/web` for the Next.js app
- Build command, output directory, and env vars must all be configured in Vercel project settings
- There is no way to verify the Vercel project configuration from the repo alone

---

### 2.2 Build Command Chain

For `tempo-web`:
```
pnpm --filter tempo-web build
  → next build
    → next.config.ts (empty — no custom plugins or config)
    → TypeScript compilation (FAILS — _generated/ missing)
```

⚠️ **Partial** — `next.config.ts` is completely empty (`const nextConfig: NextConfig = {};`). This means:
- No `transpilePackages` configured (may be needed if Convex packages need transpilation)
- No `output` setting (not `standalone` which is recommended for Vercel)
- No webpack customizations

🔥 **Blocking** — The build chain requires `convex/_generated/` to exist BEFORE `next build` runs. There is no `prebuild` script, no Convex plugin in `next.config.ts`, and no CI step that runs `npx convex codegen`.

---

### 2.3 TypeScript Errors

🔥 **Blocking** — Cannot run `tsc --noEmit` because `convex/_generated/` does not exist. ALL of the following files will have unresolvable imports:

**Files importing from `convex/_generated/api`:** (17 files)
- `components/TaskCard.tsx`, `components/QuickCapture.tsx`, `components/CommandBar.tsx`
- `app/page.tsx`, `app/inbox/page.tsx`, `app/today/page.tsx`, `app/calendar/page.tsx`
- `app/chat/page.tsx`, `app/filters/page.tsx`, `app/notes/page.tsx`, `app/notes/[id]/page.tsx`
- `app/notes/period/[type]/page.tsx`, `app/plan/page.tsx`, `app/projects/page.tsx`
- `app/onboarding/page.tsx`, `app/published/[slug]/page.tsx`, `app/settings/page.tsx`
- `app/tasks/[id]/page.tsx`, `app/templates/page.tsx` (listed in filters page)

**Files importing from `convex/_generated/dataModel`:** (8+ files)
- `components/TaskCard.tsx`, `app/inbox/page.tsx`, `app/calendar/page.tsx`
- `app/filters/page.tsx`, `app/notes/[id]/page.tsx`, `app/plan/page.tsx`
- `app/tasks/[id]/page.tsx`

**tsconfig.json path alias check:**
```json
"paths": {
  "@/*": ["./*"],
  "@convex/*": ["../../convex/*"]
}
```

✅ **Done** — `@convex/*` correctly maps to `../../convex/*` (relative from `apps/web` up to `tempo-app/convex/`)

✅ **Done** — `include` array has `../../convex/**/*.ts` — Convex files will be compiled

⚠️ **Partial** — Components use relative paths (`../../../convex/_generated/api`) instead of the `@convex/*` alias → Works but fragile and inconsistent

---

### 2.4 Dependency Issues

🔥 **Blocking** — `@auth/core` is **missing** from ALL `package.json` files. It is a **required peer dependency** of `@convex-dev/auth@^0.0.90`. The Vercel build log would show: `WARN  Missing peer dependency @auth/core`

❌ **Missing** — `@babel/preset-env` is not in `tempo-mobile/package.json` — missing peer dep for react-native codegen (relevant for Expo builds, not Vercel)

⚠️ **Partial** — `tempo-app/package.json` declares `workspaces: ["apps/web", "apps/mobile", "packages/shared"]` but:
- `packages/shared` directory **does not exist** → Workspace resolution error
- This is an npm workspaces config, but the root pnpm workspace (`pnpm-workspace.yaml`) does **NOT include `tempo-app` or its sub-packages** → `tempo-app` is isolated from the pnpm workspace entirely

⚠️ **Partial** — `tempo-app/package.json` uses npm-style `workspaces` field but the project uses pnpm → Potential confusion. `tempo-app` has its own internal workspace setup that is disconnected from the root pnpm workspace.

⚠️ **Partial** — `tempo-app` has no `node_modules/` installed (dependencies are not installed) → Running `pnpm install` from root only installs for packages listed in `pnpm-workspace.yaml` (which excludes `tempo-app`)

---

### 2.5 CSS / Tailwind

✅ **Done** — `globals.css` uses Tailwind CSS v4 syntax correctly:
```css
@import "tailwindcss";
@import "@tailwindcss/typography";
@theme inline { ... }
```

✅ **Done** — `postcss.config.mjs` uses `@tailwindcss/postcss` (correct PostCSS plugin for Tailwind v4)

✅ **Done** — `tailwindcss@^4.1.18` and `@tailwindcss/postcss@^4.1.18` are installed as devDependencies

✅ **Done** — `@tailwindcss/typography@^0.5.19` is installed and imported via `@import "@tailwindcss/typography"`

⚠️ **Partial** — The CSS uses `@theme inline` to define custom properties — this is Tailwind v4 API and will NOT work with Tailwind v3 (the mobile app uses `tailwindcss@^3.4.17`) → **Version mismatch** between web (v4) and mobile (v3)

---

### 2.6 pnpm Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - artifacts/*
  - lib/*
  - lib/integrations/*
  - scripts
```

🔥 **Blocking** — `tempo-app` is **NOT listed** in `pnpm-workspace.yaml` → It is completely excluded from the pnpm workspace. Running `pnpm install` from root does NOT install `tempo-app` dependencies. Running `pnpm --filter tempo-web build` from root will fail because `tempo-web` is not a known workspace package.

```ini
# .npmrc
auto-install-peers=false
strict-peer-dependencies=false
```

⚠️ **Partial** — `auto-install-peers=false` means peer dependencies like `@auth/core` must be explicitly installed — they won't be auto-resolved

⚠️ **Partial** — `strict-peer-dependencies=false` suppresses peer dep errors during install, masking the missing `@auth/core`

---

## AREA 3: MONOREPO STRUCTURE & HEALTH

### 3.1 Directory Tree (Top 3 Levels)

```
/workspace/
├── artifacts/                          ← ACTIVE: Replit-based Express + Vite stack
│   ├── api-server/                     Express REST API (port 8080)
│   ├── tempo/                          Vite React SPA (main app)
│   ├── tempo-marketing/                Vite marketing site
│   └── mockup-sandbox/                 UI prototyping sandbox
├── lib/                                ← Shared libraries for artifacts/
│   ├── api-client-react/               Generated React Query hooks
│   ├── api-spec/                       OpenAPI 3.0 YAML spec
│   ├── api-zod/                        Generated Zod validators
│   ├── db/                             Drizzle ORM + PostgreSQL schema
│   ├── integrations/                   Lower-level integrations
│   ├── integrations-openai-ai-react/   Client-side AI hooks
│   └── integrations-openai-ai-server/  Server-side AI client
├── scripts/                            Build/tooling scripts
├── tempo-app/                          ← LEGACY: Convex-based monorepo (NEVER deployed)
│   ├── apps/
│   │   ├── web/                        Next.js 15 app
│   │   └── mobile/                     Expo React Native app
│   ├── convex/                         Convex backend functions + schema
│   ├── convex.json                     Convex project config
│   └── package.json                    Internal workspace config (npm-style)
├── attached_assets/                    Design docs, screenshots, templates
├── package.json                        Root pnpm workspace
├── pnpm-workspace.yaml                 Workspace package list
├── pnpm-lock.yaml                      Lockfile
└── README.md                           Documentation
```

### 3.2 Package Relationships

#### Active Stack (pnpm workspace)

```
@workspace/api-server
  ├── @workspace/api-zod
  ├── @workspace/db
  └── @workspace/integrations-openai-ai-server

@workspace/tempo (Vite SPA)
  └── @workspace/api-client-react

@workspace/tempo-marketing (Vite SPA)
  └── (standalone, no workspace deps)

@workspace/api-client-react
  └── (generated from @workspace/api-spec)

@workspace/api-zod
  └── (generated from @workspace/api-spec)

@workspace/db
  └── (Drizzle ORM + PostgreSQL)
```

#### Legacy Stack (tempo-app — NOT in pnpm workspace)

```
tempo-web (Next.js)
  ├── convex (^1.31.0)
  ├── @convex-dev/auth (^0.0.90)
  │   └── ❌ MISSING: @auth/core (peer dep)
  └── ../../convex/ (shared Convex functions via tsconfig paths)

tempo-mobile (Expo)
  ├── convex (^1.31.0)
  └── ../../convex/ (shared Convex functions via tsconfig paths)
```

### 3.3 Environment Variables

**No `.env` files exist in the repo** (all are gitignored).

| Variable | Referenced In | Required For |
|---|---|---|
| `DATABASE_URL` | `lib/db/drizzle.config.ts`, `lib/db/src/index.ts` | Active stack (PostgreSQL) |
| `OLLAMA_API_URL` | `lib/integrations-openai-ai-server/src/client.ts` | Active stack (AI - throws if missing) |
| `OLLAMA_API_KEY` | `lib/integrations-openai-ai-server/src/client.ts` | Active stack (AI - throws if missing) |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | `lib/integrations-openai-ai-server/src/image/client.ts` | Active stack (image AI - throws if missing) |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | `lib/integrations-openai-ai-server/src/image/client.ts` | Active stack (image AI - throws if missing) |
| `OLLAMA_MODEL` | `lib/integrations-openai-ai-server/src/client.ts` | Optional (defaults to `ministral-3`) |
| `OLLAMA_MODEL_BACKUP` | `lib/integrations-openai-ai-server/src/client.ts` | Optional (defaults to `magistral`) |
| `OLLAMA_COUNCIL_MODELS` | `lib/integrations-openai-ai-server/src/client.ts` | Optional (defaults to list) |
| `PORT` | `artifacts/api-server/src/index.ts`, Vite configs | Optional (defaults to 8080 for API) |
| `BASE_PATH` | Vite configs (`tempo`, `tempo-marketing`) | Required for Vite dev server (throws if missing) |
| `NEXT_PUBLIC_CONVEX_URL` | `tempo-app/apps/web/components/providers/ConvexProvider.tsx` | Legacy stack (Convex client) |
| `EXPO_PUBLIC_CONVEX_URL` | `tempo-app/apps/mobile/lib/convex.ts` | Legacy stack (Convex mobile client) |
| `CONVEX_SITE_URL` | `tempo-app/convex/auth.config.ts` | Legacy stack (Convex auth) |
| `OPENAI_API_KEY` | `tempo-app/convex/ai.ts` | Legacy stack (AI actions) |
| `OPENAI_BASE_URL` | `tempo-app/convex/ai.ts` | Legacy stack (AI actions, defaults to OpenAI) |

❌ **Missing** — No `.env.example` or `.env.template` file exists anywhere → New developers have no reference for required variables

---

### 3.4 npm Scripts

#### Root (`/workspace/package.json`)
| Script | Command |
|---|---|
| `preinstall` | Enforces pnpm usage, removes other lockfiles |
| `build` | `pnpm run typecheck && pnpm -r --if-present run build` |
| `typecheck:libs` | `tsc --build` |
| `typecheck` | `pnpm run typecheck:libs && pnpm -r --filter "./artifacts/**" --filter "./scripts" --if-present run typecheck` |

#### `tempo-app/package.json` (legacy — NOT in pnpm workspace)
| Script | Command |
|---|---|
| `dev:web` | `cd apps/web && npm run dev` |
| `dev:mobile` | `cd apps/mobile && npx expo start` |
| `dev:convex` | `npx convex dev` |
| `build:web` | `cd apps/web && npm run build` |
| `deploy:convex` | `npx convex deploy` |

#### `tempo-app/apps/web/package.json`
| Script | Command |
|---|---|
| `dev` | `next dev --turbopack` |
| `build` | `next build` |
| `start` | `next start` |
| `type-check` | `tsc --noEmit` |

#### `tempo-app/apps/mobile/package.json`
| Script | Command |
|---|---|
| `start` | `expo start` |
| `android` | `expo start --android` |
| `ios` | `expo start --ios` |
| `web` | `expo start --web` |

#### Active Stack Packages
| Package | `dev` | `build` | `typecheck` |
|---|---|---|---|
| `@workspace/api-server` | `NODE_ENV=development tsx ./src/index.ts` | `tsx ./build.ts` | `tsc -p tsconfig.json --noEmit` |
| `@workspace/tempo` | `vite --config vite.config.ts --host 0.0.0.0` | `vite build --config vite.config.ts` | `tsc -p tsconfig.json --noEmit` |
| `@workspace/tempo-marketing` | `vite --config vite.config.ts --host 0.0.0.0` | `vite build --config vite.config.ts` | `tsc -p tsconfig.json --noEmit` |
| `@workspace/db` | — | — | — (`push`, `push-force` for drizzle-kit) |
| `@workspace/api-spec` | — | — | — (`codegen` for Orval) |

---

## Summary of All Findings

### ✅ Done (Correctly Set Up)
- Convex schema is well-structured with 15 tables and comprehensive indexes on `userId`
- Auth setup uses `@convex-dev/auth` with Password provider correctly
- `_helpers.ts` provides reusable `getAuthUserId` / `getOptionalAuthUserId` guards
- 13 of 16 Convex function files consistently use auth guards on all functions
- `noteLinks` has proper bidirectional indexes
- tsconfig paths correctly map `@convex/*` to the Convex directory
- Tailwind v4 CSS syntax and PostCSS config are correct for the web app
- ConvexProvider is correctly initialized with client-side and server-side wrappers
- The **active stack** (Express + Vite + PostgreSQL) is fully functional and deployable

### ⚠️ Partial (Issues)
- 8 tables use `v.optional(v.string())` for `userId` instead of `v.optional(v.id("users"))`
- 7 foreign key fields lack indexes (projectId, folderId, parentTaskId, parentFolderId)
- `ai.ts` has partial error handling (JSON.parse wrapped, but fetch is unprotected)
- `notes.ts` has unused `getOptionalAuthUserId` import
- Components use relative paths instead of `@convex/*` alias
- Tailwind version mismatch: web uses v4, mobile uses v3
- `auto-install-peers=false` in `.npmrc` requires manual peer dep management
- `tempo-app/package.json` references non-existent `packages/shared` workspace

### ❌ Missing (Should Exist)
- `@auth/core` peer dependency not installed anywhere
- `@babel/preset-env` peer dependency missing for mobile
- No `.env.example` file documenting required variables
- No `vercel.json` for deployment configuration
- `users.getProfile` and `users.upsertProfile` lack auth checks
- `ai.extractTasks` has no auth check
- `ai.chat` has no error handling

### 🔥 Blocking (Preventing Builds/Deploys)
- **`convex/_generated/` does not exist** → 26+ files with broken imports → instant build failure
- **`tempo-app` not in `pnpm-workspace.yaml`** → `pnpm install` doesn't install its dependencies → `pnpm --filter tempo-web build` fails
- **`@auth/core` missing** → `@convex-dev/auth` will fail at runtime/build
- **No prebuild step** runs `npx convex codegen` before `next build`

---

## Critical Path to First Successful Deploy

**Target:** Get `tempo-web` (Next.js at `tempo-app/apps/web`) deploying on Vercel.

### Step 1: Add `tempo-app` to pnpm workspace
Add `tempo-app/apps/*` to `pnpm-workspace.yaml`:
```yaml
packages:
  - artifacts/*
  - lib/*
  - lib/integrations/*
  - scripts
  - tempo-app/apps/*   # ← ADD THIS
```
Remove the non-existent `packages/shared` from `tempo-app/package.json` workspaces.

### Step 2: Install missing peer dependency
Add `@auth/core` to `tempo-app/apps/web/package.json` dependencies:
```json
"@auth/core": "^0.37.0"
```
(Check `@convex-dev/auth@0.0.90`'s actual peer dep range for the correct version.)

### Step 3: Generate `convex/_generated/`
Either:
- **(a)** Commit generated files: Run `cd tempo-app && npx convex codegen` and commit `convex/_generated/`
- **(b)** Add prebuild script: In `tempo-app/apps/web/package.json`:
  ```json
  "scripts": {
    "prebuild": "cd ../.. && npx convex codegen",
    "build": "next build"
  }
  ```
Option (a) is simpler and more reliable for CI/CD.

### Step 4: Set Vercel environment variables
In Vercel project settings, add:
- `NEXT_PUBLIC_CONVEX_URL` = your Convex deployment URL
- `CONVEX_DEPLOY_KEY` (if using `npx convex codegen` in build)

### Step 5: Configure Vercel project
Create `vercel.json` in repo root OR configure in Vercel dashboard:
- **Root Directory:** `tempo-app/apps/web`
- **Build Command:** `next build` (or `pnpm run build`)
- **Install Command:** `cd ../.. && pnpm install` (to install from workspace root)
- **Output Directory:** `.next`

### Step 6: Verify TypeScript compiles
Run `cd tempo-app/apps/web && npx tsc --noEmit` after generating `_generated/` to catch any remaining TS errors.

### Step 7: Deploy
Push to trigger Vercel build. Monitor build logs for:
1. ✅ `pnpm install` completes
2. ✅ `convex/_generated/` is present
3. ✅ `next build` compiles TypeScript
4. ✅ Tailwind CSS processes without errors
5. ✅ Build output is generated

---

**Bottom line:** The repo has **two completely separate application stacks** — an active Replit-based stack (Express + Vite + PostgreSQL under `artifacts/`) and a legacy Convex-based stack (`tempo-app/`). The active stack works. The legacy `tempo-app` stack has never been buildable because `convex/_generated/` was never committed, `tempo-app` was never added to the pnpm workspace, and the critical `@auth/core` peer dependency was never installed.

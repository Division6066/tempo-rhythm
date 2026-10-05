# Tempo Flow: Technical Requirements (TRD)

> **Last updated 2026-10-03** (IDT) · Written by Grok Bot from the sources below · Decisions are Amit's.
> **Sources:** factory-v2 product docs v2 (20 Sep 2026): `02-TRD.md` with its 30 Sep decision update · Basic Memory notes `Factory Decisions — 2026-09-18`, `Factory merge and deploy policy` (30 Sep), `Weekend factory plan 2026-10-02`, `Weekend goals 2026-10-02`, `Next week — factory decisions and research 2026-10-03` · plan-v3 (`WEEKEND-PLAN.md`, status report 3 Oct 14:15) and plan-v4 (`PLAN-FINAL.md`, `INVENTORY.md`, `REVIEWER-OPTIONS.md`) · the repo on `integration` at `5b9675e` (3 Oct): `package.json`, `apps/*/package.json`, `convex/auth.ts`, `convex/schema.ts`, `.github/workflows/*`, `.env.example`.
> **Markers:** UNKNOWN = not known or not decided. (EXTRAPOLATED) = Grok Bot's own fill, not a decision. Newer Amit decisions win over older sources; conflicts are listed in §11.
> **No secrets here:** env var and secret **names** only.
> **Companion docs:** [PRD](./PRD.md) · [App flow](./APP-FLOW.md) · [UI brief](./UI-BRIEF.md) · [Backend schema](./BACKEND-SCHEMA.md) · [Roadmap](./ROADMAP.md)

## 1. Stack

| Layer | In the repo today (`5b9675e`) | Target (20 Sep, still standing) |
|---|---|---|
| Package manager | **Bun 1.3.9** workspaces (`packageManager: bun@1.3.9`), Turborepo `^2.3.3` | Same. **Bun only; pnpm is never used** (Amit, 20 Sep and 1–3 Oct). |
| Backend | Convex `^1.32.0`, Convex Auth `@convex-dev/auth ^0.0.91`, `@auth/core 0.37.4` | Same |
| Web | `apps/web` (`tempo-rhythm-web`): Next.js `^16.0.0` App Router, React 19.2.3, Tailwind `^4.1.18` | Next.js 16 PWA on Vercel; shadcn primitives |
| Mobile | `apps/mobile` (`tempo-rhythm-mobile`): Expo `~54.0.9`, NativeWind `^4.2.1` | One-to-one native shell (not a WebView) on the newest stable Expo SDK when the shell phase starts, pinned in that ticket |
| Shared packages | `packages/config`, `packages/types`, `packages/ui`, `packages/utils`; Convex code in root `convex/` | Pure TypeScript core at `packages/core/...` (EXTRAPOLATED path; does not exist yet). Whether Tempo moves to the template layout (`packages/backend`, `core`, `ui`): UNKNOWN. |
| Block rendering | none installed | `@json-render/core`, `@json-render/react`, `@json-render/react-native` (Apache-2.0), exact version pinned (v0.19.0 on 20 Sep). Zod validates. |
| Tooling | Biome 2.3.8, `bun test`, Playwright `^1.61.1`, native `fetch` | Same |

## 2. Environments

| | Internal testing ("preview") | Live |
|---|---|---|
| Convex | **`ceaseless-dog-617`** (`SITE_URL=https://preview.tempoflow.dev`) | **`precious-wildcat-890`** (`SITE_URL=https://www.tempoflow.dev`). **Agents never touch it.** |
| Vercel project | `tempo-web` (root `apps/web`); `integration` builds serve `preview.tempoflow.dev` | `tempo-web`, production branch `master`, `www.tempoflow.dev` |
| Branch | `integration` (default branch; every PR targets it) | `master` (only Amit merges) |

- Terms (30 Sep): **preview = internal testing; deploy = live to end users.**
- `preview.tempoflow.dev` has a Vercel protection exception and is public. Other preview URLs ask for the Vercel login; automated tests pass `VERCEL_AUTOMATION_BYPASS_SECRET` (name only).
- A second Vercel project, `tempo-marketing`, exists. Its role: UNKNOWN.
- `tremendous-bass-443` is named as "dev" in the 20 Sep TRD and in [`docs/ENVIRONMENTS.md`](https://github.com/Division6066/tempo-rhythm/blob/integration/docs/ENVIRONMENTS.md). All work since 2 Oct uses `ceaseless-dog-617`. Its current role: UNKNOWN.
- Convex functions don't deploy on merge: `apps/web/vercel.json` runs `next build` only. PR [#506](https://github.com/Division6066/tempo-rhythm/pull/506) (open) adds a test deploy that needs the Actions secret `CONVEX_DEPLOY_KEY_TEST`. Until then the orchestrator deploys `integration` to `ceaseless-dog-617` by hand (`bunx convex deploy` with `CONVEX_DEPLOY_KEY` read from 1Password; key prefix checked as `dev:ceaseless-dog-617`, value never printed).
- **RULE:** never run `convex env list` (it prints values) and never `convex dev --once` against a shared deployment. Never touch `AI_*` env vars on a deployment without Amit.

## 3. Sign-in and sign-up

- **Web: email magic link only** (Amit, 1–2 Oct). `convex/auth.ts` uses Convex Auth with the Auth.js Resend provider: link life 30 min, session 30 days. Sender from `RESEND_FROM_EMAIL` (preview: `noreply@tempoflow.dev`); API key from `AUTH_RESEND_KEY`.
- First sign-in creates the `users` row and a `subscriptionStates` row. A new sign-in method links to the existing live user with the same email.
- **Mobile:** `apps/mobile` still uses password sign-in. OTP vs magic link is undecided ([#425](https://github.com/Division6066/tempo-rhythm/issues/425)); phone sign-in is next week's work.
- **Passkeys:** web reads `NEXT_PUBLIC_ENABLE_PASSKEYS`; `/settings/passkeys` shows "coming soon". No decision covers passkeys: UNKNOWN.
- **Sign-up cap:** 30 on Tempo live and test (reported set on all deployments, 2 Oct). The code at `5b9675e` says "Signup is open. No allowlist, no seat cap" and grants the `max` tier (`convex/lib/entitlements.ts`). How the cap is enforced: UNKNOWN. `.env.example` still lists `BETA_ALLOWLIST_EMAILS`, `BETA_MAX_TESTERS`, `BETA_FOUNDER_EMAIL`.
- **Next week:** approval flow (each sign-up request emails Amit to approve), Turnstile on sign-up (two widgets exist; not wired; hostnames for tempoflow.dev not yet allowed).
- Route guard: `apps/web/proxy.ts` + `apps/web/lib/rootEntry.ts`. Public routes: `/`, `/sign-in`, `/sign-up`, `/terms`, `/privacy`, `/contact`, `/success`, `/api/health`. Everything else redirects to `/sign-in?next=…`.

## 4. AI provider routing (runtime models, names only)

| Lane | Provider and model | Env var | Read by code today? |
|---|---|---|---|
| Text fast | DeepInfra `nvidia/NVIDIA-Nemotron-3.5-Lightning` | `DEEPINFRA_API_KEY` | No |
| Text balanced | DeepInfra `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B` | `DEEPINFRA_API_KEY` | No |
| Text deep (second) | DeepInfra `thinkingmachines/Inkling` | `DEEPINFRA_API_KEY` | No |
| Text failover | Together (zero data retention on) | `TOGETHER_API_KEY` | No |
| STT incl. Hebrew | Deepgram Nova-3 | `DEEPGRAM_API_KEY` | No |
| TTS incl. Hebrew | DeepInfra `ResembleAI/chatterbox-multilingual` | `DEEPINFRA_API_KEY` | No |
| Overrides | whatever `AI_PROVIDER` names (default `gemini`) | `AI_API_KEY`, `AI_PROVIDER`, `AI_MODEL` | Yes, `convex/memories.ts` |
| Dead | cancelled provider | `MISTRAL_API_KEY` | Yes, `convex/lib/ai_router.ts` throws without it |

- Fix ticket: [#412](https://github.com/Division6066/tempo-rhythm/issues/412) (both files call one DeepInfra seam; `AI_*` reads stay as overrides). Order: configure → provider fix → deploy → factory on.
- All model calls run in Convex actions through the seam. Never from a shell. No gateway (OpenRouter is forbidden).
- Gate: a written DeepInfra Service Order before any paid tier.

## 5. Pages with JSON blocks (target)

- A page is one row in `notes`. Blocks are fenced `json tempo` code inside `body`. The convention and schemas are fixed: [Backend schema](./BACKEND-SCHEMA.md) §4.
- Core parses, validates and serialises (pure TypeScript, no I/O). UI holds one catalog and two registries (web and native) (EXTRAPOLATED paths `packages/core/blocks/`, `packages/ui/blocks/`).
- The model never writes to the database. It proposes blocks by `id`; code validates; the user accepts; code writes.
- Not built yet. Six json-render API points are UNKNOWN until the installed version is read (Backend schema §4.6).

## 6. Memory and connectors

- **Memory:** one port (`remember`, `recall`, `context`, `forget`, `export`) with a Convex adapter over the existing `memories` table. Kept as written (Amit, 20 Sep). No outside memory service. `recall` needs a search index on `memories.content` (EXTRAPOLATED; today memories are ranked by salience only). `forget` hard vs soft delete: UNKNOWN (PRD rule says soft delete; the memory spec says forget must be complete).
- **Connectors:** Executor (executor.sh) behind `packages/core/connectors/executor.ts` (EXTRAPOLATED path). Read plus light writes; heavy writes refused; every external write confirmed. Executor's call shape and env var names: UNKNOWN. Not before the current sprint ends.

## 7. Security rules

1. Secrets by name only. Never a value, prefix or fragment in code, issues, PRs, logs or docs.
2. No model call from a shell. Server-side order before any model call: auth → entitlement → quota.
3. Every query and mutation checks `ctx.auth` and filters by `userId`; the server sets `userId` (`requireUser`), never the client.
4. Soft delete everywhere, 30-day grace. Remaining hard deletes at `5b9675e` are defects: `tasks.remove`, `habits.remove`, `goals.remove`, `memories.deleteMemory`, `messages.remove`, `conversations.remove`, `users.remove` (account deletion uses soft delete via `convex/lib/accountDeletion.ts`).
5. BYOK keys are encrypted per user and never returned to the client. No Anthropic key in third-party code.
6. Signed-in screenshots never go on GitHub or public hosts (the repo is public).
7. Credentials live in 1Password. Values move by stdin only; nothing echoed.

## 8. CI, review and the factory

### 8.1 Workflows on `integration`

| Workflow | What it does |
|---|---|
| `ci.yml` (Bun 1.3.9) | Typecheck · Lint · Test · Scans (forbidden-tech, ram-only-audit, design-tokens) · Third-party notices · E2E (Playwright) |
| `security.yml` | Secret scan (gitleaks), secret scan (trufflehog), scanner self-test with a canary fixture |
| `config-guard.yml` | Guards config/CI/security paths (pull_request_target). Config changes go through the config lane and Amit's review. |
| `greptile-gate.yml` | Posts the `greptile-score` status (cron every 10 min plus PR events) |
| `dispatch-router.yml` | Issues labelled `ready` → lane by `area:` label or MUTATES paths; max 2 running per lane. **Paused** |
| `agent-router.yml` | `agent:*` labels → lane |
| `claude.yml` | `@claude` mentions; Claude Code via `anthropics/claude-code-action` and `CLAUDE_CODE_OAUTH_TOKEN` |
| `auto-arm-merge.yml` | Disabled manually. It must never arm a merge into `master`. |

Which checks are required by the `integration` ruleset: the 3 Oct inventory found Greptile, `greptile-score`, Bugbot and Vercel **not** required anywhere; the 2 Oct weekend goals say "Greptile Review" is required. Current state: UNKNOWN until re-read after the org move.

### 8.2 Merge rule

A PR into `integration` merges only when **all** of these hold: CI green (including E2E), secret scan green, the merge-blocking reviewer passes, no open P1/HIGH review comment, change inside the ticket's MUTATES. Auto-merge stays off until the gates of [Roadmap](./ROADMAP.md) §2 are met. Only Amit merges `integration` → `master` and runs live Convex deploys.

### 8.3 Merge-blocking reviewer (conflict, flagged)

- 1–2 Oct (Amit): **Greptile** blocks merges on all repos. Pass = score ≥ 4/5 and no open P1. Its built-in check goes green even at 2/5, so `greptile-gate.yml` computes a separate score status.
- 3 Oct 15:25 (Amit, newer): **disconnect Greptile; Cursor Bugbot is the reviewer for now.** PLAN-FINAL step 6 sets Bugbot up after the org move. Bugbot findings are "neutral" by default; blocking needs "fail on unresolved issues".
- Observed 3 Oct: Greptile reviewed a user-authored PR (#508) but not PRs opened by `claude[bot]` (#525, #547). Cause (dashboard setting?): UNKNOWN.
- Until Bugbot blocking is live, this doc treats Greptile ≥ 4/5 as the gate for PRs it reviews, and holds PRs it doesn't review. Which reviewer counts between now and the switch is Amit's call: UNKNOWN.

### 8.4 Lanes and dispatch

- Lanes (1–2 Oct): **Cursor** = front end and most building; **Claude Code** = backend, sign-in, tests; **Codex** = CI, docs, refactors. Grok Bot = settings and CI through config-lane PRs, never product code. Docs PRs are opened by a Cursor cloud agent.
- Claude runs only through `anthropics/claude-code-action` with `CLAUDE_CODE_OAUTH_TOKEN` (never API rates). Cursor through its API with `CURSOR_API_KEY`. Codex only on the ChatGPT subscription (no OpenAI API key, no `openai/codex-action`).
- Planned (PLAN-FINAL step 5, built but not switched on): a Copilot-based dispatcher (gh-aw if it fits) reading triaged tickets, max 3 per repo, picking lane and mid-tier code model from `factory/models.yml`. Labels added with `GITHUB_TOKEN` don't trigger other workflows, so hand-off happens in the same run.
- A ticket that fails more than 3 times gets `blocked:amit`; tickets that depend on it pause; others continue.
- Code models: mid-tier pricing only; never Fable, Astra, Opus or Soul.

### 8.5 Tests

- Unit: `bun test convex apps/web/lib tests/unit` (root `bun run test`). Typecheck: `bun run --filter tempo-rhythm-web typecheck`.
- E2E: Playwright reads `PLAYWRIGHT_BASE_URL` (default `http://localhost:3000`). Signed-in specs use a storage-state file: `TEMPO_E2E_STORAGE_STATE` (and `TEMPO_E2E_STORAGE_STATE_B` for a second account), pattern in [`tests/e2e/screens/notes.spec.ts`](https://github.com/Division6066/tempo-rhythm/blob/integration/tests/e2e/screens/notes.spec.ts). Local runs may use `TEMPO_E2E_AUTH_BYPASS` / `NEXT_PUBLIC_TEMPO_E2E_AUTH_BYPASS`. The older "#408 magic-link helper" plan is replaced by this pattern.
- A ticket isn't done until its DONE command passes and its diagrams in `docs/diagrams/` are true. Graphify (PyPI `graphifyy`) code graph: version to be pinned in `AGENTS.md`; a CI job will rebuild it on every merge (planned).

## 9. Env var names

| Where | Names |
|---|---|
| Convex (server) | `AUTH_RESEND_KEY`, `RESEND_FROM_EMAIL`, `SITE_URL`, `CONVEX_SITE_URL`, `MISTRAL_API_KEY` (to remove), `AI_API_KEY`, `AI_PROVIDER`, `AI_MODEL`, `DEEPINFRA_API_KEY`, `TOGETHER_API_KEY`, `DEEPGRAM_API_KEY`, `REVENUECAT_WEBHOOK_SECRET`, `POLAR_ACCESS_TOKEN`, `POLAR_SUCCESS_URL`, `MOCK_PAYMENTS` |
| Web (public) | `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_ENABLE_PASSKEYS`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` |
| Deploy / CI | `CONVEX_DEPLOYMENT`, `CONVEX_DEPLOY_KEY`, `CONVEX_DEPLOY_KEY_TEST`, `VERCEL_AUTOMATION_BYPASS_SECRET`, `CLAUDE_CODE_OAUTH_TOKEN`, `CURSOR_API_KEY`, `DISPATCH_PAT` |
| Tests | `PLAYWRIGHT_BASE_URL`, `TEMPO_E2E_STORAGE_STATE`, `TEMPO_E2E_STORAGE_STATE_B`, `TEMPO_E2E_AUTH_BYPASS`, `TEMPO_E2E_PUBLIC_CALENDAR` |
| Legacy in `.env.example` | `BETA_FOUNDER_EMAIL`, `BETA_ALLOWLIST_EMAILS`, `BETA_MAX_TESTERS` |

After the org move (PLAN-FINAL step 2), `CLAUDE_CODE_OAUTH_TOKEN` and `CURSOR_API_KEY` become org secrets; `CONVEX_DEPLOY_KEY`, `VERCEL_AUTOMATION_BYPASS_SECRET` stay per repo.

## 10. Forbidden

OpenRouter or any gateway · Anthropic keys in third-party code · Electron · Firebase, Supabase · Auth0, Clerk, NextAuth, BetterAuth · Stripe SDK direct · Redux, Zustand, Jotai, Recoil, MobX (and json-render's adapters for them) · axios, ky, got · raw DB clients · Tailwind v3 on web · vendor AI SDKs · Notion, Linear, Airtable as product integrations · Composio · FlyonUI · **pnpm** · any code from Memos or Joplin · image generation · stock nag copy and emoji in nags · JSON shown to the user · OpenAI API rates for the factory.
Open conflict: issues [#308](https://github.com/Division6066/tempo-rhythm/issues/308) / [#309](https://github.com/Division6066/tempo-rhythm/issues/309) (Zustand client state) are still open although Zustand is banned. Amit decides.

## 11. Conflicts resolved by newer decisions

| Older source | Newer decision (wins) |
|---|---|
| 20 Sep TRD §2: dev `tremendous-bass-443`, staging `ceaseless-dog-617`, Vercel `tempo-rhythm-web` | 2–3 Oct: dev/preview is **`ceaseless-dog-617`**; prod **`precious-wildcat-890`**; Vercel project is **`tempo-web`** (`tempo-rhythm-web` is the web package name). |
| 20 Sep TRD §1: Convex Auth Password + magic link | 1–2 Oct: **web magic link only** (now in code). |
| 20 Sep TRD: email login needs `RESEND_API_KEY` + `RESEND_FROM_EMAIL` | Code reads **`AUTH_RESEND_KEY`** + `RESEND_FROM_EMAIL`. |
| 20 Sep TRD §8: "PREVIEW merges by agents … three loops a day" | 30 Sep: agents merge into `integration` when all checks pass; preview = `preview.tempoflow.dev`. The loop limit is not restated: UNKNOWN. |
| 20 Sep: review gate not chosen | 1–2 Oct Greptile; 3 Oct 15:25 Bugbot (see §8.3). |
| 18 Sep: "Nothing runs Friday or Saturday" | 3 Oct: build work runs 7 days; no configuration or patching Fri–Sat. `AGENTS.md` and the dispatcher still say "no runs Fri/Sat" and must change (PLAN-FINAL step 6). |
| 16 Sep PRD: Expo 57 | 20 Sep: newest stable SDK at shell start. Repo has Expo `~54.0.9`. |

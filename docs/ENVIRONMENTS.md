# Environment Contract

This document defines the four-mode environment model for Tempo Flow. Every agent, contributor, and tool that touches an env var, Convex deployment, or Vercel project must read this first. Where this file and any other doc disagree, this file wins. See also HARD_RULES §13.

---

## The four modes

| Mode | Purpose | Convex | Vercel | Repo env file | Trust gate |
|---|---|---|---|---|---|
| **Dev** | Coding, immediate local testing | `dev:<your-slug>` (auto via `bun x convex dev`) | N/A (`next dev` locally) | `.env.local` (git-ignored) | May break at any time. Not a QA surface. |
| **Test** | Prove behavior | Dev deployment | Local `next build` + CI | `.env.local` + CI env | CI green + local smoke pass. Not a shareable URL. |
| **Preview** | Branch / PR validation | `preview:<slug>` (target state — not yet provisioned) | Preview URL from PR (disabled as of 2026-06-02; re-enable per §4) | Vercel env table (preview scope) | Agents MUST NOT treat preview as shipped. |
| **Deployment** | Promoted stable surface | `prod:<slug>` | Production domain | Vercel env table (production scope) + Convex dashboard env | Only code that passed preview + explicit human promote. |

---

## Convex: deployments

- **`dev`** — current registry candidate: `dev:tremendous-bass-443` (`https://tremendous-bass-443.convex.cloud`). Every local machine can also get its own `dev:*` slug via `bun x convex dev`.
- **`preview`** — [placeholder — not yet provisioned]. Documented here as the target model. Provisioning is a `human-amit` / `twin` action: Convex dashboard → Project Settings → Deployments → Add preview deployment. Until then, PRs run against the author's `dev` deployment.
- **`staging`** — current registry candidate: `staging:ceaseless-dog-617` (`https://ceaseless-dog-617.convex.cloud`).
- **`prod`** — current production deployment: `prod:precious-wildcat-890` (`https://precious-wildcat-890.eu-west-1.convex.cloud`).

Rule: no agent provisions Convex deployments without an explicit human choice of
team/project. Agents may inspect an existing deployment with an explicit deployment
name on a CLI version that supports it, but must not create, relink, or promote
deployments silently.

Known local CLI state on 2026-06-02:

- The repo-pinned Convex CLI is `1.32.0`; `bunx convex function-spec` fails until `CONVEX_DEPLOYMENT` is set or `bun x convex dev` configures a local dev deployment.
- `npx convex@1.39.1 function-spec --deployment-name=precious-wildcat-890` can inspect the production deployment without writing repo config.
- Before configuring local dev, choose whether this machine should attach to the existing `dev:tremendous-bass-443` project or create a fresh personal `dev:*` deployment.

---

## Vercel: preview policy

Preview builds were disabled on 2026-06-02. To disable via the Vercel dashboard [human-amit action]:

1. Open Vercel → Project `tempo-rhythm-web` → Settings → Git.
2. Set "Ignored Build Step" to: `if [ "$VERCEL_GIT_COMMIT_REF" = "master" ]; then exit 1; else exit 0; fi`
   — or toggle "Deploy Previews" off entirely.
3. Confirm by pushing a throwaway branch and verifying that no preview URL appears on the PR.

Rationale: a broken preview can mask as "tested" when it isn't, or a preview against a dev Convex can leak partial behavior the user reads as real. Until a `preview:*` Convex deployment exists, previews add risk without benefit.

When previews are re-enabled, update this section with the exact dashboard steps taken.

---

## Env var precedence

```
.env.local  (per-workspace, git-ignored)      # highest precedence locally
apps/web/.env.local   > root .env.local        # for web-app scope
apps/mobile/.env.local > root .env.local       # for mobile-app scope
Vercel env vars (production/preview scope)     # deployed web only
Convex dashboard env vars                       # convex/ runtime only
EAS secrets                                     # mobile builds only
.env.example                                    # NEVER a source of values — only names
```

Negative rule: do not create or read `apps/web/.env` or `apps/mobile/.env`. Use `.env.local` only. The root `.gitignore` explicitly ignores `apps/web/.env` and `apps/mobile/.env`.

---

## Scope tags reference

| Tag | What lives there | Who can edit | How it reaches the process |
|---|---|---|---|
| `[local]` | Developer secrets on one machine only | The developer on that machine | Shell env / `.env.local` loaded by Next.js / Convex CLI |
| `[convex dashboard]` | Runtime secrets for Convex functions | human-amit (dashboard owner) | Convex injects at function invocation |
| `[vercel production]` | Secrets for production Next.js builds and RSC routes | human-amit (Vercel project owner) | Vercel injects at build and edge runtime |
| `[vercel preview]` | Secrets for preview branch builds | human-amit (Vercel project owner) | Vercel injects at preview build — currently disabled |
| `[EAS secrets]` | Mobile build secrets | human-amit (EAS project owner) | EAS injects during `eas build` |

---

## What is NOT decided yet

- **Preview Convex provisioned.** The `preview:*` deployment is planned but not provisioned. Do not reference preview Convex URLs in any config.
- **Vercel preview re-enablement plan.** Previews disabled 2026-06-02. When re-enabled, update this file with the actual scope of preview secrets and the confirmation step.
- **Convex local dev attachment.** Choose existing `dev:tremendous-bass-443` vs a new personal `dev:*` deployment before running an interactive `bun x convex dev` configuration.
- **EAS project identity.** Resolved 2026-06-04: `apps/mobile/app.json` points at `@amitlevin/tempi` (project ID `90dfac90-0baa-461b-946c-351d2306e607`). Build profiles live in `apps/mobile/eas.json` (`development`, `preview`, `production`).

---

## Mobile builds (EAS)

Expo Application Services builds use `apps/mobile/eas.json`:

| Profile | Distribution | Notes |
|---|---|---|
| `development` | internal | `developmentClient: true` — dev client builds |
| `preview` | internal | QA / TestFlight-style internal builds |
| `production` | store | `autoIncrement: true` for store submissions |

Local dev uses `bun run dev:mobile` (Expo SDK 54). Client URL: set
`EXPO_PUBLIC_CONVEX_URL` or `NEXT_PUBLIC_CONVEX_URL` in `apps/mobile/.env.local`
to the `.convex.cloud` deployment URL (same host as web).

EAS secrets scope tag: `[EAS secrets]` — see root `.env.example` for RevenueCat
and other mobile-only keys.

---

## Related

- [docs/HARD_RULES.md](./HARD_RULES.md) — §13 (secrets and env vars) and §13.5 (ship state)
- [docs/SHIP_STATE.md](./SHIP_STATE.md) — one-table source of truth for what is shipped vs planned
- [docs/LOCAL_DEV_WINDOWS.md](./LOCAL_DEV_WINDOWS.md) — local setup guide
- [docs/brain/TASKS.md](./brain/TASKS.md) — master task list (T-0008, T-0020, T-R006, T-R007)

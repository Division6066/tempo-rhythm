# Environment Contract

This document defines the four-mode environment model for Tempo Flow. Every agent, contributor, and tool that touches an env var, Convex deployment, or Vercel project must read this first. Where this file and any other doc disagree, this file wins. See also HARD_RULES §13.

---

## The four modes

| Mode | Purpose | Convex | Vercel | Repo env file | Trust gate |
|---|---|---|---|---|---|
| **Dev** | Coding, immediate local testing | `dev:<your-slug>` (auto via `bun x convex dev`) | N/A (`next dev` locally) | `.env.local` (git-ignored) | May break at any time. Not a QA surface. |
| **Test** | Prove behavior | Dev deployment | Local `next build` + CI | `.env.local` + CI env | CI green + local smoke pass. Not a shareable URL. |
| **Preview** | Branch / PR validation | `preview:<slug>` (target state — not yet provisioned) | Preview URL from PR (**disabled this weekend**) | Vercel env table (preview scope) | Agents MUST NOT treat preview as shipped. |
| **Deployment** | Promoted stable surface | `prod:<slug>` (not yet linked — T-0008) | Production domain | Vercel env table (production scope) + Convex dashboard env | Only code that passed preview + explicit human promote. |

---

## Convex: three deployments (target model)

- **`dev`** — `dev:ceaseless-dog-617` already exists and is the only deployment this weekend that can be edited safely. Every local machine gets its own `dev:*` slug via `bun x convex dev`.
- **`preview`** — [placeholder — not yet provisioned]. Documented here as the target model. Provisioning is a `human-amit` / `twin` action: Convex dashboard → Project Settings → Deployments → Add preview deployment. Until then, PRs run against the author's `dev` deployment.
- **`prod`** — [placeholder — not yet linked (T-0008)]. Until T-0008 is done, `CONVEX_DEPLOY_KEY` stays empty in `.env.example` and any `convex deploy` call fails loudly and intentionally.

Rule: no agent provisions Convex deployments. That is a dashboard action, owner `human-amit` or `twin`.

---

## Vercel: production domain only this weekend

Preview builds are explicitly disabled for the weekend. To disable via the Vercel dashboard [human-amit action]:

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

- **Production Convex linked (T-0008).** The `prod:*` deployment does not exist. `CONVEX_DEPLOY_KEY` is empty. No agent should treat the production row as real until T-0008 is marked done.
- **Preview Convex provisioned.** The `preview:*` deployment is planned but not provisioned. Do not reference preview Convex URLs in any config.
- **Vercel preview re-enablement plan.** Previews are disabled this weekend. When re-enabled, this file must be updated with the actual scope of preview secrets and the confirmation step.

---

## Related

- [docs/HARD_RULES.md](./HARD_RULES.md) — §13 (secrets and env vars) and §13.5 (ship state)
- [docs/SHIP_STATE.md](./SHIP_STATE.md) — one-table source of truth for what is shipped vs planned
- [docs/LOCAL_DEV_WINDOWS.md](./LOCAL_DEV_WINDOWS.md) — local setup guide
- [docs/brain/TASKS.md](./brain/TASKS.md) — master task list (T-0008, T-0020, T-R006, T-R007)

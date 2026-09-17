# How to add a feature

Factory recipe for a vertical slice in `tempo-rhythm`. One logical change per
PR. Branch from **`integration`**, open the PR **against `integration`**, and
stop at "draft / ready for Amit." Code agents do not merge their own PRs and
do not push `master`.

Read [`HARD_RULES.md`](./HARD_RULES.md) first. Then [`TECH_STACK.md`](./TECH_STACK.md)
and [`HARNESS.md`](./HARNESS.md). If a ticket, comment, or chat disagrees with
HARD_RULES, HARD_RULES wins.

`docs/brain/TASKS.md` is a private submodule. Cloud agents usually cannot read
it. Use [`TASKS.md`](./TASKS.md), [`wiki/Tickets.md`](./wiki/Tickets.md), and
GitHub Issues. Do not invent `T-XXXX` IDs.

---

## 0. Pre-flight (before any code)

1. **Owner tag.** Only pick work whose owner matches your identity
   (`cursor-cloud-1/2/3`, `cursor-ide`, …). `twin` / `pokee` / `zo` /
   `human-amit` stay off-limits unless the ticket names an explicit fallback.
2. **File scope.** The ticket's path list is a hard boundary. If you must go
   outside it, stop and say so. Never edit `.github/workflows/**`, branch
   protection, billing, or secrets.
3. **Graph first.** Rebuild or query Graphify (`graphify update . --no-cluster`,
   then `graphify query` / `affected`). Do not invent `.ua/`.
4. **Confirm the slice.** List files you will create or modify, map them to the
   current-phase PRD (or the visible ticket), and list ambiguities. For
   non-trivial product work, wait for approval. This factory pack is docs-only
   and does not add product feature code.

---

## 1. Branch

```bash
git fetch origin integration
git checkout -b feat/<id>-<short-kebab> origin/integration
```

Cursor Cloud agents use their assigned `cursor/<slug>` prefix. Conventional
names otherwise: `feat/T-XXXX-<kebab>`, `fix/…`, `chore/…`, `docs/…`.

One worktree per task. Do not rebase or force-push someone else's branch away.

---

## 2. Vertical slice (typical)

Keep the schema generic. User-specific formatting belongs in the AI / render
layer, not new columns.

| Layer | Where | What to add |
|---|---|---|
| Schema | `convex/schema.ts` | Table or optional fields + indexes. Soft-delete `deletedAt`. Transitional `userId: v.id("users")` is allowed until the optional-string migration lands. New tables should follow HARD_RULES §5. |
| Backend | `convex/<module>.ts` | Thin `query` / `mutation` / `action` wrappers. Auth check (`ctx.auth.getUserIdentity()` or `requireUser`). `args` + `returns` validators. Indexes, not `.filter()` scans. Never `Date.now()` inside a **query**. |
| AI writes | `convex/proposals.ts` + UI card | Proposal → confirm / edit / reject. Never mutate user state from an action with model-generated args and no confirm. |
| Web | `apps/web/app/(tempo)/<route>/` | Route + client components. Tokens from `packages/ui` / `globals.css`. Empty, error, loading, light + dark. |
| Mobile | `apps/mobile` | Same behavior if the ticket includes mobile. NativeWind classes; no second state library. |
| Shared types | `packages/types` | Only if both surfaces need the type. |
| Tests | `convex/<module>.test.ts`, `tests/unit/`, Playwright under `tests/e2e/` | Every new mutation: happy path + one error. Non-trivial UI: a render test. |

### Convex habits that bite

- `"use node"` files may export **actions only**.
- Schedule `internal.*`, never `api.*`.
- Soft-delete user data. Hard delete only for RAM-only scanner staging, expired
  rate-limit buckets, and test fixtures.
- Scanners (email / chat exports / etc.) are **RAM-only** — raw source never
  lands in Convex.

### UI habits that bite

- No shame copy ("behind", "failed", "lazy"). See brand do-and-don't when the
  private submodule is available; otherwise keep language calm and concrete.
- No ad-hoc hex on new UI. Add a token first, or the design-token scan fails.
- Web Tailwind v4 stays v4. Mobile stays NativeWind + Tailwind 3.x.

---

## 3. Forbidden additions

Do not add as a dependency or a code/doc reference: Firebase, Supabase, Prisma /
Drizzle / TypeORM, Clerk / Auth0 / NextAuth, vendor AI SDKs, Axios, Redux /
Zustand / Jotai, direct Postgres / Mongo clients. Full table:
[`HARD_RULES.md`](./HARD_RULES.md) §2.

Do not add a package that is not already in `bun.lock` without calling it out
in the PR. After any runtime dep, update `THIRD-PARTY-NOTICES.md`
(TF-OSS-00).

Bolt / Lovable / v0 / Replit shells are **reference specs only**. Port the
behavior into this monorepo; do not vendor the shell.

---

## 4. Verify locally

From repo root (see [`HARNESS.md`](./HARNESS.md) for the full list):

```bash
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run test
bun run scan:forbidden-tech
bun run scan:ram-only-audit
bun run scan:design-tokens
bun run check:notices
```

Do **not** use `bun run check` as a read-only gate — some workspaces run
`biome check --write`.

UI changes: exercise the route in a browser (not a single screenshot). If
browser tools are unavailable, say what you could not click.

Update [`SHIP_STATE.md`](./SHIP_STATE.md) only when the feature's ladder
actually moved. Never call a slice `ready` or `shipped` unless it is
`shipped-and-running` on production Vercel + production Convex. Never apply
the `agent:ready` label.

---

## 5. Commit and open a draft PR

Conventional Commits: `feat(scope): …`, `fix(scope): …`, `docs(scope): …`.
One logical change per commit unless the ticket says otherwise.

Fill [`.github/pull_request_template.md`](../.github/pull_request_template.md):

- Why the change exists
- Task / issue id you can actually see (do not invent `T-XXXX`)
- Acceptance criteria copied, not paraphrased
- Test plan
- HARD_RULES checklist
- Owner tag
- Screenshots only for UI

Open a **draft** PR against `integration` unless Amit asked for ready-for-review.
Do not merge. Do not add `agent:ready`.

---

## 6. After merge (Amit)

If source layout changed, regenerate Graphify and refresh
[`TEMPLATE_STATE.md`](./TEMPLATE_STATE.md). Run `/understand` only when the
Understand Anything plugin is available. **Do not invent `.ua/`.**

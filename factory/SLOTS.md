# Factory slots — tempo-rhythm's fill
<!-- Path: factory/SLOTS.md. The ONLY file that names tools. To swap a tool, edit one row.
     Everything else (AGENTS.md, CLAUDE.md, the skill) stays as it is. Review weekly.
     Last edit: 2026-10-05 (B-5 review gate = Cursor Bugbot, interim; per Amit). -->

## Slots
| Slot | Role | Tool | Status |
|---|---|---|---|
| A-1 | Intake interviewer | UNKNOWN | pick one |
| A-2 | Doc writer | UNKNOWN | pick one |
| A-3 | Consistency check | UNKNOWN | pick one |
| A-4 | Doc store | Repo `docs/` (not the wiki) | |
| A-5 | Ticket sync | factory-write-tickets + factory-promote (docs/tickets → Issues) | promoter parked (needs Factory App) |
| B-1 | Ticket queue | GitHub Issues, Levidavidspublic/tempo-rhythm | |
| B-2 | Dispatcher | gh-aw `factory-dispatch` (Copilot, `vars.FACTORY_MODEL_DISPATCH` = claude-haiku-4.5; routes tickets only, never writes code) | tested 2026-10-05 |
| B-3a | Agent lane A | Cursor cloud agent via API (`factory-lane-cursor`, `vars.FACTORY_MODEL_CURSOR`, fast) | |
| B-3b | Agent lane B | Claude Code Action (`factory-lane-claude`, org secret CLAUDE_CODE_OAUTH_TOKEN, `vars.FACTORY_MODEL_CLAUDE`) | tested 2026-10-05 (PR #569) |
| B-3c | Agent lane C | Codex cloud via @codex (`factory-lane-codex`, subscription only) | parked (CODEX_MENTION_PAT, Codex GitHub link) |
| B-4 | Checks | GitHub Actions, 5 required: ci, e2e-preview (Playwright on Vercel preview), secret-scan, config-guard, scope-guard | |
| B-5 | Review gate | Cursor Bugbot (interim); CodeRabbit optional later | Bugbot can't review bot-authored PRs without a Cursor team covering this repo |
| B-6 | Auto-merge | Merge train `factory-merge.yml` (Factory App token; one squash-merge at a time; `vars.FACTORY_REVIEW_GATE=bugbot` adds the Bugbot gate) | parked (Factory App) |
| B-7 | Preview host | Vercel preview (tempo-web; integration → preview.tempoflow.dev) | |
| — | Backend | Convex — test deployment ceaseless-dog-617 only from integration; live never from the factory | |
| C-1 | Secrets vault | 1Password | |
| C-2 | Configurator | Grok Bot | |
| C-3 | Code map | Graphify 0.9.74 | |
| C-4 | Memory log | Basic Memory | |

## Review gate loop (B-5)
1. A lane opens a PR on `factory/<ticket>`; Bugbot reviews it (auto-run on push, or comment `bugbot run`).
2. `factory-review-fix.yml` runs on every Bugbot review (or by hand with `pr_number`):
   - unresolved Bugbot findings → dispatches the PR's lane with the findings as `fix_note`; the lane pushes the fix to the SAME branch. Labels `review-fix:1..3`; after 3 attempts → `blocked:amit` (AGENTS.md 3-strike rule).
   - Bugbot "couldn't run" (e.g. GitHub account mismatch) → `blocked:amit`.
3. The merge train merges only when the 5 checks are green AND (with `FACTORY_REVIEW_GATE=bugbot`) Bugbot is clean on the head commit.

## Code model of the week
Mid-tier by BILLING only (org variables):
- code models: Claude `sonnet`, Cursor `grok-4.7` (fast), Codex `GPT-5.6 Terra`
- dispatcher only: `claude-haiku-4.5`
- fallback: UNKNOWN

## Stack
- bun monorepo (apps/web, apps/mobile, convex/)
- UI: UNKNOWN (see docs/TRD.md)

## Commands
| Purpose | Command |
|---|---|
| install | `bun install --frozen-lockfile` |
| dev | `bun run dev` |
| test | `bun run test` |
| lint | `bun run lint` |
| typecheck | `bun run typecheck` |
| build | `bun run build` |
| e2e | e2e-preview workflow (Playwright against the Vercel preview) |

## Secrets (names only, never values)
Factory: CLAUDE_CODE_OAUTH_TOKEN, CURSOR_API_KEY, COPILOT_GITHUB_TOKEN, FACTORY_APP_ID, FACTORY_APP_PRIVATE_KEY, CODEX_MENTION_PAT, VERCEL_AUTOMATION_BYPASS_SECRET, GH_AW_* (gh-aw).
App runtime: see docs/ENVIRONMENTS.md.

## Schedule
- Build loop: runs every day.
- Quiet days: UNKNOWN
- Agents take the date from the system clock.

## Enforcement checklist
- [ ] Branch protection on the default branch: PRs only, required checks, review gate required
- [ ] Live environment requires owner approval
- [ ] Integration branch allows auto-merge only when checks and review pass
- [ ] Claude `.claude/settings.json` denies reading `.env*` and pushing to the default branch
- [ ] The same denials for every other lane's agent (Cursor hooks, Codex sandbox and rules)
- [ ] Secret scanning on
- [ ] Spend caps on every paid provider key

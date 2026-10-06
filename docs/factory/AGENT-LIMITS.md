# Agent usage limits and routing preference

Amit's rule (6 Oct 2026): when an agent runs out of usage, the factory routes around it. It never falls back to a
pay-per-use API agent. Code: `scripts/factory/lane-limits.mjs` (one module, unit tests in `scripts/factory/test-factory.mjs`).

## Repo variables (Settings → Secrets and variables → Actions → Variables)

| Variable | Default | Meaning |
|---|---|---|
| `FACTORY_CLAUDE_AT_LIMIT` | `false` | `true` = Claude (subscription OAuth lane) gets no new tickets |
| `FACTORY_CODEX_AT_LIMIT` | `false` | `true` = Codex (ChatGPT plan) gets no new tickets |
| `FACTORY_CURSOR_AT_LIMIT` | `false` | `true` = the Cursor lane gets no new tickets. **Bugbot and the Cursor automations keep running**; they are not lanes and never read this variable |
| `FACTORY_AGENT_PREFERENCE` | `claude,codex,cursor` | Comma-separated order. Unknown names are ignored; lanes left out are appended in the default order (use `*_AT_LIMIT` to switch a lane off) |

Flip with `gh variable set FACTORY_CURSOR_AT_LIMIT -R Levidavidspublic/tempo-rhythm -b true`. Takes effect on the next router run. No PR is needed.

## Rules (first match wins per ticket)

1. **Pinned lane:** front-matter `lane_pin: true` (factory), or an explicit `agent:<x>` label or `area:` rule (label routers). The lane is kept unless that agent is at its limit. Then the next available lane in the ticket's order takes it.
2. **Data tickets** (`type: data`, Convex): Claude, then the preference order.
3. **Browser-test tickets** (`browser_test: true`): the preference order with Claude moved last. The default is **Codex** (Playwright is in its environment), then Cursor, then Claude.
4. **Build tickets** (everything else): balanced over the available lanes **except the last one in the preference**. The last lane is a fallback only. The default is Claude + Codex sharing the work, and Cursor only when both are at their limit.
5. **All three at their limit → Freebuff** (free, ad-supported coding agent built on Codebuff, https://freebuff.com). It has no GitHub trigger yet, so the router labels the ticket **`agent:freebuff` + `needs:manual-run`** and starts nothing. This replaces `blocked:amit` for this case. The factory skips `needs:manual-run` tickets until a person removes the label.

What that means with the default preference:

| At limit | Build ticket | Browser-test ticket | Data ticket |
|---|---|---|---|
| none | Claude / Codex (balanced) | Codex | Claude |
| Cursor | Claude / Codex | Codex | Claude |
| Codex | Claude (then Cursor) | Cursor | Claude |
| Claude | Codex (then Cursor) | Codex | Codex |
| Claude + Codex | Cursor | Cursor | Cursor |
| all three | Freebuff (manual) | Freebuff (manual) | Freebuff (manual) |

**Never pay-per-use.** The lanes are Claude (subscription OAuth, `CLAUDE_CODE_OAUTH_TOKEN`), Codex (ChatGPT plan), Cursor (plan, `CURSOR_API_KEY`), then the free Freebuff. No metered API key is ever used as a fallback. The only paid extras are **Bugbot** and the **Cursor automations**. **Copilot** is not a lane. It stays a last resort that a person starts.

## Where it is enforced

| Router | Trigger | What it does |
|---|---|---|
| `factory-dispatch` (gh-aw) | cron / `status:ready` / manual | `next-tickets.mjs` writes the final `lane` and `lane_reason` per ticket into `ready.json`. The Copilot dispatcher must use it unchanged. `manual_fallback[]` tickets get `agent:freebuff` + `needs:manual-run` and one comment. They use no capacity slot |
| `dispatch-router.yml` | label `ready` | The `area:`/MUTATES rule picks a lane. `lane-limits.mjs --want <lane>` replaces it if that agent is at its limit. Freebuff → labels + comment, no start |
| `agent-router.yml` | label `agent:claude/codex/cursor`, manual | Same re-check on the requested agent. A reroute is explained in a comment. Freebuff → labels + comment, no start. (`agent:freebuff` is not a startable agent; the router ignores it) |

## Running Freebuff on a `needs:manual-run` ticket (Dots or Amit)

Only the free tier, with no paid plan and no API key. Freebuff sends code to its hosted models. tempo-rhythm is public; check before using it on a private repo.

1. Branch: `git fetch origin && git checkout -B t/<issue>-<ticket-id-lowercase> origin/integration`. This is the factory ticket branch name, e.g. `t/712-b04-03` (`ticketBranch()` in `scripts/factory/factory-lib.mjs`). If the branch already exists, check it out instead.
2. Run it:
   - **CLI:** `npm i -g freebuff`, then run `freebuff` in the repo root. Give it the issue body (FOR / GOAL / SCOPE / DONE) plus "Follow AGENTS.md and RULES.md. Only touch the SCOPE folders. Run the DONE commands."
   - **Freebuff Cloud** (https://freebuff.com, Cloud): open the GitHub repo, pick the branch, paste the same prompt, and let it push to that branch.
   - **Desktop:** same as the CLI, in its own workspace.
3. Open a **draft** PR into `integration` as Division6066 with `Closes #<issue>` in the body. Normal CI and guards apply. Then remove `needs:manual-run` and `agent:freebuff` and add `status:in-pr`.
4. When a usage limit resets, set the matching `*_AT_LIMIT` back to `false`. To send a waiting ticket back to the factory instead, remove `needs:manual-run` and `agent:freebuff`.

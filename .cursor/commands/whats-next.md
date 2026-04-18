# What's next?

Follow the **session-start** workflow in `.cursor/rules/session-start.mdc`.

Steps for the assistant:

1. Ask (if not supplied): "How much time do you have? (30 / 45 / 60 / 90 / 120 min, or 'overnight')"
2. Read `docs/brain/tickets/_INDEX.md`. If empty, fall back to `docs/brain/TASKS.md` macro rows.
3. Filter to `Status: todo`, unblocked, estimate ≤ budget, assignee in {`cursor-ide`, `cursor-cloud-*`} OR primary `{twin,pokey,zo}` with `(fallback: cursor-*)` AND that primary is not yet configured.
4. Pick **three** candidates, preferring dependency-chain progress (Root → Tier 1 → Tier 2).
5. Surface them in the scannable format below.
6. **Do not** start implementing until the user picks one and says "go" / "execute N" / the ticket ID.

Format:

```
1. **T-XXXX** — <title> — <estimate> — `cluster:<tag>` — `<assignee>`
   <one-line description of what "done" looks like>
   Why: <dependency rationale or value>

2. **T-YYYY** — ...

3. **T-ZZZZ** — ...

Pick one? (ID or "execute 1")
```

For "overnight" / ≥ 4h budgets: do NOT run this command — run `/long-session` instead.

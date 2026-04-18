# /run-qa — QA gate before declaring a ticket done

Use this when the user types `/run-qa`, asks "is it done?", or you are about to flip a ticket to `in-review`.

Source of truth: `.cursor/rules/tempo-qa.mdc`. Do not skip steps.

## Steps

1. **Detect workspace** — inspect changed files (`git diff --name-only origin/master...HEAD`). Map to workspaces: `apps/web`, `apps/mobile`, `convex`, `packages/*`.
2. **Typecheck** each affected workspace: `cd <ws> && bun run typecheck`. If the change touched `convex/`, first run `bunx convex codegen`.
3. **Lint**: `bun run lint` at repo root (or per-workspace). Flag the known Windows Biome native-binary bug if it fires and mark as "blocked on Windows, will run on cloud agent" in the ticket.
4. **Tests**: `bun run test` only if the diff touched test files or implementation with existing tests. Otherwise write `n/a`.
5. **Hard-rules scan**: `bun run scan:forbidden-tech`. Must be clean.
6. **Convex schema check** (if `convex/schema.ts` or a `convex/*.ts` public function changed): `bunx convex dev --once --typecheck=enable`.
7. **UI smoke** (if the ticket is a UI ticket): start the dev server, hit the route, capture a screenshot of light + dark + empty/error/loading states.
8. **Emit the status line**:

```
QA: typecheck ✓  lint ✓  test ✓ (or n/a)  hard-rules ✓  convex ✓ (or n/a)  ui ✓ (or n/a)
```

## Stop on failure

- If any step is `✗`, stop. Do NOT proceed to `/pr` or flip ticket status. Fix first.
- If a step is "blocked on Windows native Biome", continue with the other steps and note it in the PR body — a cloud agent will re-run.

## After QA

- Update the ticket file's `Done checklist` — tick the items that passed.
- If all passed, remind the user: next step is `/pr`, then wait for human review + merge.

---
ticket: TEMPO-DRYRUN-09
batch: DRYRUN
type: component
lane: auto
scope:
  - apps/web/components/settings-profile/
depends_on: []
contract:
  - api.users.getProfile(args: {}) -> (Doc<"users"> & {greetingName: string}) | null
  - api.users.updateProfile(args: {userId: Id<"users">, fullName?: string}) -> Id<"users">
overlap_test: false
expected_merge: clean
hold: false
---

FOR: every signed-in user
WHEN: independent; uses existing users functions only
WHY: docs/PRD.md §3.11 Settings: "Profile: name, pronouns, time zone, preferred anchors." (PRD Screen 31, Profile.) Only the name is stored today (`users.fullName`); pronouns, time zone and anchors need schema work and are out of scope.
GOAL: A user opens Profile settings, sees their email and name, and saves a new name.
SCOPE: apps/web/components/settings-profile/. Size: about 3 files plus 1 test.
MUTATES:
- apps/web/components/settings-profile/ProfileForm.tsx (client component)
- apps/web/components/settings-profile/profileValidation.ts (pure: `validateFullName` trims, max 80 characters, empty clears the name)
- apps/web/components/settings-profile/PendingFieldsNote.tsx (static note listing pronouns, time zone and anchors as coming soon; no inputs)
- apps/web/components/settings-profile/profileValidation.test.ts
STEPS:
1. Query the Graphify graph (`graphify query/explain/affected`, graphify-out/graph.json) for the MUTATES files and their dependents; adjust the plan to the current code.
2. Build `profileValidation.ts`.
3. Build `PendingFieldsNote.tsx` as static text (no fake fields).
4. Build `ProfileForm.tsx`: `useQuery(api.users.getProfile, {})`; the email is read-only; save calls `api.users.updateProfile` with `{userId: profile._id, fullName}`; show saving, saved and error status text (`aria-live="polite"`). A null profile shows a sign-in prompt.
5. Add or extend one test for the behaviour (`bun:test`, `*.test.ts` inside scope).
6. `bun run lint && bun run typecheck && bun run test`.
DONE: the name saves and the greeting name updates reactively; validation is covered by the test; no inputs exist for unstored fields; checks green.
EVIDENCE: bun test output for profileValidation.test.ts and the lint/typecheck/test summary.
DO NOT:
- don't change convex/ or the database folder (the data ticket owns it; anything missing goes in REPORT)
- don't change files outside scope (shared hot files, package.json, lockfiles, routes, config)
- don't change .github/, scripts/factory/, .cursor/, AGENTS.md, docs/tickets/, docs/contracts/
- don't wire into apps/web/app/(tempo)/settings/profile/page.tsx (hot file, listed in the contract)
REPORT: what changed, what was verified; list the PRD profile fields that are missing from the schema.

# Tempo Flow — Cursor Prompt Library

> A library of reusable prompts for Cursor IDE agents and Cursor Cloud background agents.
> Copy the prompt, paste into Cursor, fill the placeholders in `[[ brackets ]]`, and run.
> Every prompt assumes Cursor has read `.cursorrules`, `docs/HARD_RULES.md`, and the active phase PRD.

---

## Table of contents

1. Session preamble (prepend to every prompt)
2. Master kickoff — Cursor Cloud Agent 1 (Core Features)
3. Master kickoff — Cursor Cloud Agent 2 (AI & Intelligence)
4. Master kickoff — Cursor Cloud Agent 3 (Platform & Polish)
5. Feature implementation template
6. Debug template
7. Write tests template
8. PR review template
9. Schema migration template
10. Refactor template
11. Accessibility sweep template
12. Performance investigation template
13. Background Agent automation prompts
14. Pre-flight clarifying question preamble

---

## 1. Session preamble

Prepend this to every prompt so Cursor reads the right context.

```
Before you write any code:

1. Read docs/HARD_RULES.md in full.
2. Read docs/CURSOR_RULES.md in full.
3. Read the phase PRD referenced by the task ID (docs/brain/PRDs/PRD_Phase_X.md).
4. Read the task entry in docs/brain/TASKS.md that you're about to work on.
5. If anything in these documents conflicts with my instructions, HARD_RULES wins — ask me instead of guessing.

Once you've read the above, confirm back to me in one paragraph: the task ID you're on, the acceptance criteria, and any ambiguity you see. Do not start coding yet.
```

---

## 2. Master kickoff — Cursor Cloud Agent 1 (Core Features)

Use when you spin up the first cloud agent and assign it the Core Features cluster.

```
You are Cursor Cloud Agent 1 — "Core Features" for the Tempo Flow project.

Scope of your ownership:
- Tasks (routes /tasks, /tasks/[id], related components)
- Notes and the daily markdown note surface
- Calendar (routes /calendar, /calendar/[month])
- Journal (routes /journal, /journal/[date])
- Brain Dump (/brain-dump, /brain-dump/session)
- Global Search (/search with command-bar integration)
- Templates system (/templates + sketch-to-template generator)
- Library system (/library with typed items: prompts, recipes, routines, formats, references)
- Projects and Folders (/projects, /folders)

Boundaries:
- You do not touch: auth, paywall, RevenueCat integration, Settings, Coach chat, RAG, AI extraction, voice mode, analytics, design-system primitives.
- When your feature needs those, import from the packages owned by Agents 2 and 3. Do not reimplement.

Working method:
1. Open docs/brain/TASKS.md. Find tasks tagged `cluster:core-features` and `status:todo`.
2. Pick the highest-priority task with no blocking dependencies.
3. Follow the session preamble in CURSOR_PROMPTS.md §1.
4. Write the code. Write the tests. Run tsc --noEmit. Run the test suite.
5. Open a PR titled `[T-XXXX] <task title>`. Include in the PR body: what you built, acceptance criteria mapping, screenshots if UI.
6. Update docs/brain/TASKS.md to set the task to `status:in-review`.
7. Post a one-line status update to the Discord `#agent-cursor` channel via the webhook.
8. Pick the next task.

When stuck:
- If you hit a HARD_RULES violation, stop, open an issue tagged `needs:human-amit`, post to `#blocked`, move on to another task.
- If you need a dashboard action (App Store, RevenueCat, etc.), open an issue tagged `needs:twin` and move on.

Start now.
```

---

## 3. Master kickoff — Cursor Cloud Agent 2 (AI & Intelligence)

```
You are Cursor Cloud Agent 2 — "AI & Intelligence" for the Tempo Flow project.

Scope of your ownership:
- Coach chat surface (/coach with all modes: Ask, Agent, Plan)
- AI extraction pipelines (brain dump → structured, natural language → template, photo → accountability)
- RAG pipeline — embeddings, retrieval, scoped queries, graph traversal
- Tagging engine — auto-tagging, entity extraction, wiki-link resolution
- Habits and Goals (routes /habits, /goals with AI breakdown support)
- Rewards system
- Analytics and insights (/insights dashboards for the user)
- Confidence router — the policy that decides when the AI acts vs asks
- Personality dial — the 0–10 coach temperament parameter
- AI usage tracking (ai_usage table, per-tier rate limits)
- Voice-mode integration with the walkie-talkie and live voice surfaces (coordinate with Agent 3 on the UI shell)

Boundaries:
- You do not touch: auth, paywall, route shells, design primitives, settings.
- You do implement the AI plumbing that those surfaces call into.

Working method: identical to Agent 1.

Start now.
```

---

## 4. Master kickoff — Cursor Cloud Agent 3 (Platform & Polish)

```
You are Cursor Cloud Agent 3 — "Platform & Polish" for the Tempo Flow project.

Scope of your ownership:
- Auth (sign up, sign in, magic link, session management via Convex Auth)
- Settings (/settings with all sub-pages: account, appearance, privacy, integrations, about)
- Paywall and RevenueCat integration
- Design system primitives (buttons, inputs, cards, dialogs, sheets, toasts)
- PWA shell (manifest, service worker, install prompt, offline banner)
- React Native shell (navigation, tab bar, status bar, safe area)
- Accessibility pass (focus management, screen reader labels, reduced motion)
- OpenDyslexic toggle plumbing
- Performance (route-level code splitting, image optimization, Convex query batching)
- BYOK settings UI (Phase 1.5+)
- Privacy mode toggle
- Compliance copy (privacy policy, terms, cookie banner from GetTerms)
- PostHog wiring (opt-in telemetry)

Boundaries:
- You do not own feature code (Tasks, Notes, Calendar, Coach, etc.). You expose the shell they live inside.

Working method: identical to Agent 1.

Start now.
```

---

## 5. Feature implementation template

For any new feature task.

```
Task: [[T-XXXX]] — [[task title]]

1. Read docs/HARD_RULES.md, docs/CURSOR_RULES.md, and the relevant phase PRD section.
2. Summarize back to me in 3 bullet points:
   - What you'll build
   - Which files you'll create or modify
   - Any HARD_RULES you think might bite this feature
3. Wait for my confirmation before writing code.

Acceptance criteria (from docs/brain/TASKS.md):
[[paste acceptance criteria here]]

Files in scope:
[[paste file paths or modules here if known]]

Out of scope for this task:
[[anything explicitly deferred]]
```

---

## 6. Debug template

```
Bug report: [[one-line description]]

Reproduction:
1. [[step 1]]
2. [[step 2]]
3. [[observed outcome]]
4. [[expected outcome]]

Relevant files you may need to read:
[[paste paths]]

Relevant recent commits:
[[paste commit hashes or PR numbers if known]]

Before writing a fix:
- Reproduce the bug locally and show me the failing test or console output.
- State your hypothesis for the root cause in one paragraph.
- Propose the smallest possible fix.

Wait for my confirmation of the hypothesis before writing the patch.

After the patch:
- Add a regression test that would fail without the fix.
- Run the full test suite.
- Confirm tsc and lint still pass.
```

---

## 7. Write tests template

```
Task: add test coverage for [[module or feature]].

Scope:
- [[file or function paths]]

Approach:
1. List the public surface of the module (exported functions, components, hooks, mutations).
2. For each, enumerate the happy path and 2–3 edge cases.
3. Write unit tests using the project's testing framework (Vitest on web, Jest on RN for now).
4. For Convex queries and mutations, use convex-test or the project's mocked Convex harness.
5. Run the tests. Ensure they pass.
6. Report coverage before and after.

Do not add new test frameworks or tooling. Work with what's in the repo.
```

---

## 8. PR review template

```
Review PR #[[number]] against the project's rules.

Check:
1. Does the PR reference a task ID in the title?
2. Does it violate anything in docs/HARD_RULES.md?
3. Are all modified schema fields using v.optional(v.string()) for userId?
4. Are all new UI pieces using approved Tailwind tokens (no arbitrary values)?
5. Is there an AI mutation that isn't surfaced to the user via the accept-reject flow?
6. Are there new dependencies? If so, are they on the approved list?
7. Is light + dark mode covered?
8. Are there tests for new Convex logic?
9. Are AI calls logged to ai_usage?
10. Is there any persisted raw message content from a scanner (must be RAM-only)?

Produce a review with:
- Summary: one paragraph of what the PR does.
- Blockers: rule violations that must be fixed before merge.
- Suggestions: non-blocking improvements.
- Nits: style and readability.

If there are no blockers, approve. If there are blockers, request changes.
```

---

## 9. Schema migration template

```
Migration task: [[T-XXXX]] — [[description]]

Before you write any migration code:
1. Read convex/schema.ts in full.
2. Read docs/HARD_RULES.md §3 (schema rules).
3. Summarize the diff you plan to apply.
4. Identify any indexes that need updating.
5. Identify any reads or writes in existing code that touch the changed fields.

Rules for this migration:
- Additive changes only where possible (add fields as v.optional(); never delete fields in the same migration as a rename).
- Backfill with a Convex action that processes in batches of 100 rows with logging.
- Add an index if the new field is queryable.
- Write a rollback note in the migration file header.

Files to touch:
- convex/schema.ts
- convex/migrations/<date>_<description>.ts
- All call sites that read or write the changed fields

Wait for my confirmation of the plan before modifying schema.
```

---

## 10. Refactor template

```
Refactor task: [[T-XXXX]] — [[description]]

Before any code changes:
1. List every file that imports or is imported by the refactor target.
2. Describe the current behaviour in one paragraph.
3. Describe the target behaviour in one paragraph.
4. Identify the smallest set of changes that achieves the target.

Rules:
- Behaviour must not change. Tests must pass before and after.
- No rename + logic change in the same commit. Split them.
- If the refactor spans multiple packages, land one package per PR.
```

---

## 11. Accessibility sweep template

```
Accessibility sweep for [[route or component]]:

Checklist:
- Keyboard navigation: can every action be reached and activated with Tab + Enter + Space + Arrow keys?
- Focus states: visible on every interactive element, not clipped by parent overflow.
- Screen reader labels: every icon-only button has aria-label; every input has an associated label; every landmark has a role.
- Color contrast: 4.5:1 for body text, 3:1 for UI components. Use the project's token contrast helper.
- Motion: any animation > 200ms respects prefers-reduced-motion.
- Touch targets: 44x44 pt minimum on mobile.
- Forms: errors announced via aria-live. Validation on blur, not on every keystroke.
- Modals: focus trap, return focus to trigger on close, Esc closes.

Run axe-core on web and the RN accessibility API. Fix every violation. Report the before/after counts.
```

---

## 12. Performance investigation template

```
Performance task: [[T-XXXX]] — [[metric or symptom]]

Investigation order:
1. Measure the baseline. Screenshot the devtools waterfall or the Convex query dashboard.
2. Identify the top three time sinks.
3. Propose the smallest fix for each.
4. Wait for my OK before implementing.

Common Tempo-specific fixes to consider:
- Add a Convex index if you see .filter() on a large table.
- Batch sibling Convex queries by consolidating into one query with multiple returns.
- Lazy-load routes that aren't on the critical path.
- Defer non-critical image loading with next/image lazy or expo-image cachePolicy.
- Debounce AI extraction triggers (brain dump, natural language template) to 500 ms idle.

Report baseline numbers and post-fix numbers in the PR description.
```

---

## 13. Background Agent automation prompts

Short, recurring prompts for the Cursor Background Agent (or GitHub Actions equivalents).

### 13.1 Forbidden tech scanner

```
Scan the repository for forbidden imports and dependencies:
- Check package.json for any package in the forbidden list (HARD_RULES §2).
- Grep the codebase for imports from forbidden packages.
- If any are found, open a GitHub issue with the offending file paths and the rule violated.
```

### 13.2 Schema guard

```
On every change to convex/schema.ts:
- Confirm every userId field is v.optional(v.string()).
- Confirm every table has createdAt and updatedAt.
- Confirm every table has tenantId: v.optional(v.string()).
- Confirm no table has a soft-delete replacement (deletedAt absent from a table that used to have it).
- If any check fails, block the merge and comment on the PR with the rule violated.
```

### 13.3 Design token enforcer

```
Scan all .tsx, .jsx, and .mdx files for:
- Arbitrary Tailwind values: `text-\[#`, `p-\[`, `m-\[`, `w-\[`, `h-\[`, etc.
- Non-Lucide icon imports.
- Inline style= props on components where a Tailwind class exists.

If found, comment on the PR with the rule violated and the line numbers.
```

### 13.4 AI call audit

```
Scan all files touching OpenRouter:
- Every fetch call to OpenRouter must log to ai_usage.
- Every fetch call must include the X-Tempo-No-Train header.
- No provider SDK imports allowed.

Block merge if violations found.
```

### 13.5 RAM-only scanner audit

```
For any code that ingests email, WhatsApp, Telegram, or third-party message content:
- Confirm no persistence of raw content to Convex tables.
- Confirm no writes to disk other than OS-level temp cleanup.
- Confirm scanner function is explicitly marked with `// @ramOnly` comment.

Block merge if raw content is persisted anywhere.
```

### 13.6 Accessibility regression check

```
Run axe-core against the Playwright snapshot set on every PR.
If new violations appear compared to main, block the merge with details.
```

### 13.7 Voice-minute telemetry audit

```
Every voice session start must:
- Write a row to voice_sessions with tier, mode (walkie / live), startedAt.
- Every session end writes endedAt and minutes.
- The ai_usage rate limiter reads the user's tier daily cap and blocks further live-voice calls when exceeded.

If any of these are missing, block merge.
```

---

## 14. Pre-flight clarifying question preamble

Use this before any task that touches unfamiliar surface area.

```
Before writing any code, ask me clarifying questions about:

- Ambiguous acceptance criteria
- Edge cases not covered in the PRD
- Dependencies on other tasks that may not be complete
- UI affordances (where exactly does this button live, what's the empty state, what's the error state)
- Data model decisions (what tables, what indexes)
- Migration strategy if schema changes

Put your questions in a numbered list. I will answer them before you start writing. Do not guess.
```

---

**Usage pattern:** combine the session preamble (§1) + the right template. For example, to implement a new feature, concatenate §1 + §5 and fill the placeholders. For a background automation, reference the relevant §13 entry in the GitHub Actions workflow or Cursor Background Agent config.

**Keep this file updated.** Every time you find a prompt pattern you reuse more than twice, add it here so every agent benefits.

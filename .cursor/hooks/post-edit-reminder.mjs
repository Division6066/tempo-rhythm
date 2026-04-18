#!/usr/bin/env node
// Cursor afterFileEdit hook. Observational only — cannot block.
// Drops an additional_context line when sensitive files are touched so the
// agent remembers to run the right follow-up before closing the ticket.

import { readStdin, writeJson } from "./_lib.mjs";

const payload = await readStdin();
const filePath = (payload.file_path ?? "").replace(/\\/g, "/");

const notes = [];

if (filePath.endsWith("convex/schema.ts")) {
  notes.push(
    "convex/schema.ts changed. Run `npx convex dev --once --typecheck=enable` before closing the ticket (HARD_RULES §5).",
  );
}
if (filePath.endsWith("docs/HARD_RULES.md")) {
  notes.push(
    "docs/HARD_RULES.md changed. HARD_RULES is immutable without reviewer approval (HARD_RULES §17). Confirm with the user that this edit is intentional.",
  );
}
if (/^apps\/web\/app\/globals\.css$/.test(filePath)) {
  notes.push(
    "globals.css changed. If tokens moved, make sure `packages/ui/src/tokens.ts` stays the source of truth (HARD_RULES §7.3).",
  );
}
if (/^\.env\.example$/.test(filePath) || filePath.endsWith("/.env.example")) {
  notes.push(
    ".env.example changed. Add the same variable name to Vercel + EAS env config before merging (HARD_RULES §13).",
  );
}
if (/^docs\/brain\/tickets\/T-[\w-]+\.md$/.test(filePath)) {
  notes.push(
    "Ticket file changed. Commit inside the docs/brain submodule AND bump the parent pointer in the same PR (see tempo-tickets.mdc).",
  );
}

if (notes.length === 0) {
  writeJson({});
} else {
  writeJson({
    additional_context: `Tempo reminders:\n- ${notes.join("\n- ")}`,
  });
}

#!/usr/bin/env node
// Cursor sessionStart hook. Fire-and-forget; we can still emit env vars that flow
// to later hooks in this session. Here we also surface the current branch + any
// in-progress ticket so the agent sees them in systemMessage at session boot.

import { readStdin, writeJson, currentBranch, findInProgressTicket } from "./_lib.mjs";

await readStdin();

const branch = currentBranch();
const ticket = findInProgressTicket();

const parts = [`Branch: ${branch}`];
if (ticket) parts.push(`In-progress ticket: ${ticket}`);
parts.push("Rules: docs/HARD_RULES.md · Tickets: docs/brain/tickets/_INDEX.md");

writeJson({
  systemMessage: `Tempo Flow session started. ${parts.join(" | ")}`,
  env: {
    TEMPO_SESSION_BRANCH: branch,
    TEMPO_SESSION_TICKET: ticket ?? "",
  },
});

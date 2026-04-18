#!/usr/bin/env node
// Cursor stop hook. Cannot block session end. Used for:
//   1. Appending a one-line audit row to docs/brain/agent-log/YYYY-MM-DD.md
//   2. Nudging the agent (once) to update the ticket status if one was
//      marked in-progress but the branch is still master/main.
// If docs/brain submodule is not present, we silently no-op.

import { mkdirSync, appendFileSync, existsSync } from "node:fs";
import { readStdin, writeJson, projectRoot, currentBranch, findInProgressTicket } from "./_lib.mjs";

const payload = await readStdin();
const status = payload.status ?? "unknown";
const loopCount = payload.loop_count ?? 0;

const root = projectRoot();
const brainDir = `${root}/docs/brain`;
const logDir = `${brainDir}/agent-log`;

if (existsSync(brainDir)) {
  try {
    if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true });
    const today = new Date().toISOString().slice(0, 10);
    const logFile = `${logDir}/${today}-sessions.md`;
    const branch = currentBranch();
    const ticket = findInProgressTicket() ?? "-";
    const nowIso = new Date().toISOString();
    if (!existsSync(logFile)) {
      appendFileSync(
        logFile,
        `# Session log — ${today}\n\n| Time (UTC) | Status | Branch | In-progress ticket |\n|---|---|---|---|\n`,
      );
    }
    appendFileSync(logFile, `| ${nowIso} | ${status} | ${branch} | ${ticket} |\n`);
  } catch {
    // Logging is best-effort; never block session end.
  }
}

// One-shot nudge: if a ticket is still in-progress and we're already on master,
// remind the agent to flip the ticket back to review or todo before anyone else
// picks it up. loop_limit=1 on the hook entry caps this at a single retry.
const ticket = findInProgressTicket();
const branch = currentBranch();
const shouldNudge =
  status === "completed" &&
  loopCount < 1 &&
  ticket &&
  (branch === "master" || branch === "main");

if (shouldNudge) {
  writeJson({
    followup_message:
      `Before we stop: ticket ${ticket} is still marked \`in-progress\` but we're on \`${branch}\`. ` +
      `Either flip ${ticket} to \`in-review\` / \`done\` / back to \`todo\` in docs/brain/tickets/${ticket}.md ` +
      `(and commit inside the submodule), or confirm here that the status is intentional.`,
  });
} else {
  writeJson({});
}

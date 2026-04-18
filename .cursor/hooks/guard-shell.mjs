#!/usr/bin/env node
// Cursor beforeShellExecution hook. Denies HARD_RULES-violating shell commands.
// Returns permission: "deny" for forbidden commands, "allow" otherwise.
// failClosed is false in hooks.json so a crash fails open — we never want the
// hook to wedge the agent. Critical rules are re-checked by the CI scan.

import { readStdin, writeJson, isForbiddenShell } from "./_lib.mjs";

const payload = await readStdin();
const command = payload.command ?? "";

const reason = isForbiddenShell(command);
if (reason) {
  writeJson({
    permission: "deny",
    user_message: `Blocked shell command by .cursor/hooks/guard-shell.mjs`,
    agent_message: reason,
  });
} else {
  writeJson({ permission: "allow" });
}

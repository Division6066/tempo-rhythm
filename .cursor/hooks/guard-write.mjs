#!/usr/bin/env node
// Cursor preToolUse hook with matcher: "Write".
// Denies writes to .env files, secrets/, build artifacts, and convex/_generated/*.
// Every other path is allowed. Never blocks on error (failClosed: false).

import { readStdin, writeJson, isForbiddenWritePath } from "./_lib.mjs";

const payload = await readStdin();
const toolInput = payload.tool_input ?? {};
const path = toolInput.path ?? toolInput.file_path ?? toolInput.target_file ?? "";

const reason = isForbiddenWritePath(path);
if (reason) {
  writeJson({
    permission: "deny",
    user_message: `Blocked write to \`${path}\``,
    agent_message: reason,
  });
} else {
  writeJson({ permission: "allow" });
}

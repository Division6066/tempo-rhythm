#!/usr/bin/env bash
set -euo pipefail

echo "Tempo Cyrus setup starting"
echo "Issue: ${LINEAR_ISSUE_IDENTIFIER:-unknown}"

export CI=1
export NEXT_TELEMETRY_DISABLED=1
export TURBO_TELEMETRY_DISABLED=1

if ! command -v bun >/dev/null 2>&1; then
  echo "Bun is not installed; installing Bun 1.3.9 with npm"
  npm install --global bun@1.3.9
fi

echo "Node: $(node --version 2>/dev/null || echo missing)"
echo "npm: $(npm --version 2>/dev/null || echo missing)"
echo "bun: $(bun --version 2>/dev/null || echo missing)"

bun install --frozen-lockfile

echo "Tempo Cyrus setup complete"

#!/usr/bin/env bash
# Source this file so `node` / `npm` / `npx` work in Git Bash when NVM / nvm4w
# does not add them to PATH (common on Windows + Cursor).
#
# Usage (repo root):
#   source ./scripts/ensure-dev-path.sh
#
# Optional: set NODE_HOME to your install before sourcing, e.g.
#   export NODE_HOME="/c/Program Files/nodejs"

set -euo pipefail

_prepend_path() {
  local dir="$1"
  if [[ -d "$dir" && ":$PATH:" != *":$dir:"* ]]; then
    export PATH="$dir:$PATH"
  fi
}

if [[ -n "${NODE_HOME:-}" ]]; then
  _prepend_path "$NODE_HOME"
fi

# nvm-windows default layout (version folder contains node.exe)
if [[ -d "/c/nvm4w" ]]; then
  latest="$(ls -1 /c/nvm4w 2>/dev/null | grep -E '^v[0-9]' | sort -V | tail -1)"
  if [[ -n "${latest:-}" && -x "/c/nvm4w/${latest}/node.exe" ]]; then
    _prepend_path "/c/nvm4w/${latest}"
  fi
fi

# Standalone / installer default
_prepend_path "/c/Program Files/nodejs"

if command -v node >/dev/null 2>&1; then
  echo "ensure-dev-path: node $(node --version) on PATH"
else
  echo "ensure-dev-path: node still not found — install Node LTS or set NODE_HOME" >&2
  return 1 2>/dev/null || exit 1
fi

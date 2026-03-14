#!/usr/bin/env bash
set -euo pipefail

: "${CONVEX_DEPLOY_KEY:?CONVEX_DEPLOY_KEY is required}"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== Deploying Convex schema + functions ==="
mkdir -p "$ROOT_DIR/tempo-app/.convex-tmp"
CONVEX_TMPDIR="$ROOT_DIR/tempo-app/.convex-tmp" \
  npx convex deploy \
    --cmd "echo deployed" \
    --admin-key "$CONVEX_DEPLOY_KEY" \
    --project-dir "$ROOT_DIR/tempo-app"

echo ""
echo "=== Convex deployment complete ==="

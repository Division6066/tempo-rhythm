#!/usr/bin/env bash
set -euo pipefail

: "${CONVEX_DEPLOY_KEY:?CONVEX_DEPLOY_KEY is required}"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== Deploying Convex schema + functions ==="
cd "$ROOT_DIR/tempo-app"
mkdir -p .convex-tmp
CONVEX_TMPDIR="$ROOT_DIR/tempo-app/.convex-tmp" \
  npx convex deploy \
    --cmd "echo deployed" \
    --admin-key "$CONVEX_DEPLOY_KEY"

echo ""
echo "=== Convex deployment complete ==="

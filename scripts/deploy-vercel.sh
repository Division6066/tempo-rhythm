#!/usr/bin/env bash
set -euo pipefail

: "${VERCEL_TOKEN:?VERCEL_TOKEN is required}"
: "${VERCEL_ORG_ID:?VERCEL_ORG_ID is required}"
: "${VERCEL_PROJECT_ID_APP:?VERCEL_PROJECT_ID_APP is required}"
: "${VERCEL_PROJECT_ID_MARKETING:?VERCEL_PROJECT_ID_MARKETING is required}"

PROD_FLAG=""
if [[ "${1:-}" == "--production" ]]; then
  PROD_FLAG="--prod"
fi

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== Building tempo-web ==="
(cd "$ROOT_DIR/artifacts/tempo" && PORT=3000 BASE_PATH="/" pnpm run build)

echo ""
echo "=== Deploying tempo-web to Vercel ==="
VERCEL_ORG_ID="$VERCEL_ORG_ID" \
VERCEL_PROJECT_ID="$VERCEL_PROJECT_ID_APP" \
  npx vercel deploy \
    --token "$VERCEL_TOKEN" \
    --cwd "$ROOT_DIR/artifacts/tempo" \
    $PROD_FLAG \
    --yes \
    --prebuilt 2>/dev/null || \
VERCEL_ORG_ID="$VERCEL_ORG_ID" \
VERCEL_PROJECT_ID="$VERCEL_PROJECT_ID_APP" \
  npx vercel deploy \
    --token "$VERCEL_TOKEN" \
    --cwd "$ROOT_DIR/artifacts/tempo" \
    $PROD_FLAG \
    --yes

echo ""
echo "=== Building tempo-marketing ==="
(cd "$ROOT_DIR/artifacts/tempo-marketing" && PORT=3001 BASE_PATH="/" pnpm run build)

echo ""
echo "=== Deploying tempo-marketing to Vercel ==="
VERCEL_ORG_ID="$VERCEL_ORG_ID" \
VERCEL_PROJECT_ID="$VERCEL_PROJECT_ID_MARKETING" \
  npx vercel deploy \
    --token "$VERCEL_TOKEN" \
    --cwd "$ROOT_DIR/artifacts/tempo-marketing" \
    $PROD_FLAG \
    --yes \
    --prebuilt 2>/dev/null || \
VERCEL_ORG_ID="$VERCEL_ORG_ID" \
VERCEL_PROJECT_ID="$VERCEL_PROJECT_ID_MARKETING" \
  npx vercel deploy \
    --token "$VERCEL_TOKEN" \
    --cwd "$ROOT_DIR/artifacts/tempo-marketing" \
    $PROD_FLAG \
    --yes

echo ""
echo "=== Both deployments complete ==="

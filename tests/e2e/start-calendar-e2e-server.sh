#!/usr/bin/env bash
set -euo pipefail

env_path="$1"
base_url="$2"
port="$3"

bun tests/e2e/write-convex-auth-env.ts "$env_path" "$base_url"

CONVEX_AGENT_MODE=anonymous bun x convex dev \
  --env-file "$env_path" \
  --tail-logs disable &
convex_pid=$!

cleanup() {
  kill "$convex_pid" 2>/dev/null || true
}
trap cleanup EXIT

for _ in {1..60}; do
  if bun x convex env --env-file "$env_path" list >/tmp/tempo-convex-env-ready.log 2>&1; then
    break
  fi
  sleep 1
done

bun tests/e2e/configure-convex-auth-env.ts "$env_path"

cd apps/web
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210 bun run dev -- --hostname 127.0.0.1 --port "$port"

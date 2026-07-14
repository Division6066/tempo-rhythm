#!/usr/bin/env bash
set -euo pipefail

CONVEX_AGENT_MODE=anonymous bun x convex dev --tail-logs disable &
convex_pid=$!

cleanup() {
  kill "$convex_pid" 2>/dev/null || true
  wait "$convex_pid" 2>/dev/null || true
}
trap cleanup EXIT

ready=0
for _ in {1..120}; do
  if bun -e 'const response = await fetch("http://127.0.0.1:3210").catch(() => null); process.exit(response?.ok ? 0 : 1);' >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 0.25
done

if [ "$ready" -ne 1 ]; then
  echo "Convex local backend did not become ready." >&2
  exit 1
fi

jwt_private_key="$(
  bun -e 'const { generateKeyPairSync } = await import("node:crypto"); const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 }); const pkcs8 = privateKey.export({ type: "pkcs8", format: "pem" }); console.log(String(pkcs8).trimEnd().replace(/\n/g, " "));'
)"

printf "%s" "$jwt_private_key" | bun x convex env set JWT_PRIVATE_KEY >/dev/null
printf "http://127.0.0.1:3000" | bun x convex env set SITE_URL >/dev/null

wait "$convex_pid"

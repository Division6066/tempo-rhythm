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

keys_json="$(
  bun -e 'const { generateKeyPairSync } = await import("node:crypto"); const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 }); const pkcs8 = String(privateKey.export({ type: "pkcs8", format: "pem" })).trimEnd().replace(/\n/g, " "); const jwk = publicKey.export({ format: "jwk" }); console.log(JSON.stringify({ jwtPrivateKey: pkcs8, jwks: JSON.stringify({ keys: [{ use: "sig", ...jwk }] }) }));'
)"

jwt_private_key="$(printf "%s" "$keys_json" | bun -e 'const input = await new Response(Bun.stdin.stream()).json(); console.log(input.jwtPrivateKey);')"
jwks="$(printf "%s" "$keys_json" | bun -e 'const input = await new Response(Bun.stdin.stream()).json(); console.log(input.jwks);')"

set_convex_env() {
  local name="$1"
  local value="$2"
  printf "%s" "$value" | CONVEX_AGENT_MODE=anonymous bun x convex env set "$name" >/dev/null
}

set_convex_env JWT_PRIVATE_KEY "$jwt_private_key"
set_convex_env JWKS "$jwks"
set_convex_env SITE_URL "http://127.0.0.1:3000"
set_convex_env BETA_ALLOWLIST_EMAILS "e2e-routines@tempo.test"
set_convex_env BETA_MAX_TESTERS "100"

wait "$convex_pid"

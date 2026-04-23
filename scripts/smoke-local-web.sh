#!/usr/bin/env bash
# HTTP smoke for public routes (run while `bun run dev:web` is up).
set -euo pipefail
BASE="${1:-http://127.0.0.1:3000}"
for path in / /sign-in; do
  code="$(curl -sS -o /dev/null -w "%{http_code}" "${BASE}${path}")"
  echo "${path} -> ${code}"
  [[ "$code" == "200" ]] || exit 1
done
echo "smoke-local-web: OK"

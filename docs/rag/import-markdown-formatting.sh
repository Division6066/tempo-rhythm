#!/usr/bin/env bash
# Import markdown formatting guide memories into TEMPO via the /api/import endpoint.
# Run from the workspace root: bash docs/rag/import-markdown-formatting.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_URL="${API_URL:-http://localhost:8080}"
JSON_FILE="$SCRIPT_DIR/markdown-formatting-guide-import.json"

if [ ! -f "$JSON_FILE" ]; then
  echo "ERROR: $JSON_FILE not found" >&2
  exit 1
fi

echo "Importing markdown formatting memories from: $JSON_FILE"
echo "Target API: $API_URL/api/import"

PAYLOAD=$(node -e "
  const fs = require('fs');
  const data = fs.readFileSync('$JSON_FILE', 'utf8');
  console.log(JSON.stringify({ format: 'json', data }));
")

RESPONSE=$(curl -sf -X POST "$API_URL/api/import" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

echo "Response: $RESPONSE"

MEMORIES=$(echo "$RESPONSE" | node -e "let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{ const r=JSON.parse(d); console.log(r.imported?.memories ?? 0); })")

echo "Successfully imported $MEMORIES memory entries (tier: hot)"

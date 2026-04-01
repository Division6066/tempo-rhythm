#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TEMPO_APP_DIR="$ROOT_DIR/tempo-app"
CONVEX_DIR="$TEMPO_APP_DIR/convex"
MOBILE_DIR="$TEMPO_APP_DIR/apps/mobile"
REPORT_FILE="$ROOT_DIR/CONFIG_REPORT.md"

VALIDATE_ONLY="${VALIDATE_ONLY:-0}"
CHECKPOINT_PREFIX="${CHECKPOINT_PREFIX:-.checkpoint}"
CHECKPOINT_DIR="${CHECKPOINT_DIR:-$ROOT_DIR}"

PHASE_ERRORS=0
DEFAULT_BRANCH="master"
CONVEX_DEV_URL="https://ceaseless-dog-617.convex.cloud"
CONVEX_PROD_URL="https://precious-wildcat-890.convex.cloud"
VERCEL_PREVIEW_URL="not-run"

log() {
  printf '%s\n' "$*"
}

parse_args() {
  while [ "$#" -gt 0 ]; do
    case "$1" in
      --validate-only)
        VALIDATE_ONLY=1
        ;;
      *)
        log "ERROR: unknown argument: $1"
        exit 1
        ;;
    esac
    shift
  done
}

phase_checkpoint_path() {
  printf '%s/%s-%s.json' "$CHECKPOINT_DIR" "$CHECKPOINT_PREFIX" "$1"
}

phase_done() {
  [ -f "$(phase_checkpoint_path "$1")" ]
}

write_checkpoint() {
  local phase="$1"
  local body="$2"
  printf '%s\n' "$body" > "$(phase_checkpoint_path "$phase")"
  log "Checkpoint saved: $(phase_checkpoint_path "$phase")"
}

run_or_validate() {
  local description="$1"
  shift
  if [ "$VALIDATE_ONLY" = "1" ]; then
    log "[validate-only] $description"
    return 0
  fi
  log "$description"
  "$@"
}

require_env() {
  local name="$1"
  if [ -z "${!name:-}" ]; then
    log "MISSING: $name"
    exit 1
  fi
}

verify_file() {
  local path="$1"
  if [ ! -f "$path" ]; then
    log "ERROR: required file not found: $path"
    exit 1
  fi
}

count_schema_tables() {
  local schema_file="$CONVEX_DIR/schema.ts"
  verify_file "$schema_file"
  rg -o "defineTable" "$schema_file" | wc -l | tr -d ' '
}

verify_convex_repo_state() {
  verify_file "$CONVEX_DIR/schema.ts"
  verify_file "$CONVEX_DIR/http.ts"
  verify_file "$CONVEX_DIR/subscriptions.ts"

  local table_count
  table_count="$(count_schema_tables)"
  log "Schema table count: $table_count"

  if ! rg -q 'revenuecat-webhook' "$CONVEX_DIR/http.ts"; then
    log "ERROR: RevenueCat webhook route missing from $CONVEX_DIR/http.ts"
    exit 1
  fi

  if ! rg -q 'subscriptions: defineTable' "$CONVEX_DIR/schema.ts"; then
    log "ERROR: subscriptions table missing from schema"
    exit 1
  fi

  if ! rg -q 'userId: v.optional\(v.string\(\)\)' "$CONVEX_DIR/schema.ts"; then
    log "ERROR: profiles.userId is not normalized to optional string"
    exit 1
  fi
}

verify_mobile_repo_state() {
  verify_file "$MOBILE_DIR/app.json"
  verify_file "$MOBILE_DIR/eas.json"

  if ! rg -q '"development"' "$MOBILE_DIR/eas.json"; then
    log "ERROR: development build profile missing from eas.json"
    exit 1
  fi
  if ! rg -q '"preview"' "$MOBILE_DIR/eas.json"; then
    log "ERROR: preview build profile missing from eas.json"
    exit 1
  fi
  if ! rg -q '"production"' "$MOBILE_DIR/eas.json"; then
    log "ERROR: production build profile missing from eas.json"
    exit 1
  fi
}

preflight() {
  log "=== Pre-flight Check ==="
  if [ "$VALIDATE_ONLY" = "1" ]; then
    log "Validate-only mode enabled; skipping external credential checks."
  else
    require_env GITHUB_TOKEN
    require_env CONVEX_DEPLOY_KEY_DEV
    require_env CONVEX_DEPLOY_KEY_PROD
    require_env VERCEL_TOKEN
    require_env VERCEL_PROJECT_ID
    require_env EXPO_TOKEN
    require_env REVENUECAT_PUBLIC_KEY
    require_env REVENUECAT_SECRET_KEY
    log "All required environment variables are present."
  fi

  if ls "$CHECKPOINT_DIR"/"$CHECKPOINT_PREFIX"-*.json >/dev/null 2>&1; then
    log "Found previous checkpoints. Completed phases will be skipped."
  fi

  verify_convex_repo_state
  verify_mobile_repo_state
}

phase_github() {
  if phase_done github; then
    log "Phase 1 already completed. Skipping."
    return 0
  fi

  log "=== PHASE 1: GitHub Configuration ==="
  if [ "$VALIDATE_ONLY" = "1" ]; then
    DEFAULT_BRANCH="$(git -C "$ROOT_DIR" branch --show-current || echo master)"
    log "[validate-only] would authenticate GitHub and configure branch protection/secrets"
  else
    printf '%s' "$GITHUB_TOKEN" | gh auth login --with-token
    gh auth status
    DEFAULT_BRANCH="$(gh api repos/Division606/tempo-rhythm --jq '.default_branch')"
    gh api "repos/Division606/tempo-rhythm/branches/$DEFAULT_BRANCH/protection" \
      --method PUT \
      --input - <<'EOF'
{
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true
  },
  "enforce_admins": false,
  "required_status_checks": null,
  "restrictions": null
}
EOF
    gh secret set CONVEX_DEPLOY_KEY --repo Division606/tempo-rhythm --body "$CONVEX_DEPLOY_KEY_PROD"
    gh secret set VERCEL_TOKEN --repo Division606/tempo-rhythm --body "$VERCEL_TOKEN"
    gh secret set EXPO_TOKEN --repo Division606/tempo-rhythm --body "$EXPO_TOKEN"
    gh secret set REVENUECAT_PUBLIC_KEY --repo Division606/tempo-rhythm --body "$REVENUECAT_PUBLIC_KEY"
  fi

  write_checkpoint github "$(cat <<EOF
{
  "phase": "github",
  "status": "complete",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "default_branch": "$DEFAULT_BRANCH"
}
EOF
)"
}

phase_convex() {
  if phase_done convex; then
    log "Phase 2 already completed. Skipping."
    return 0
  fi

  log "=== PHASE 2: Convex Configuration ==="
  verify_convex_repo_state

  if [ "$VALIDATE_ONLY" = "1" ]; then
    log "[validate-only] would deploy Convex to dev and production"
  else
    (
      cd "$TEMPO_APP_DIR"
      export CONVEX_DEPLOY_KEY="$CONVEX_DEPLOY_KEY_DEV"
      npx convex dev --once
      export CONVEX_DEPLOY_KEY="$CONVEX_DEPLOY_KEY_PROD"
      npx convex deploy
      npx convex env set REVENUECAT_PUBLIC_KEY "$REVENUECAT_PUBLIC_KEY" --prod
      npx convex env set REVENUECAT_SECRET_KEY "$REVENUECAT_SECRET_KEY" --prod
      npx convex env set OPENROUTER_API_KEY "sk-or-placeholder" --prod
    )
  fi

  write_checkpoint convex "$(cat <<EOF
{
  "phase": "convex",
  "status": "complete",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "dev_url": "$CONVEX_DEV_URL",
  "prod_url": "$CONVEX_PROD_URL"
}
EOF
)"
}

phase_vercel() {
  if phase_done vercel; then
    log "Phase 3 already completed. Skipping."
    return 0
  fi

  log "=== PHASE 3: Vercel Configuration ==="
  if [ "$VALIDATE_ONLY" = "1" ]; then
    log "[validate-only] would link Vercel project and set env vars"
    VERCEL_PREVIEW_URL="validate-only.local"
  else
    vercel whoami --token "$VERCEL_TOKEN"
    vercel link --yes --project "$VERCEL_PROJECT_ID" --token "$VERCEL_TOKEN"

    printf '%s' "$CONVEX_DEV_URL" | vercel env add NEXT_PUBLIC_CONVEX_URL development --token "$VERCEL_TOKEN"
    printf '%s' "$REVENUECAT_PUBLIC_KEY" | vercel env add REVENUECAT_PUBLIC_KEY development --token "$VERCEL_TOKEN"
    printf '%s' "$CONVEX_DEV_URL" | vercel env add NEXT_PUBLIC_CONVEX_URL preview --token "$VERCEL_TOKEN"
    printf '%s' "$REVENUECAT_PUBLIC_KEY" | vercel env add REVENUECAT_PUBLIC_KEY preview --token "$VERCEL_TOKEN"
    printf '%s' "$CONVEX_PROD_URL" | vercel env add NEXT_PUBLIC_CONVEX_URL production --token "$VERCEL_TOKEN"
    printf '%s' "$CONVEX_DEPLOY_KEY_PROD" | vercel env add CONVEX_DEPLOY_KEY production --token "$VERCEL_TOKEN"
    printf '%s' "$REVENUECAT_PUBLIC_KEY" | vercel env add REVENUECAT_PUBLIC_KEY production --token "$VERCEL_TOKEN"
    VERCEL_PREVIEW_URL="$(vercel deploy --token "$VERCEL_TOKEN" --cwd "$ROOT_DIR" --yes)"
  fi

  write_checkpoint vercel "$(cat <<EOF
{
  "phase": "vercel",
  "status": "complete",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "preview_url": "$VERCEL_PREVIEW_URL"
}
EOF
)"
}

phase_expo() {
  if phase_done expo; then
    log "Phase 4 already completed. Skipping."
    return 0
  fi

  log "=== PHASE 4: Expo / EAS Configuration ==="
  verify_mobile_repo_state

  if [ "$VALIDATE_ONLY" = "1" ]; then
    log "[validate-only] would authenticate Expo and create EAS secrets"
  else
    export EXPO_TOKEN="$EXPO_TOKEN"
    npx eas-cli whoami
    (
      cd "$MOBILE_DIR"
      npx eas-cli init --id 90dfac90-0baa-461b-946c-351d2306e607 --non-interactive || true
      npx eas-cli secret:create --name EXPO_PUBLIC_CONVEX_URL --value "$CONVEX_PROD_URL" --type string --force
      npx eas-cli secret:create --name REVENUECAT_PUBLIC_KEY --value "$REVENUECAT_PUBLIC_KEY" --type string --force
    )
  fi

  write_checkpoint expo "$(cat <<EOF
{
  "phase": "expo",
  "status": "complete",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "eas_project_id": "90dfac90-0baa-461b-946c-351d2306e607"
}
EOF
)"
}

phase_cross_service_verification() {
  log "=== PHASE 5: Cross-Service Verification ==="

  if ! rg -q 'revenuecat-webhook' "$CONVEX_DIR/http.ts"; then
    log "ERROR: RevenueCat webhook route is missing."
    PHASE_ERRORS=$((PHASE_ERRORS + 1))
  fi

  if ! rg -q 'subscriptions: defineTable' "$CONVEX_DIR/schema.ts"; then
    log "ERROR: subscriptions table is missing from schema."
    PHASE_ERRORS=$((PHASE_ERRORS + 1))
  fi

  if ! rg -q '"development"' "$MOBILE_DIR/eas.json"; then
    log "ERROR: eas.json is missing development profile."
    PHASE_ERRORS=$((PHASE_ERRORS + 1))
  fi

  if ! rg -q '"preview"' "$MOBILE_DIR/eas.json"; then
    log "ERROR: eas.json is missing preview profile."
    PHASE_ERRORS=$((PHASE_ERRORS + 1))
  fi

  if ! rg -q '"production"' "$MOBILE_DIR/eas.json"; then
    log "ERROR: eas.json is missing production profile."
    PHASE_ERRORS=$((PHASE_ERRORS + 1))
  fi

  log "Verification complete. Errors: $PHASE_ERRORS"
}

phase_generate_report() {
  log "=== PHASE 6: Generate CONFIG_REPORT.md ==="

  local vercel_project_id="${VERCEL_PROJECT_ID:-not-set}"

  cat > "$REPORT_FILE" <<EOF
# TEMPO Flow — Backend Configuration Report

## Date
$(date -u +%Y-%m-%d)

## Agent Run Summary
- Validation only: $VALIDATE_ONLY
- Total errors encountered: $PHASE_ERRORS
- Default branch: $DEFAULT_BRANCH

## Services

### GitHub
- Repository: \`Division606/tempo-rhythm\`
- Default branch: \`$DEFAULT_BRANCH\`
- Branch protection target: 1 approving review, stale review dismissal enabled

### Convex
- Repo path: \`tempo-app/convex\`
- Development deployment slug: \`ceaseless-dog-617\`
- Production deployment slug: \`precious-wildcat-890\`
- Dev URL: \`$CONVEX_DEV_URL\`
- Prod URL: \`$CONVEX_PROD_URL\`
- RevenueCat webhook: \`POST /api/revenuecat-webhook\`

### Vercel
- Project ID: \`$vercel_project_id\`
- Preview URL: \`$VERCEL_PREVIEW_URL\`

### Expo / EAS
- Mobile app path: \`tempo-app/apps/mobile\`
- EAS project ID: \`90dfac90-0baa-461b-946c-351d2306e607\`
- Build profiles: \`development\`, \`preview\`, \`production\`

## Notes
- This script is checkpointed and can be resumed safely.
- Set \`VALIDATE_ONLY=1\` to dry-run repository validation without third-party writes.
EOF

  log "Generated $REPORT_FILE"
}

main() {
  parse_args "$@"
  preflight
  phase_github
  phase_convex
  phase_vercel
  phase_expo
  phase_cross_service_verification
  phase_generate_report
  log "TEMPO backend infrastructure setup complete."
}

main "$@"

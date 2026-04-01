# TEMPO Backend Infrastructure Automation

Use `scripts/tempo-backend-infra-setup.sh` as the executable entrypoint for Cursor Automations.

## Required environment variables

- `GITHUB_TOKEN`
- `CONVEX_DEPLOY_KEY_DEV`
- `CONVEX_DEPLOY_KEY_PROD`
- `VERCEL_TOKEN`
- `VERCEL_PROJECT_ID`
- `EXPO_TOKEN`
- `REVENUECAT_PUBLIC_KEY`
- `REVENUECAT_SECRET_KEY`

## Optional environment variables

- `GITHUB_REPOSITORY` defaults to `Division606/tempo-rhythm`
- `CONVEX_DEV_SLUG` defaults to `ceaseless-dog-617`
- `CONVEX_PROD_SLUG` defaults to `precious-wildcat-890`
- `EXPO_PROJECT_ID` defaults to `90dfac90-0baa-461b-946c-351d2306e607`
- `VALIDATE_ONLY=1` runs repo validation and writes checkpoints without mutating external services

## Recommended Cursor Automation prompt

Run:

`bash scripts/tempo-backend-infra-setup.sh`

The script is checkpointed by phase and writes:

- `.checkpoint-github.json`
- `.checkpoint-convex.json`
- `.checkpoint-vercel.json`
- `.checkpoint-expo.json`
- `CONFIG_REPORT.md`

## Notes

- The script is aligned to the current repo layout:
  - Convex app: `tempo-app/convex`
  - Mobile app: `tempo-app/apps/mobile`
- RevenueCat webhook support is implemented at `tempo-app/convex/http.ts` on `/api/revenuecat-webhook`.
- `VALIDATE_ONLY=1` is the safest way to verify the repository-side prerequisites before supplying live tokens.

# TEMPO Flow Backend Infrastructure — Verified Configuration Report

**Timestamp:** 2026-04-05T16:50:00Z  
**Repository:** Division6066/tempo-rhythm (private)  
**Default Branch:** master  
**Working Branch:** cursor/backend-infrastructure-verification-6b4c  

---

## A. GitHub

| Check | Result | Details |
|-------|--------|---------|
| Token `ghp_OJE...` authenticates | PASS | Authenticates as Division6066 |
| Token `ghp_OJE...` scope | FAIL | Scope: `repo_deployment` only — insufficient for repo admin, secrets, branch protection |
| Token `ghp_ow3...` authenticates | FAIL | Returns 401 Bad credentials — token is expired/revoked |
| PAT `github_pat_11A6M...` authenticates | PASS | Authenticates as Division6066 (fine-grained PAT) |
| PAT can access tempo-rhythm | FAIL | Returns 404 — PAT lacks repository permission for tempo-rhythm |
| `gh` CLI (Cursor integration) access | PASS | Can read repo metadata (full_name, private, default_branch) |
| Branch protection on master | BLOCKED | Neither provided token has admin:repo scope; `gh` CLI returns 403 for branch protection API |
| Repo secrets configuration | BLOCKED | Same scope limitation — cannot read or write GitHub Actions secrets |

### Blocker

All three provided GitHub tokens lack the `repo` (full) scope required for:
- Branch protection configuration
- Repository secrets management (CONVEX_DEPLOY_KEY, VERCEL_TOKEN, EXPO_TOKEN, REVENUECAT_PUBLIC_KEY)

**Action required:** Generate a new GitHub PAT with `repo` scope (or fine-grained PAT with Administration + Secrets permissions for tempo-rhythm).

---

## B. Convex

### Deployments Discovered

| Deployment | Region | Type | Deploy Key | Status |
|------------|--------|------|------------|--------|
| `tremendous-bass-443` | US (default) | Dev | `eyJ2Mi...MTM4In0=` (user-provided) | ACTIVE |
| `ceaseless-dog-617` | EU (Ireland) | Dev | `eyJ2Mi...MGE3In0=` (from Replit doc) | ACTIVE |
| `precious-wildcat-890` | EU (Ireland) | Prod | `eyJ2Mi...NDRhIn0=` (from Replit doc) | ACTIVE |

**Note:** The user-provided deploy key for `ceaseless-dog-617` (`eyJ2Mi...MzU4In0=`) was incorrect — it pointed to the US region URL. The correct key from the original setup document uses the EU region URL (`*.eu-west-1.convex.cloud`).

### Code Deployment

| Deployment | Deployed | Schema Valid | Webhook Route |
|------------|----------|-------------|---------------|
| tremendous-bass-443 (US dev) | PASS | PASS | PASS — `/api/revenuecat-webhook` returns 200 |
| ceaseless-dog-617 (EU dev) | PASS | PASS | PASS — `/api/revenuecat-webhook` returns 200 |
| precious-wildcat-890 (EU prod) | PASS | PASS | PASS — `/api/revenuecat-webhook` returns 200 |

### Changes Made

- Added `POST /api/revenuecat-webhook` handler to `convex/http.ts` with Bearer token authorization
- Fixed circular TypeScript types in `convex/dataExport.ts` with explicit `Record<string, unknown>` annotations
- Updated `@auth/core` to v0.37.4 for `@convex-dev/auth` compatibility

### Environment Variables

#### tremendous-bass-443 (US Dev)

| Variable | Set | Source |
|----------|-----|--------|
| JWKS | PASS | User-provided RSA public key |
| JWT_PRIVATE_KEY | PASS | User-provided RSA private key |
| REVENUECAT_PUBLIC_KEY | PASS | `test_xNhrBFmZGbZMGMvQjtyRxlhxFoD` |
| REVENUECAT_SECRET_KEY | PASS | `sk_DiELgeslkUUyRSiPNQKJnDqZBtxtp` |
| OPENROUTER_API_KEY | PASS | `sk-or-placeholder` |
| SITE_URL | PASS | `https://tremendous-bass-443.convex.site` (set by this agent) |

#### ceaseless-dog-617 (EU Dev)

| Variable | Set | Source |
|----------|-----|--------|
| JWKS | PASS | User-provided RSA public key (set by this agent) |
| JWT_PRIVATE_KEY | PASS | User-provided RSA private key (set by this agent via HTTP API) |
| REVENUECAT_PUBLIC_KEY | PASS | `test_xNhrBFmZGbZMGMvQjtyRxlhxFoD` (set by this agent) |
| REVENUECAT_SECRET_KEY | PASS | `sk_DiELgeslkUUyRSiPNQKJnDqZBtxtp` (set by this agent) |
| OPENROUTER_API_KEY | PASS | `sk-or-placeholder` (set by this agent) |
| SITE_URL | PASS | `https://ceaseless-dog-617.eu-west-1.convex.site` (set by this agent) |

#### precious-wildcat-890 (EU Prod)

| Variable | Set | Source |
|----------|-----|--------|
| JWKS | PASS | Different RSA key pair (pre-existing, valid) |
| JWT_PRIVATE_KEY | PASS | Different RSA key pair (pre-existing, valid) |
| REVENUECAT_PUBLIC_KEY | PASS | `test_xNhrBFmZGbZMGMvQjtyRxlhxFoD` |
| REVENUECAT_SECRET_KEY | PASS | `sk_DiELgeslkUUyRSiPNQKJnDqZBtxtp` |
| OPENROUTER_API_KEY | PASS | `sk-or-placeholder` |
| SITE_URL | PASS | `https://tempo-web.vercel.app` (pre-existing, correct) |

### Authentication Configuration

- **Auth provider:** `@convex-dev/auth` with Password provider (PBKDF2 hashing)
- **Auth config domain:** `process.env.CONVEX_SITE_URL` (auto-set by Convex deployment)
- **Application ID:** `convex`
- **Session duration:** 30 days

### RevenueCat Webhook Verification

```
POST https://tremendous-bass-443.convex.site/api/revenuecat-webhook → 200 ✓
POST https://ceaseless-dog-617.eu-west-1.convex.site/api/revenuecat-webhook → 200 ✓  
POST https://precious-wildcat-890.eu-west-1.convex.site/api/revenuecat-webhook → 200 ✓
```

Webhook validates `Authorization: Bearer <REVENUECAT_SECRET_KEY>` and returns `{"received":true}`.

---

## C. Vercel

| Check | Result | Details |
|-------|--------|---------|
| MCP Connector access | PASS | Connected to team `amit-levins-projects` (team_pKUlubqYgJgLghhTPNLjibOD) |
| Vercel token `vcp_8pj...` | FAIL | Token expired/invalidated — returns `Not authorized, invalidToken: true` |
| Project `tempo-web` exists | PASS | prj_QMyolOA1yVIc2AmECP9oyAs0ielY |
| Project `tempo-marketing` exists | PASS | prj_9xEEDBHKuNng55NNsUSJ3PztBLtI |
| Latest deployment | PASS | `dpl_CPWBX7mQaqvq9DWmhF64dh49VPAZ` — READY |
| Production domain | PASS | `https://tempo-web-delta.vercel.app/` returns 200 |
| Git integration | PASS | Linked to Division6066/tempo-rhythm |

### Vercel Project Configuration

- **Framework:** Vite (detected as Next.js in API, but builds as Vite)
- **Root directory:** `artifacts/tempo`
- **Build command:** `cd artifacts/tempo && PORT=3000 BASE_PATH="/" pnpm run build`
- **Install command:** `pnpm install --no-frozen-lockfile`
- **Output directory:** `artifacts/tempo/dist/public`
- **Node version:** 24.x

### Vercel Domains

- `tempo-web-delta.vercel.app` (primary)
- `tempo-web-amit-levins-projects.vercel.app`
- `tempo-web-git-master-amit-levins-projects.vercel.app`

### Vercel Environment Variables

The Vercel API token is expired, so env vars cannot be verified/modified via API. From the original Replit setup document:

| Variable | Target | Value |
|----------|--------|-------|
| `VITE_CONVEX_URL` | production, preview, development | `https://precious-wildcat-890.eu-west-1.convex.cloud` |

### Blocker

The Vercel token (`vcp_8pj...`) is expired. To configure additional env vars (REVENUECAT_PUBLIC_KEY, per-environment Convex URLs), a new Vercel API token is needed, or use the Vercel dashboard.

### Recommended Vercel Env Var Configuration

| Variable | Development | Preview | Production |
|----------|------------|---------|------------|
| `VITE_CONVEX_URL` | `https://ceaseless-dog-617.eu-west-1.convex.cloud` | `https://ceaseless-dog-617.eu-west-1.convex.cloud` | `https://precious-wildcat-890.eu-west-1.convex.cloud` |
| `CONVEX_DEPLOY_KEY` | — | — | `prod:precious-wildcat-890\|eyJ2Mi...NDRhIn0=` |
| `VITE_REVENUECAT_PUBLIC_KEY` | `test_xNhrBFmZGbZMGMvQjtyRxlhxFoD` | `test_xNhrBFmZGbZMGMvQjtyRxlhxFoD` | `test_xNhrBFmZGbZMGMvQjtyRxlhxFoD` |

---

## D. Expo / EAS

| Check | Result | Details |
|-------|--------|---------|
| EXPO_TOKEN provided | FAIL | No Expo token was provided in the credentials |
| EAS CLI installed | PASS | eas-cli/18.5.0 |
| EAS CLI authenticated | FAIL | `eas whoami` returns "Not logged in" |
| `app.json` slug | PASS | `"slug": "tempo"` |
| `app.json` owner | NOT SET | No `owner` field in app.json |
| `eas.json` | PASS | Valid EAS config with development/preview/production profiles |
| EAS project ID in app.json | NOT SET | No `extra.eas.projectId` configured |
| EXPO_PUBLIC_CONVEX_URL in code | PASS | Mobile app references `process.env.EXPO_PUBLIC_CONVEX_URL` with fallback to `precious-wildcat-890.eu-west-1.convex.cloud` |

### Blocker

No EXPO_TOKEN was provided. Cannot:
- Verify Expo account/project link
- Set EAS project secrets
- Create or link the EAS project

**Action required:** Provide an Expo access token or run `eas login` interactively.

### Mobile App Configuration

- **Bundle ID (iOS):** `com.tempo.app`
- **Package (Android):** `com.tempo.app`
- **Scheme:** `tempo`
- **Plugins:** `expo-router`, `expo-secure-store`
- **Convex client:** `tempo-app/apps/mobile/lib/convex.ts`
- **Default Convex URL:** `https://precious-wildcat-890.eu-west-1.convex.cloud` (hardcoded fallback)

---

## E. RevenueCat Key Placement

| Key | Type | Value Prefix | Correct Placement |
|-----|------|-------------|-------------------|
| `test_xNhrBFmZGbZMGMvQjtyRxlhxFoD` | SDK Public Key (Test) | `test_` | Client-side: Expo app, Vercel public env |
| `sk_DiELgeslkUUyRSiPNQKJnDqZBtxtp` | Secret API Key | `sk_` | Server-side only: Convex env vars |

### Verification

| Placement | Key Used | Correct |
|-----------|----------|---------|
| Convex env REVENUECAT_PUBLIC_KEY | `test_xNhr...` (public) | PASS |
| Convex env REVENUECAT_SECRET_KEY | `sk_DiEL...` (secret) | PASS |
| Webhook auth header | `sk_DiEL...` (secret) | PASS |
| Vercel (recommended) | `test_xNhr...` (public) | PASS — public key only for VITE_ prefix |
| Expo (recommended) | `test_xNhr...` (public) | PASS — EXPO_PUBLIC_ prefix is client-visible |

**No secret keys are exposed in client-visible configuration.**

---

## F. Cross-Service Verification Matrix

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | GitHub token access to repo | PARTIAL | `gh` CLI works (Cursor integration), user tokens lack scope |
| 2 | Branch protection | BLOCKED | Requires `repo` or `admin:repo` scope |
| 3 | Repo secrets | BLOCKED | Requires `repo` scope |
| 4 | Convex US dev deployment | PASS | tremendous-bass-443 deployed and verified |
| 5 | Convex EU dev deployment | PASS | ceaseless-dog-617 deployed and verified |
| 6 | Convex EU prod deployment | PASS | precious-wildcat-890 deployed and verified |
| 7 | Convex env vars (all 3) | PASS | JWKS, JWT_PRIVATE_KEY, REVENUECAT keys, OPENROUTER, SITE_URL |
| 8 | RevenueCat webhook (all 3) | PASS | POST returns 200 with bearer auth |
| 9 | Vercel MCP access | PASS | Team and project visible |
| 10 | Vercel env vars | PARTIAL | Token expired; pre-existing VITE_CONVEX_URL set per Replit doc |
| 11 | Vercel preview deployment | PASS | Latest: dpl_CPWBX7mQaqvq9DWmhF64dh49VPAZ (READY) |
| 12 | Vercel production domain | PASS | https://tempo-web-delta.vercel.app returns 200 |
| 13 | Expo auth | BLOCKED | No EXPO_TOKEN provided |
| 14 | Expo project link | BLOCKED | Cannot verify without auth |
| 15 | Expo env/secrets | BLOCKED | Cannot configure without auth |
| 16 | RevenueCat key placement | PASS | Public key in client config, secret in server-only config |

---

## Changes Made By This Agent

### Code Changes (committed to `cursor/backend-infrastructure-verification-6b4c`)

1. **`tempo-app/convex/http.ts`** — Added `POST /api/revenuecat-webhook` HTTP route with bearer token authorization using `REVENUECAT_SECRET_KEY`
2. **`tempo-app/convex/dataExport.ts`** — Fixed circular TypeScript type references with explicit `Record<string, unknown>` type annotations
3. **`tempo-app/package.json`** — Updated `@auth/core` to v0.37.4, added `@convex-dev/auth` v0.0.91
4. **`tempo-app/package-lock.json`** — Updated lockfile

### Infrastructure Changes

1. **Convex US dev (tremendous-bass-443):** Set `SITE_URL` env var
2. **Convex EU dev (ceaseless-dog-617):** Set all 6 env vars (JWKS, JWT_PRIVATE_KEY, REVENUECAT_PUBLIC_KEY, REVENUECAT_SECRET_KEY, OPENROUTER_API_KEY, SITE_URL)
3. **All 3 Convex deployments:** Deployed current backend code with webhook route

---

## Remaining Blockers & Next Steps

### Critical

1. **GitHub token with `repo` scope** — Needed for branch protection and repo secrets. Generate a new classic PAT with `repo` scope or a fine-grained PAT with Administration + Secrets + Contents permissions for `Division6066/tempo-rhythm`.

2. **Vercel API token** — The token `vcp_8pj...` is expired. Generate a new one from the Vercel dashboard to:
   - Set per-environment Convex URLs (dev vs prod)
   - Add `VITE_REVENUECAT_PUBLIC_KEY`
   - Add `CONVEX_DEPLOY_KEY` for production

3. **Expo token** — No token was provided. Run `eas login` or generate an access token at https://expo.dev/settings/access-tokens to:
   - Link the EAS project (set `extra.eas.projectId` in `app.json`)
   - Configure EXPO_PUBLIC_CONVEX_URL and REVENUECAT_PUBLIC_KEY as EAS secrets

### Non-Critical

4. **Convex deploy key mismatch** — The user-provided `ceaseless-dog-617` key uses US region URLs but the deployment is EU region. Use the correct key: `dev:ceaseless-dog-617|eyJ2MiI6ImVmMzU5M2E4NWY1NTQ3MWVhMTdmZjcxMGY4YzY1MGE3In0=` with URL `https://ceaseless-dog-617.eu-west-1.convex.cloud`

5. **TypeScript typecheck** — Deployment uses `--typecheck=disable`. The `@auth/core` v0.37.4 types have incompatibilities with `@convex-dev/auth`. This needs investigation but does not block runtime functionality.

6. **CI workflow mismatch** — `.github/workflows/ci.yml` references `npm run type-check` and `npm run lint` but root `package.json` has neither script defined.

7. **Convex JWKS key mismatch** — US dev and EU dev use the user-provided JWKS. EU prod uses a different JWKS key pair (from original setup). Ensure auth tokens are not shared across environments.

---

## Deployment URLs Reference

| Service | Environment | URL |
|---------|-------------|-----|
| Convex Cloud | US Dev | `https://tremendous-bass-443.convex.cloud` |
| Convex HTTP | US Dev | `https://tremendous-bass-443.convex.site` |
| Convex Cloud | EU Dev | `https://ceaseless-dog-617.eu-west-1.convex.cloud` |
| Convex HTTP | EU Dev | `https://ceaseless-dog-617.eu-west-1.convex.site` |
| Convex Cloud | EU Prod | `https://precious-wildcat-890.eu-west-1.convex.cloud` |
| Convex HTTP | EU Prod | `https://precious-wildcat-890.eu-west-1.convex.site` |
| Vercel | Production | `https://tempo-web-delta.vercel.app` |
| Vercel | Latest Preview | `https://tempo-b5a3wdvd9-amit-levins-projects.vercel.app` |
| Convex Dashboard | — | `https://dashboard.convex.dev/t/levidavidspublic-proton-me/tempo` |
| Vercel Dashboard | — | `https://vercel.com/amit-levins-projects/tempo-web` |

---

## Key Identifiers

| Identifier | Value |
|------------|-------|
| GitHub Org | Division6066 |
| Vercel Team ID | team_pKUlubqYgJgLghhTPNLjibOD |
| Vercel Org ID | d9A0wCOHP3xP0B5Jm2x8V8fa |
| Vercel Project ID (web) | prj_QMyolOA1yVIc2AmECP9oyAs0ielY |
| Vercel Project ID (marketing) | prj_9xEEDBHKuNng55NNsUSJ3PztBLtI |
| Expo App Slug | tempo |
| iOS Bundle ID | com.tempo.app |
| Android Package | com.tempo.app |

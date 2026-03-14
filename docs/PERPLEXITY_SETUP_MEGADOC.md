# TEMPO — Perplexity Computer Setup Mega-Prompts

> **What is this document?**
> This file contains 8 self-contained prompts you can copy-paste into [Perplexity Computer](https://www.perplexity.ai/) to have it walk through setting up every external service TEMPO needs. Each prompt gives Perplexity full context so it can execute independently. Work through them in order — later stages depend on credentials from earlier ones.

> **Note on UI labels**: Vendor dashboards (Vercel, RevenueCat, Apple, Google, Expo, OpenRouter) update their interfaces periodically. Button names and menu paths in this document are accurate as of early 2026 but may vary slightly. The TROUBLESHOOTING section in each stage covers common navigation differences.

---

## MASTER CHECKLIST

Complete each stage in order. Check off items as you go and collect credentials at each step.

| # | Stage | Est. Time | Dependencies | Key Credentials Produced |
|---|-------|-----------|-------------|--------------------------|
| 1 | Convex Backend Setup | 5 min | None | Convex URL, Deploy Key |
| 2 | Vercel Hosting Setup | 5–10 min | Stage 1 (Convex URL) | Vercel Token, Org ID, 2× Project IDs |
| 3 | RevenueCat Payments Setup | 10 min | None | RC Public API Key, REST API Secret, Project ID |
| 4 | Apple Developer Account | 15–30 min + wait | Stage 3 (RevenueCat) | Apple Team ID, ASC API Key (.p8), Key ID, Issuer ID |
| 5 | Google Play Developer Account | 15–30 min | Stage 3 (RevenueCat) | Service Account JSON, Developer Account ID |
| 6 | Expo & EAS Build Config | 10–15 min | Stages 1, 3, 4, 5 | Expo slug, EAS Project ID |
| 7 | AI API Setup (OpenRouter) | 5 min | None | API Key, Base URL, model names |
| 8 | Custom Domain & DNS (Optional) | 10 min | Stages 1, 2 | Final URLs |

### Dependency Graph

```
Stage 1 (Convex) ──┬──▶ Stage 2 (Vercel)
                   ├──▶ Stage 6 (Expo/EAS)
                   └──▶ Stage 8 (DNS)

Stage 3 (RevenueCat) ──┬──▶ Stage 4 (Apple)
                       ├──▶ Stage 5 (Google Play)
                       └──▶ Stage 6 (Expo/EAS)

Stage 4 (Apple) ──────▶ Stage 6 (Expo/EAS)
Stage 5 (Google Play) ─▶ Stage 6 (Expo/EAS)

Stage 7 (AI API) ──────▶ (independent — do anytime)
Stage 8 (DNS) ─────────▶ (optional — do last)
```

---

## TEMPO PROJECT CONTEXT (included in every prompt)

Use this block as-is. Each stage prompt below includes it so Perplexity has full context.

```
PROJECT: TEMPO — ADHD-friendly AI daily planner
TECH STACK: React + Vite + Tailwind (web), Expo React Native (mobile), Convex (backend), Vercel (hosting)
BUNDLE ID: com.tempo.app
APP NAME: TEMPO
APP SLUG: tempo

PRICING TIERS:
  Free  — $0/mo   (Basic Daily Plan, Standard Tasks, 5 AI suggestions/day, Community Support)
  Pro   — $9/mo   (Unlimited AI, Calendar Sync, Voice Memos, Focus Timers, Priority Support) — 14-day free trial
  Team  — $19/mo/user (Shared Workspaces, Delegation, Admin Controls, Dedicated Manager)

DATABASE TABLES (Convex, 14 app tables + auth tables): profiles, tasks, notes, projects, folders, tags, dailyPlans, preferences, memories, stagedSuggestions, calendarEvents, noteLinks, savedFilters, templates

AI MODELS (OpenRouter IDs):
  Primary: mistralai/ministral-3b-latest (fast daily planning)
  Backup:  mistralai/magistral-medium-latest (higher quality)
  Council: 6 models queried in parallel for best answer
```

---

## STAGE 1 — CONVEX BACKEND SETUP

Copy everything in the box below and paste it into Perplexity Computer:

```
=== PERPLEXITY COMPUTER PROMPT — TEMPO STAGE 1: CONVEX BACKEND ===

CONTEXT:
I am setting up external services for TEMPO, an ADHD-friendly AI daily planner app.
Tech stack: React + Vite + Tailwind (web), Expo React Native (mobile), Convex (real-time backend), Vercel (hosting).
Bundle ID: com.tempo.app | App name: TEMPO | App slug: tempo
Pricing tiers: Free ($0/mo), Pro ($9/mo, 14-day trial), Team ($19/mo/user)
The Convex backend code (14 app tables + auth tables, all query/mutation functions) is already written and ready to deploy. I just need the cloud project and credentials.
Tables: profiles, tasks, notes, projects, folders, tags, dailyPlans, preferences, memories, stagedSuggestions, calendarEvents, noteLinks, savedFilters, templates

YOUR TASK:
Set up a Convex backend project for TEMPO. Follow these exact steps:

STEP 1 — CREATE ACCOUNT
1. Go to https://dashboard.convex.dev
2. Click "Sign up" or "Get started"
3. Sign up using GitHub (fastest option)
4. Complete any onboarding prompts

STEP 2 — CREATE PROJECT
1. Once logged in, click "Create a project" (or "New project")
2. Project name: tempo
3. Click Create
4. Wait for the project dashboard to load

STEP 3 — COPY DEPLOYMENT URL
1. On the project dashboard, find the Deployment URL
   - It may be shown directly, or go to Settings → General
2. The URL looks like: https://something-something-123.convex.cloud
3. Copy the ENTIRE URL including https://
4. ► SCREENSHOT/COPY THIS NOW: the Deployment URL

STEP 4 — GENERATE DEPLOY KEY
1. In the project, go to Settings (gear icon or sidebar)
2. Find the "Deploy Keys" section
3. Click "Generate Deploy Key" (or "Create Deploy Key")
4. A long key string will appear — it starts with prod:
5. Copy the ENTIRE key string (it's long — make sure you get all of it)
6. ► SCREENSHOT/COPY THIS NOW: the Deploy Key

STEP 5 — ENABLE AUTHENTICATION
1. Still in Settings, find "Authentication" section
2. Click to configure authentication providers
3. Enable "Email/Password" authentication (simplest, no external setup needed)
4. Save the configuration

STEP 6 — ADD ENVIRONMENT VARIABLES (optional — can be done later)
1. In Settings, find "Environment Variables" section
2. Add these variables (leave values blank if you don't have them yet — they can be set later):
   - OLLAMA_API_KEY — (your AI API key, from Stage 7)
   - OLLAMA_API_URL — (your AI API base URL, from Stage 7)
   - OLLAMA_MODEL — (your preferred model name, from Stage 7)

VERIFICATION:
- [ ] Project "tempo" appears in your Convex dashboard
- [ ] You can see the Deployment URL (format: https://xxx.convex.cloud)
- [ ] You have a Deploy Key (format: prod:xxxx...)
- [ ] Authentication → Email/Password is enabled

WHAT TO BRING BACK — copy these exact values:
  Convex URL:        https://[your-project-slug].convex.cloud
  Convex Deploy Key: prod:[your-key]

TROUBLESHOOTING:
- If GitHub signup fails: Try email signup instead, then link GitHub later
- If you can't find Deploy Keys: Look under Settings → Deploy Keys, or Settings → API Keys
- If the Deploy Key doesn't start with "prod:": You may have generated a dev key — look for a "Production" toggle or section
- If Authentication section is missing: Check under "Auth" or "Identity" in the sidebar
- If the dashboard seems stuck: Refresh the page — Convex dashboard occasionally needs a reload

=== END STAGE 1 ===
```

---

## STAGE 2 — VERCEL HOSTING SETUP

Copy everything in the box below and paste it into Perplexity Computer:

```
=== PERPLEXITY COMPUTER PROMPT — TEMPO STAGE 2: VERCEL HOSTING ===

CONTEXT:
I am setting up external services for TEMPO, an ADHD-friendly AI daily planner app.
Tech stack: React + Vite + Tailwind (web), Expo React Native (mobile), Convex (real-time backend), Vercel (hosting).
Bundle ID: com.tempo.app | App name: TEMPO | App slug: tempo
Pricing tiers: Free ($0/mo), Pro ($9/mo, 14-day trial), Team ($19/mo/user)
I need two Vercel projects: one for the main app and one for the marketing site.
Both are Vite-based React apps.

PREREQUISITE — You need the Convex URL from Stage 1:
  Convex URL: [paste your Convex URL here, e.g. https://something.convex.cloud]

YOUR TASK:
Set up Vercel hosting for TEMPO with two projects. Follow these exact steps:

STEP 1 — CREATE ACCOUNT
1. Go to https://vercel.com
2. Click "Sign Up"
3. Sign up with GitHub (fastest — links to your repos automatically)
4. Complete any onboarding flow

STEP 2 — CREATE PROJECT 1: TEMPO WEB APP
1. Click "Add New" → "Project" (or "New Project")
2. You can skip the "Import Git Repository" step if prompted
3. Project name: tempo-web
4. Framework Preset: Vite
5. Click "Deploy" or "Create" (the initial deploy may fail — that's fine, we just need the project created)

STEP 3 — CREATE PROJECT 2: TEMPO MARKETING SITE
1. Go back to the dashboard (click Vercel logo or "Overview")
2. Click "Add New" → "Project" again
3. Project name: tempo-marketing
4. Framework Preset: Vite
5. Click "Deploy" or "Create"

STEP 4 — GENERATE API TOKEN
1. Click your profile/avatar icon in the top-right corner
2. Click "Settings" (or go directly to https://vercel.com/account/tokens)
3. In the left sidebar, click "Tokens"
4. Click "Create" (or "Create Token")
5. Token name: replit-deploy
6. Scope: Full Account (or leave default)
7. Expiration: No expiration (or set a long duration)
8. Click "Create Token"
9. IMPORTANT: Copy the token IMMEDIATELY — you will NOT be able to see it again
10. ► SCREENSHOT/COPY THIS NOW: the API Token (cannot be retrieved later)

STEP 5 — COPY ORG ID
1. Go to Account Settings → General (or https://vercel.com/account)
2. Scroll to the bottom of the page
3. Find "Vercel ID" (may also be labeled "Your ID" or "Team ID")
4. Copy this ID

STEP 6 — COPY PROJECT IDs
1. Go to your Vercel dashboard → click into the "tempo-web" project
2. Go to Settings → General
3. Find "Project ID" and copy it
4. Go back to dashboard → click into the "tempo-marketing" project
5. Go to Settings → General
6. Find "Project ID" and copy it

STEP 7 — SET ENVIRONMENT VARIABLES ON TEMPO-WEB
1. In the tempo-web project, go to Settings → Environment Variables
2. Add a new variable:
   - Key: VITE_CONVEX_URL
   - Value: [paste the Convex URL from Stage 1]
   - Environments: Production, Preview, Development (all three)
3. Click "Save"

STEP 8 — SET ENVIRONMENT VARIABLES ON TEMPO-MARKETING
1. In the tempo-marketing project, go to Settings → Environment Variables
2. Add the same variable:
   - Key: VITE_CONVEX_URL
   - Value: [paste the Convex URL from Stage 1]
   - Environments: Production, Preview, Development (all three)
3. Click "Save"

VERIFICATION:
- [ ] Two projects exist: "tempo-web" and "tempo-marketing"
- [ ] You have an API token named "replit-deploy"
- [ ] You have the Org ID from Account Settings
- [ ] You have both Project IDs
- [ ] VITE_CONVEX_URL is set on both projects

WHAT TO BRING BACK — copy these exact values:
  Vercel Token:                  [your-token]
  Vercel Org ID:                 [your-org-id]
  Vercel Project ID (app):       [tempo-web project ID]
  Vercel Project ID (marketing): [tempo-marketing project ID]

TROUBLESHOOTING:
- If you can't create a project without importing a repo: Choose "Continue without Git" or create a blank project
- If the token disappears before you copy it: Delete the old token and create a new one — you cannot recover a lost token
- If you can't find the Org ID: It may be labeled "Vercel ID" or "Team ID" — it's always at the bottom of Account Settings → General
- If environment variables don't save: Make sure you selected at least one environment (Production/Preview/Development)
- If the framework preset doesn't show "Vite": Choose "Other" and we'll configure the build settings from Replit

=== END STAGE 2 ===
```

---

## STAGE 3 — REVENUECAT PAYMENTS SETUP

Copy everything in the box below and paste it into Perplexity Computer:

```
=== PERPLEXITY COMPUTER PROMPT — TEMPO STAGE 3: REVENUECAT PAYMENTS ===

CONTEXT:
I am setting up external services for TEMPO, an ADHD-friendly AI daily planner app.
Tech stack: React + Vite + Tailwind (web), Expo React Native (mobile), Convex (real-time backend), Vercel (hosting).
Bundle ID: com.tempo.app | App name: TEMPO | App slug: tempo
TEMPO has three pricing tiers:
  Free  — $0/mo   (Basic Daily Plan, Standard Tasks, 5 AI/day, Community Support)
  Pro   — $9/mo   (Unlimited AI, Calendar Sync, Voice Memos, Focus Timers, Priority Support) — includes 14-day free trial
  Team  — $19/mo per user (Shared Workspaces, Delegation, Admin Controls, Dedicated Manager)

RevenueCat manages in-app subscriptions across iOS and Android.

YOUR TASK:
Set up RevenueCat for TEMPO's subscription management. Follow these exact steps:

STEP 1 — CREATE ACCOUNT
1. Go to https://app.revenuecat.com
2. Click "Sign Up" or "Get Started"
3. Create an account with your email or Google/GitHub

STEP 2 — CREATE PROJECT
1. Once logged in, click "Create a new project" (or "Add Project")
2. Project name: TEMPO
3. Click Create

STEP 3 — CREATE ENTITLEMENTS
Entitlements define what features a user gets access to. Create these three:

1. Click "Entitlements" in the left sidebar (under Project Settings or Products)
2. Create entitlement: free
   - Identifier: free
   - Description: Basic free tier access
3. Create entitlement: pro
   - Identifier: pro
   - Description: Pro tier — unlimited AI, calendar sync, voice memos, focus timers
4. Create entitlement: team
   - Identifier: team
   - Description: Team tier — shared workspaces, delegation, admin controls

STEP 4 — CREATE PRODUCTS
Products map to actual App Store / Play Store subscription products. Create these:

1. Click "Products" in the sidebar
2. Create product: tempo_free
   - Identifier: tempo_free
   - App Store Product ID: tempo_free (will be linked to stores in Stages 4-5)
   - Associate with entitlement: free
3. Create product: tempo_pro_monthly
   - Identifier: tempo_pro_monthly
   - App Store Product ID: tempo_pro_monthly
   - Associate with entitlement: pro
4. Create product: tempo_team_monthly
   - Identifier: tempo_team_monthly
   - App Store Product ID: tempo_team_monthly
   - Associate with entitlement: team

STEP 5 — CREATE OFFERINGS
Offerings are what the user sees in the paywall. Create 3 offerings matching the pricing tiers:

1. Click "Offerings" in the sidebar
2. Create offering 1 — Free:
   - Identifier: free
   - Description: Free tier — Basic Daily Plan, Standard Tasks, 5 AI/day, Community Support
   - Add package:
     - Identifier: $rc_monthly (or "free")
     - Product: tempo_free

3. Create offering 2 — Pro:
   - Identifier: pro
   - Description: Pro tier — $9/mo, Unlimited AI, Calendar Sync, Voice Memos, Focus Timers, Priority Support (14-day trial)
   - Add package:
     - Identifier: $rc_monthly (or "pro_monthly")
     - Product: tempo_pro_monthly

4. Create offering 3 — Team:
   - Identifier: team
   - Description: Team tier — $19/mo/user, Shared Workspaces, Delegation, Admin Controls, Dedicated Manager
   - Add package:
     - Identifier: $rc_monthly (or "team_monthly")
     - Product: tempo_team_monthly

STEP 6 — COPY API KEYS
1. In the left sidebar, click "API Keys" (under Project Settings)
2. Find the "Public app-specific API key"
   - This starts with something like appl_ or goog_ — there may be separate keys per platform
   - If there's a single public key, copy that
3. Find the "REST API secret key" (or "Secret API key")
   - This is for server-side webhook validation
   - It may be labeled v1 or v2 — copy the v2 if available
4. Copy the Project ID from the project settings page
5. ► SCREENSHOT/COPY THIS NOW: Public API Key, REST API Secret, and Project ID

VERIFICATION:
- [ ] Project "TEMPO" exists in RevenueCat
- [ ] 3 entitlements created: free, pro, team
- [ ] 3 products created: tempo_free, tempo_pro_monthly, tempo_team_monthly
- [ ] 3 offerings created: free, pro, team (each with its package)
- [ ] You have the Public API Key
- [ ] You have the REST API Secret Key
- [ ] You have the Project ID

WHAT TO BRING BACK — copy these exact values:
  RevenueCat Public API Key: [your-public-key]
  RevenueCat REST API Secret: [your-secret-key]
  RevenueCat Project ID:      [your-project-id]

TROUBLESHOOTING:
- If you can't find "Entitlements": It may be under "Project Settings" → "Entitlements" or directly in the sidebar
- If product creation asks for an App Store/Play Store connection: Skip the store connection for now — that happens in Stages 4 and 5
- If the API keys page shows multiple keys: The "Public" one is for the mobile SDK (safe to embed in app), the "Secret" one is for server-side only
- If offerings are confusing: Think of it as: Offering = a paywall screen, Package = a plan option within that screen, Product = the actual store subscription
- If you see "Platform" options: You can set up iOS and Android platforms later when you have the store accounts (Stages 4-5)

=== END STAGE 3 ===
```

---

## STAGE 4 — APPLE DEVELOPER ACCOUNT SETUP

Copy everything in the box below and paste it into Perplexity Computer:

```
=== PERPLEXITY COMPUTER PROMPT — TEMPO STAGE 4: APPLE DEVELOPER ===

CONTEXT:
I am setting up external services for TEMPO, an ADHD-friendly AI daily planner app.
Tech stack: React + Vite + Tailwind (web), Expo React Native (mobile), Convex (real-time backend), Vercel (hosting).
Bundle ID: com.tempo.app | App name: TEMPO | App slug: tempo
Pricing tiers: Free ($0/mo), Pro ($9/mo, 14-day trial), Team ($19/mo/user)
Store subscription pricing:
  Pro  — $9.99/mo auto-renewable subscription with 14-day free trial
  Team — $19.99/mo per user auto-renewable subscription

I already have RevenueCat set up (Stage 3) and need to connect it to the Apple App Store.

IMPORTANT: Apple Developer enrollment costs $99/year and may take 24-48 hours for approval. You can start this process and continue with other stages while waiting.

YOUR TASK:
Set up an Apple Developer account and App Store Connect for TEMPO. Follow these exact steps:

STEP 1 — ENROLL IN APPLE DEVELOPER PROGRAM
1. Go to https://developer.apple.com/account
2. Sign in with your Apple ID (or create one)
3. Click "Enroll" or "Join the Apple Developer Program"
4. Choose Individual or Organization enrollment
5. Pay the $99/year fee
6. Wait for enrollment approval (can take 24-48 hours)
   → If not yet approved, STOP HERE and come back when you receive the approval email

STEP 2 — CREATE APP IN APP STORE CONNECT
1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" (or "Apps")
3. Click the "+" button → "New App"
4. Fill in:
   - Platform: iOS
   - Name: TEMPO
   - Primary Language: English (U.S.)
   - Bundle ID: Select "com.tempo.app" (if not listed, register it first — see troubleshooting)
   - SKU: tempo-app
5. Click "Create"

STEP 3 — REGISTER BUNDLE ID (if not already registered)
1. Go to https://developer.apple.com/account/resources/identifiers/list
2. Click the "+" button
3. Select "App IDs" → Continue
4. Select "App" → Continue
5. Description: TEMPO
6. Bundle ID: Explicit → com.tempo.app
7. Enable any capabilities you need (Push Notifications, Sign in with Apple, In-App Purchase)
8. Click "Continue" → "Register"

STEP 4 — CREATE IN-APP SUBSCRIPTIONS
1. In App Store Connect, go to your TEMPO app
2. Click "Subscriptions" in the sidebar (under "Features" or "In-App Purchases")
3. Create a Subscription Group:
   - Name: TEMPO Plans
4. Inside the "TEMPO Plans" group, create subscriptions:

   Subscription 1:
   - Reference Name: TEMPO Pro Monthly
   - Product ID: tempo_pro_monthly
   - Duration: 1 Month
   - Price: $9.99
   - Free Trial: 14 days (under "Subscription Prices" → "Introductory Offers" → "Free Trial")
   - Subscription Description (for Review):
     - Name: TEMPO Pro
     - Description: Unlimited AI planning, calendar sync, voice memos, focus timers, and priority support.

   Subscription 2:
   - Reference Name: TEMPO Team Monthly
   - Product ID: tempo_team_monthly
   - Duration: 1 Month
   - Price: $19.99
   - No free trial
   - Subscription Description (for Review):
     - Name: TEMPO Team
     - Description: Shared workspaces, team task delegation, admin controls, and dedicated success manager.

STEP 5 — GENERATE APP STORE CONNECT API KEY
1. In App Store Connect, go to "Users and Access" (top menu)
2. Click "Integrations" (or "Keys") tab
3. Click the "+" to generate a new key
4. Name: TEMPO-EAS-Build
5. Access: Admin (or Developer if Admin is not available)
6. Click "Generate"
7. IMPORTANT: Download the .p8 key file IMMEDIATELY — you can only download it once
8. ► SCREENSHOT/COPY THIS NOW: download the .p8 file, note the Key ID and Issuer ID
9. Note the Key ID shown next to the key name
10. Note the Issuer ID shown at the top of the keys page

STEP 6 — GET APP-SPECIFIC SHARED SECRET (for RevenueCat)
1. In App Store Connect, go to your TEMPO app
2. Go to "Subscriptions" (or "In-App Purchases")
3. Click "App-Specific Shared Secret" (or find it under "Manage" near your subscription group)
4. Click "Generate" if no secret exists
5. Copy the shared secret

STEP 7 — CONNECT TO REVENUECAT
1. Go to https://app.revenuecat.com
2. Open your TEMPO project
3. In the left sidebar, find "Apps" or platform configuration
4. Click "Apple App Store" (or "Add App" → "iOS")
5. Enter:
   - App Name: TEMPO
   - Bundle ID: com.tempo.app
   - App-Specific Shared Secret: [paste from Step 6]
6. Optionally, add the App Store Connect API Key:
   - Upload the .p8 file from Step 5
   - Enter the Key ID
   - Enter the Issuer ID
7. Save

STEP 8 — NOTE YOUR APPLE TEAM ID
1. Go to https://developer.apple.com/account
2. In the top right or under Membership, find your Team ID
3. It's a 10-character alphanumeric string (e.g., A1B2C3D4E5)
4. Copy it

VERIFICATION:
- [ ] Apple Developer account is enrolled and approved
- [ ] Bundle ID "com.tempo.app" is registered
- [ ] App "TEMPO" exists in App Store Connect
- [ ] Subscription group "TEMPO Plans" exists with two subscriptions
- [ ] tempo_pro_monthly — $9.99/mo with 14-day free trial
- [ ] tempo_team_monthly — $19.99/mo
- [ ] App Store Connect API Key (.p8 file) downloaded
- [ ] Key ID and Issuer ID noted
- [ ] RevenueCat connected to Apple App Store
- [ ] Apple Team ID copied

WHAT TO BRING BACK — copy these exact values:
  Apple Team ID:                 [10-char alphanumeric]
  App Store Connect API Key:     [the .p8 file — save it securely]
  App Store Connect Key ID:      [from the keys page]
  App Store Connect Issuer ID:   [from the top of the keys page]

TROUBLESHOOTING:
- If enrollment is still pending: You can complete Stages 5, 6, 7 while waiting. Come back to this after approval.
- If "com.tempo.app" doesn't appear in bundle ID dropdown: You need to register it first (Step 3)
- If you can't find "Subscriptions": Look under "Features" → "In-App Purchases" in the app sidebar
- If the .p8 file download button is grayed out: You can only download once — if you missed it, revoke the key and generate a new one
- If the Issuer ID is not visible: It appears at the top of the "Integrations" / "Keys" page, above the list of keys
- If RevenueCat doesn't accept the shared secret: Make sure it's the App-SPECIFIC shared secret, not the master shared secret
- If you need to set up Sandbox testers: Go to Users and Access → Sandbox → add a test Apple ID

=== END STAGE 4 ===
```

---

## STAGE 5 — GOOGLE PLAY DEVELOPER ACCOUNT SETUP

Copy everything in the box below and paste it into Perplexity Computer:

```
=== PERPLEXITY COMPUTER PROMPT — TEMPO STAGE 5: GOOGLE PLAY DEVELOPER ===

CONTEXT:
I am setting up external services for TEMPO, an ADHD-friendly AI daily planner app.
Tech stack: React + Vite + Tailwind (web), Expo React Native (mobile), Convex (real-time backend), Vercel (hosting).
Bundle ID / Package name: com.tempo.app | App name: TEMPO | App slug: tempo
Pricing tiers: Free ($0/mo), Pro ($9/mo, 14-day trial), Team ($19/mo/user)
Store subscription pricing:
  Pro  — $9.99/mo auto-renewable subscription with 14-day free trial
  Team — $19.99/mo per user auto-renewable subscription

I already have RevenueCat set up (Stage 3) and need to connect it to Google Play.

IMPORTANT: Google Play Developer registration costs $25 (one-time) and identity verification may take a few days.

YOUR TASK:
Set up a Google Play Developer account and create the TEMPO app listing. Follow these exact steps:

STEP 1 — REGISTER FOR GOOGLE PLAY CONSOLE
1. Go to https://play.google.com/console
2. Sign in with your Google account
3. Click "Create developer account" or "Register"
4. Pay the $25 one-time registration fee
5. Complete identity verification (may require ID upload — can take 1-3 days)
   → If verification is pending, continue with what you can

STEP 2 — CREATE THE APP
1. In the Play Console, click "Create app"
2. Fill in:
   - App name: TEMPO
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free (the app is free with in-app subscriptions)
3. Accept the declarations (Developer Program Policies, US export laws)
4. Click "Create app"

STEP 3 — COMPLETE APP CONTENT DECLARATIONS
These are required before you can publish or even set up subscriptions:

1. Go to your app → "App content" (or "Policy" → "App content")
2. Complete each section:
   - Privacy policy: Enter your privacy policy URL (e.g., https://yourdomain.com/privacy or a placeholder)
   - Ads: Declare "No, my app does not contain ads"
   - App access: Choose "All functionality is available without special access" (or configure restricted access)
   - Content rating: Complete the IARC questionnaire — TEMPO is a productivity app, no violence/sexual content
   - Target audience: Select 18+ (or "Not designed for children")
   - News app: No
   - Data safety: Declare what data TEMPO collects (account info, task data, usage analytics)
3. Save each section

STEP 4 — CREATE SUBSCRIPTIONS
1. In the Play Console, go to your TEMPO app
2. Click "Monetize" → "Products" → "Subscriptions" (in the left sidebar)
3. Create subscription 1:
   - Product ID: tempo_pro_monthly
   - Name: TEMPO Pro
   - Description: Unlimited AI planning, calendar sync, voice memos, focus timers, and priority support.
   - Add a base plan:
     - Billing period: 1 month
     - Price: $9.99
     - Add offer: Free trial — 14 days
   - Click "Save" → "Activate"
4. Create subscription 2:
   - Product ID: tempo_team_monthly
   - Name: TEMPO Team
   - Description: Shared workspaces, team task delegation, admin controls, and dedicated success manager.
   - Add a base plan:
     - Billing period: 1 month
     - Price: $19.99
     - No free trial
   - Click "Save" → "Activate"

STEP 5 — SET UP API ACCESS (Service Account)
1. In the Play Console, go to "Setup" → "API access" (in the left sidebar, may be under "Settings")
2. If prompted, click "Link" to link to a Google Cloud project
   - If no Cloud project exists: Click "Create new project" — this creates one automatically
   - If one exists: Link to it
3. Under "Service accounts", click "Create new service account"
4. This opens Google Cloud Console. In Cloud Console:
   a. Click "Create Service Account"
   b. Service account name: tempo-play-deploy
   c. Service account ID: tempo-play-deploy (auto-filled)
   d. Description: Service account for TEMPO Play Store deployment
   e. Click "Create and Continue"
   f. Role: Select "Service Account User" (under "Service Accounts")
   g. Click "Continue" → "Done"
   h. Click on the newly created service account
   i. Go to "Keys" tab
   j. Click "Add Key" → "Create new key"
   k. Key type: JSON
   l. Click "Create" — the JSON file downloads automatically
   m. ► SCREENSHOT/COPY THIS NOW: save the JSON credentials file securely
   n. Save this file securely
5. Go back to Play Console → "API access"
6. Click "Grant access" next to the service account
7. Set permissions:
   - App permissions: Select your TEMPO app
   - Account permissions: Admin (all permissions), or at minimum: "Manage store presence", "Manage orders and subscriptions", "View financial data"
8. Click "Invite user" → "Send invitation"

STEP 6 — CONNECT TO REVENUECAT
1. Go to https://app.revenuecat.com
2. Open your TEMPO project
3. In the left sidebar, find "Apps" or platform configuration
4. Click "Google Play Store" (or "Add App" → "Android")
5. Enter:
   - App Name: TEMPO
   - Package Name: com.tempo.app
6. Upload the Service Account JSON credentials file (from Step 5)
7. Save

STEP 7 — NOTE YOUR DEVELOPER ACCOUNT ID
1. In the Play Console, go to "Settings" (gear icon) → "Developer account" → "Account details"
2. Find "Developer Account ID" (it's a numeric ID)
3. Copy it

VERIFICATION:
- [ ] Google Play Developer account is registered and verified
- [ ] App "TEMPO" created with package name com.tempo.app
- [ ] App content declarations completed
- [ ] Subscription "tempo_pro_monthly" — $9.99/mo with 14-day trial — active
- [ ] Subscription "tempo_team_monthly" — $19.99/mo — active
- [ ] Service Account created and JSON key downloaded
- [ ] Service Account granted Admin access in Play Console
- [ ] RevenueCat connected to Google Play Store
- [ ] Developer Account ID copied

WHAT TO BRING BACK — copy these exact values:
  Google Play Service Account JSON: [the .json file — save it securely]
  Google Play Developer Account ID: [numeric ID from account settings]

TROUBLESHOOTING:
- If identity verification is pending: You can still create the app and set up most things. Subscriptions and publishing require verification.
- If "Subscriptions" is grayed out: Complete the app content declarations first (Step 3) — Google requires this before monetization
- If you can't find "API access": Look under "Setup" in the left sidebar, or "Settings" → "API access"
- If the service account doesn't appear in Play Console: After creating it in Cloud Console, go back to Play Console → API access and click "Refresh"
- If the JSON key download fails: You can create another key for the same service account — go to Cloud Console → IAM → Service Accounts → your account → Keys
- If RevenueCat rejects the JSON credentials: Make sure you're uploading the entire JSON file (not just the key), and that the service account has been granted access in Play Console
- If subscription creation fails: Ensure app content sections are all completed (green checkmarks)

=== END STAGE 5 ===
```

---

## STAGE 6 — EXPO & EAS BUILD CONFIGURATION

Copy everything in the box below and paste it into Perplexity Computer:

```
=== PERPLEXITY COMPUTER PROMPT — TEMPO STAGE 6: EXPO & EAS BUILD ===

CONTEXT:
I am setting up external services for TEMPO, an ADHD-friendly AI daily planner app.
Tech stack: React + Vite + Tailwind (web), Expo React Native (mobile), Convex (real-time backend), Vercel (hosting).
Bundle ID (iOS): com.tempo.app | Package name (Android): com.tempo.app | App slug: tempo
Pricing tiers: Free ($0/mo), Pro ($9/mo, 14-day trial), Team ($19/mo/user)

PREREQUISITES — You need these from previous stages:
  Convex URL: [from Stage 1, e.g. https://something.convex.cloud]
  RevenueCat Public API Key: [from Stage 3]
  Apple App Store Connect API Key (.p8 file): [from Stage 4]
  Apple Key ID: [from Stage 4]
  Apple Issuer ID: [from Stage 4]
  Google Play Service Account JSON: [from Stage 5]

YOUR TASK:
Set up Expo and EAS Build for TEMPO's mobile app builds. Follow these exact steps:

STEP 1 — CREATE EXPO ACCOUNT
1. Go to https://expo.dev
2. Click "Sign Up" or "Create Account"
3. Sign up with GitHub (recommended) or email
4. Complete the onboarding

STEP 2 — INSTALL EAS CLI
1. Open a terminal on your computer
2. Run: npm install -g eas-cli
3. Once installed, run: eas login
4. Enter your Expo credentials to log in

STEP 3 — CONFIGURE EAS BUILD
1. Navigate to your TEMPO mobile project directory (the folder containing app.json with the Expo config)
2. Run: eas build:configure
3. This will create (or update) an eas.json file
4. Edit eas.json to have these three build profiles:

{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "ios": {
        "autoIncrement": true
      },
      "android": {
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "ascApiKeyId": "[YOUR KEY ID FROM STAGE 4]",
        "ascApiKeyIssuerId": "[YOUR ISSUER ID FROM STAGE 4]",
        "ascApiKeyPath": "./keys/AuthKey_[KEY_ID].p8"
      },
      "android": {
        "serviceAccountKeyPath": "./keys/play-store-credentials.json"
      }
    }
  }
}

5. Create a "keys" folder in your project and place:
   - The .p8 file from Stage 4 (rename it to AuthKey_[YOUR_KEY_ID].p8)
   - The Google Play Service Account JSON from Stage 5 (rename it to play-store-credentials.json)
6. IMPORTANT: Add "keys/" to your .gitignore file so credentials are never committed to git

STEP 4 — SET UP CREDENTIALS
1. For iOS credentials, you have two options:
   a. Let EAS manage automatically: Run `eas credentials` and choose "Let Expo handle it"
   b. Upload your own: Run `eas credentials` and upload the Apple API Key from Stage 4
      - When prompted for team ID, use your Apple Team ID from Stage 4

2. For Android credentials:
   a. Let EAS generate a keystore: EAS will create one on first build (recommended)
   b. Or upload existing: Run `eas credentials` and upload your keystore

STEP 5 — ADD ENVIRONMENT VARIABLES IN EXPO DASHBOARD
1. Go to https://expo.dev
2. Click on your TEMPO project (it should appear after running eas build:configure)
3. Go to "Settings" or "Configuration" → "Environment variables" (or "Secrets")
4. Add these variables:
   - EXPO_PUBLIC_CONVEX_URL = [your Convex URL from Stage 1]
   - EXPO_PUBLIC_REVENUECAT_API_KEY = [your RevenueCat public key from Stage 3]
5. Save

STEP 6 — RUN A TEST BUILD
1. In your terminal, from the TEMPO mobile project directory:
2. Run: eas build --platform all --profile preview
3. This will:
   - Upload your project to EAS
   - Build an iOS simulator/ad-hoc build
   - Build an Android APK
   - This first build may take 15-30 minutes
4. Once complete, EAS will provide download links for both builds

STEP 7 — SET UP EAS SUBMIT (for automated store submission)
1. For iOS submission:
   - The submit config in eas.json (Step 3) already references your Apple API key
   - Test with: eas submit --platform ios --profile production (after a production build)

2. For Android submission:
   - The submit config references the Play Store service account JSON
   - Test with: eas submit --platform android --profile production (after a production build)

STEP 8 — NOTE YOUR EXPO PROJECT DETAILS
1. Go to https://expo.dev → your project
2. Copy the project slug (should be "tempo")
3. Copy the EAS Project ID (found in project settings or in app.json/app.config.js after eas build:configure — looks like a UUID)

VERIFICATION:
- [ ] Expo account created and logged in
- [ ] EAS CLI installed (eas --version works)
- [ ] eas.json exists with development, preview, and production profiles
- [ ] iOS credentials configured (auto or manual)
- [ ] Android credentials configured (auto or manual)
- [ ] EXPO_PUBLIC_CONVEX_URL set in Expo dashboard
- [ ] EXPO_PUBLIC_REVENUECAT_API_KEY set in Expo dashboard
- [ ] First preview build completed successfully (or at least started)
- [ ] EAS Submit configured for both platforms

WHAT TO BRING BACK — copy these exact values:
  Expo Project Slug:  tempo
  EAS Project ID:     [UUID from project settings]
  Build Status:       [Completed / In Progress / Not Started Yet]

TROUBLESHOOTING:
- If eas build:configure fails: Make sure you're in the directory containing app.json with the Expo config
- If "project not found" on Expo dashboard: Run `eas build:configure` first — this registers the project
- If iOS build fails with signing errors: Run `eas credentials` and choose "Let Expo manage credentials"
- If Android build fails: Check that app.json has "android.package": "com.tempo.app"
- If environment variables don't appear in builds: Prefix with EXPO_PUBLIC_ for client-side access — variables without this prefix are only available server-side
- If the build queue is slow: Free Expo accounts have limited build priority — builds may take 15-40 minutes
- If you get "owner" errors: Make sure the EAS project owner matches your Expo account
- If .p8 file path is wrong: The path in eas.json should be relative to the project root

=== END STAGE 6 ===
```

---

## STAGE 7 — AI API SETUP (OpenRouter / Ollama Cloud)

Copy everything in the box below and paste it into Perplexity Computer:

```
=== PERPLEXITY COMPUTER PROMPT — TEMPO STAGE 7: AI API SETUP ===

CONTEXT:
I am setting up external services for TEMPO, an ADHD-friendly AI daily planner app.
Tech stack: React + Vite + Tailwind (web), Expo React Native (mobile), Convex (real-time backend), Vercel (hosting).
Bundle ID: com.tempo.app | App name: TEMPO | App slug: tempo
Pricing tiers: Free ($0/mo), Pro ($9/mo, 14-day trial), Team ($19/mo/user)
TEMPO uses AI for:
  - Daily plan generation (scheduling tasks based on energy levels)
  - Task extraction from brain-dump text
  - Task chunking (breaking big tasks into small steps)
  - Priority recommendations
  - Chat assistant
  - Council mode (6 models queried in parallel for best answer)

Preferred models (OpenRouter IDs):
  Primary: mistralai/ministral-3b-latest (fast, cheap, good for daily planning)
  Backup:  mistralai/magistral-medium-latest (higher quality, slower)
  Council: configurable set of 6 models

YOUR TASK:
Set up an AI API provider for TEMPO. OpenRouter is recommended because it provides access to many models through a single API. Follow these exact steps:

STEP 1 — CREATE OPENROUTER ACCOUNT
1. Go to https://openrouter.ai
2. Click "Sign In" or "Get Started"
3. Sign up with Google, GitHub, or email
4. Complete the onboarding

STEP 2 — ADD CREDITS
1. Go to https://openrouter.ai/credits (or click your profile → "Credits")
2. Add a payment method (credit card)
3. Add at least $5 in credits to start (mistralai/ministral-3b-latest is very cheap — $5 will last a long time)
4. Note: OpenRouter charges per-token, so you only pay for what you use

STEP 3 — GENERATE API KEY
1. Go to https://openrouter.ai/keys (or profile → "Keys")
2. Click "Create Key"
3. Name: TEMPO
4. Credit limit: Set a limit if desired (e.g., $10/day) or leave unlimited
5. Click "Create"
6. Copy the API key IMMEDIATELY — it starts with sk-or-v1-...
7. ► SCREENSHOT/COPY THIS NOW: the API key (cannot be retrieved later)

STEP 4 — NOTE THE BASE URL
The OpenRouter API base URL is:
  https://openrouter.ai/api/v1

This is the standard OpenAI-compatible endpoint. TEMPO's AI client will use this.

STEP 5 — VERIFY THE KEY WORKS
1. Open a terminal
2. Run this test command (replace YOUR_KEY with your actual key):

curl -X POST https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mistralai/ministral-3b-latest",
    "messages": [{"role": "user", "content": "Say hello in 5 words"}],
    "max_tokens": 50
  }'

3. You should get a JSON response with the model's reply
4. If it works, your key is valid and credits are available

STEP 6 — CHECK MODEL AVAILABILITY
1. Go to https://openrouter.ai/models
2. Search for and confirm these models are available:
   - mistralai/ministral-3b-latest (primary — fast daily planning)
   - mistralai/magistral-medium-latest (backup — higher quality)
3. For Council Mode (6 parallel models), good options include:
   - mistralai/ministral-3b-latest
   - mistralai/magistral-medium-latest
   - google/gemini-2.0-flash-001
   - anthropic/claude-3.5-haiku
   - openai/gpt-4o-mini
   - meta-llama/llama-3.1-8b-instruct
4. Note: Model availability and pricing may change — check current prices at https://openrouter.ai/models

ALTERNATIVE — OLLAMA CLOUD (if you prefer self-hosted AI):
1. If you prefer Ollama instead of OpenRouter:
   - Set up an Ollama instance (local or cloud)
   - The base URL will be your Ollama endpoint (e.g., http://localhost:11434/v1)
   - No API key needed for local Ollama
   - Pull models: ollama pull ministral (or your preferred model)

VERIFICATION:
- [ ] OpenRouter account created
- [ ] Credits added ($5+ available)
- [ ] API key generated (starts with sk-or-v1-...)
- [ ] Test curl command returned a valid response
- [ ] Confirmed model availability for primary and backup models

WHAT TO BRING BACK — copy these exact values:
  AI API Key:        sk-or-v1-[your-key]
  AI API Base URL:   https://openrouter.ai/api/v1
  Primary Model:     mistralai/ministral-3b-latest
  Backup Model:      mistralai/magistral-medium-latest
  Council Models:    [list your preferred 6 models, comma-separated]

TROUBLESHOOTING:
- If the test curl returns "Unauthorized": Double-check the API key — make sure there are no extra spaces
- If the test curl returns "Insufficient credits": Add more credits at https://openrouter.ai/credits
- If a model returns "Model not found": Check the exact model ID at https://openrouter.ai/models — model names are case-sensitive
- If you prefer a different provider: Any OpenAI-compatible API will work (Together AI, Groq, etc.) — just change the base URL and key
- If responses are slow: mistralai/ministral-3b-latest should respond in 1-3 seconds. If slower, try a different model or check OpenRouter status
- If you want to self-host: Use Ollama locally or on a cloud VM — the base URL format is http://[host]:11434/v1

=== END STAGE 7 ===
```

---

## STAGE 8 — CUSTOM DOMAIN & DNS (Optional)

Copy everything in the box below and paste it into Perplexity Computer:

```
=== PERPLEXITY COMPUTER PROMPT — TEMPO STAGE 8: CUSTOM DOMAIN & DNS ===

CONTEXT:
I am setting up external services for TEMPO, an ADHD-friendly AI daily planner app.
Tech stack: React + Vite + Tailwind (web), Expo React Native (mobile), Convex (real-time backend), Vercel (hosting).
Bundle ID: com.tempo.app | App name: TEMPO | App slug: tempo
Pricing tiers: Free ($0/mo), Pro ($9/mo, 14-day trial), Team ($19/mo/user)
I have Vercel hosting set up (Stage 2) with two projects:
  - tempo-web (the main app)
  - tempo-marketing (the marketing/landing site)

I may also have Convex set up (Stage 1) for the backend API.

This stage is OPTIONAL. Skip it if you don't have a custom domain yet.

PREREQUISITES:
  - A domain you own (e.g., tempo.app, mytempo.com, gettempo.io)
  - Access to the domain registrar's DNS settings (GoDaddy, Namecheap, Cloudflare, Google Domains, etc.)
  - Vercel projects created (Stage 2)

YOUR TASK:
Configure custom domains for TEMPO. Follow these exact steps:

STEP 1 — PLAN YOUR DOMAIN STRUCTURE
Decide how you want to organize your URLs. Recommended setup:

  app.yourdomain.com    → TEMPO web app (tempo-web on Vercel)
  www.yourdomain.com    → Marketing site (tempo-marketing on Vercel)
  yourdomain.com        → Marketing site (redirects or same as www)
  api.yourdomain.com    → Convex backend (optional — Convex URLs work fine directly)

Example with "mytempo.com":
  app.mytempo.com  → Main app
  www.mytempo.com  → Marketing site
  mytempo.com      → Marketing site

STEP 2 — ADD DOMAINS IN VERCEL
1. Go to https://vercel.com
2. Click into the "tempo-web" project
3. Go to Settings → Domains
4. Click "Add Domain"
5. Enter: app.[yourdomain.com] (e.g., app.mytempo.com)
6. Vercel will show you DNS records to add — note them down

7. Go back to Vercel dashboard
8. Click into the "tempo-marketing" project
9. Go to Settings → Domains
10. Click "Add Domain"
11. Enter: www.[yourdomain.com] (e.g., www.mytempo.com)
12. Click "Add Domain" again
13. Enter: [yourdomain.com] (the root domain, e.g., mytempo.com)
14. Vercel will show DNS records for each

STEP 3 — CONFIGURE DNS RECORDS
1. Log into your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
2. Find DNS settings for your domain
3. Add these records:

   For app.[yourdomain.com] → tempo-web:
   - Type: CNAME
   - Host/Name: app
   - Value/Target: cname.vercel-dns.com
   - TTL: Automatic (or 3600)

   For www.[yourdomain.com] → tempo-marketing:
   - Type: CNAME
   - Host/Name: www
   - Value/Target: cname.vercel-dns.com
   - TTL: Automatic (or 3600)

   For [yourdomain.com] (root/apex domain) → tempo-marketing:
   - Type: A
   - Host/Name: @ (or leave blank)
   - Value/Target: 76.76.21.21
   - TTL: Automatic (or 3600)

   NOTE: Some registrars require an ALIAS or ANAME record for the root domain instead of an A record. If your registrar supports it, use:
   - Type: ALIAS (or ANAME)
   - Host/Name: @ (or leave blank)
   - Value/Target: cname.vercel-dns.com

4. Save all DNS records

STEP 4 — WAIT FOR DNS PROPAGATION
1. DNS changes can take 5 minutes to 48 hours to propagate (usually 5-30 minutes)
2. You can check propagation at https://dnschecker.org — enter your domain and check CNAME/A records
3. In Vercel, the domain status will change from "Pending" to "Valid" once DNS is propagated

STEP 5 — VERIFY SSL CERTIFICATES
1. Once DNS is propagated, Vercel automatically provisions SSL (HTTPS) certificates
2. Go to each project's Settings → Domains
3. Each domain should show a green checkmark and "Valid Configuration"
4. Try visiting your domains in a browser:
   - https://app.yourdomain.com — should show TEMPO app (or a placeholder if not deployed yet)
   - https://www.yourdomain.com — should show marketing site (or placeholder)
   - https://yourdomain.com — should show marketing site or redirect to www

STEP 6 — (OPTIONAL) CONFIGURE CONVEX CUSTOM DOMAIN
If you want api.yourdomain.com pointing to Convex:
1. Note: Convex custom domains may require a paid Convex plan
2. In Convex dashboard → Settings → Custom Domains (if available)
3. Add: api.[yourdomain.com]
4. Convex will provide DNS records to add
5. Add the CNAME record at your registrar:
   - Type: CNAME
   - Host/Name: api
   - Value/Target: [provided by Convex]

NOTE: This is optional — your app can use the default Convex URL (xxx.convex.cloud) without any custom domain.

VERIFICATION:
- [ ] Domains added in Vercel (both projects)
- [ ] DNS records configured at registrar
- [ ] DNS propagation complete (check dnschecker.org)
- [ ] SSL certificates provisioned (green checkmarks in Vercel)
- [ ] https://app.yourdomain.com loads (or shows Vercel placeholder)
- [ ] https://www.yourdomain.com loads (or shows Vercel placeholder)
- [ ] https://yourdomain.com loads or redirects properly

WHAT TO BRING BACK — copy these exact values:
  App URL:       https://app.[yourdomain.com]
  Marketing URL: https://www.[yourdomain.com]
  Root URL:      https://[yourdomain.com]
  API URL:       https://[xxx.convex.cloud] (or https://api.[yourdomain.com] if configured)
  DNS Status:    [Propagated / Pending]

TROUBLESHOOTING:
- If Vercel shows "Invalid Configuration": DNS hasn't propagated yet — wait 15-30 minutes and check again
- If SSL certificate fails: Make sure DNS is pointing to Vercel (not your old hosting) — mixed DNS causes SSL issues
- If root domain doesn't work: Some registrars don't support CNAME on root — use an A record pointing to 76.76.21.21
- If www redirects to the wrong place: In Vercel, set the primary domain (the one without redirect) and the redirect domain
- If you're using Cloudflare: Set the proxy status to "DNS Only" (gray cloud) for Vercel domains — Cloudflare's proxy can conflict with Vercel's SSL
- If you don't have a domain yet: Skip this stage entirely — you can use the default Vercel URLs (tempo-web.vercel.app and tempo-marketing.vercel.app)

=== END STAGE 8 ===
```

---

## CREDENTIALS SUMMARY

Once you've completed all stages, fill in this block and paste it back into Replit chat:

```
=== TEMPO CREDENTIALS — PASTE INTO REPLIT ===

--- STAGE 1: CONVEX ---
Convex URL:                    
Convex Deploy Key:             

--- STAGE 2: VERCEL ---
Vercel Token:                  
Vercel Org ID:                 
Vercel Project ID (app):       
Vercel Project ID (marketing): 

--- STAGE 3: REVENUECAT ---
RevenueCat Public API Key:     
RevenueCat REST API Secret:    
RevenueCat Project ID:         

--- STAGE 4: APPLE DEVELOPER ---
Apple Team ID:                 
ASC API Key File:              [saved locally as AuthKey_XXXX.p8]
ASC Key ID:                    
ASC Issuer ID:                 

--- STAGE 5: GOOGLE PLAY ---
Google Play Service Account:   [saved locally as play-store-credentials.json]
Google Play Developer ID:      

--- STAGE 6: EXPO / EAS ---
Expo Project Slug:             
EAS Project ID:                
Credentials Status:            [auto-managed / manually uploaded]

--- STAGE 7: AI API ---
AI API Key:                    
AI API Base URL:               
Primary Model:                 
Backup Model:                  
Council Models:                

--- STAGE 8: CUSTOM DOMAIN (optional) ---
App URL:                       
Marketing URL:                 
Root URL:                      
API URL:                       

=== END CREDENTIALS ===
```

---

## NOTES FOR THE USER

- **Security**: Never commit API keys, .p8 files, or service account JSON files to Git. Store them as environment variables or in secure vaults.
- **Order matters**: Stages 1-3 can be done in parallel. Stage 4 and 5 depend on Stage 3. Stage 6 depends on 1, 3, 4, and 5. Stage 7 is independent. Stage 8 is last.
- **Costs**: Convex and Vercel have generous free tiers. Apple Developer is $99/year. Google Play is $25 one-time. OpenRouter is pay-per-use (cents per query).
- **Time**: If you do everything sequentially, expect 1-2 hours total. Apple enrollment may add a 24-48 hour wait.
- **Files to keep safe**: The Apple .p8 key file and Google Play service account JSON are download-once credentials. Store them in a secure location (password manager, encrypted drive).

# Twin.so — Tempo Flow Setup & Usage Guide

## 1. What Twin Is

Twin.so is a browser automation agent that operates a real web browser — clicking buttons, filling forms, navigating between pages, and reading on-screen content — exactly as a human would. Unlike API integrations, Twin works against the live rendered DOM of any website, making it effective for dashboards and admin consoles that expose no public API or where the API is too cumbersome for routine tasks. For Tempo Flow, Twin is the designated executor for all GUI-gated operations: submitting builds to the Apple App Store and Google Play Store, configuring RevenueCat product catalogs, filling out platform privacy questionnaires, generating legal documents on GetTerms.io, and managing Vercel and Expo project settings. Twin does not hold credentials permanently; it uses stored browser sessions for re-authentication and defers to Amit for any step requiring physical 2FA (hardware keys, SMS codes received on Amit's personal device, or identity verification requiring a government ID).

---

## 2. First-Time Account Setup

### 2.1 Create Account

1. Navigate to `https://twin.so` and create an account using the same email used for Tempo Flow services (`amitlevin65@protonmail.com`).
2. Choose the plan that supports multiple concurrent browser sessions and persistent session storage — required for maintaining logged-in states across jobs without re-authenticating every run.
3. Verify your email and complete any identity verification Twin requires.

### 2.2 Authenticate and Configure the Extension

1. If Twin offers a browser extension for session capture (used to export authenticated cookies from Amit's local browser to Twin's cloud session), install it in Chrome or Firefox.
2. After installing, click **Connect to Twin** in the extension and authorize with your Twin account.
3. This extension is used only during the initial session-capture step for each dashboard (see Section 3). Once the session is stored in Twin, the extension is not needed for routine Twin jobs.

### 2.3 Configure Session Storage

Twin stores authenticated browser sessions as encrypted session snapshots in its cloud. Configure the following:

1. In Twin's dashboard, open **Settings → Session Storage**.
2. Enable **Persistent Sessions** for all Tempo Flow dashboards.
3. Set session expiry policy:
   - Short-lived sessions (Vercel, OpenRouter, PostHog): refresh on each job run.
   - Long-lived sessions (App Store Connect, Play Console, RevenueCat): refresh weekly or when Twin reports a session expired error.
4. Enable **session audit log** so every login and action is timestamped and attributable to a Twin job ID.

### 2.4 Store Initial Sessions

For each dashboard in Section 3, follow the **first-time auth flow** described there. The general pattern is:

1. Amit logs in manually on his local browser with the Twin extension installed.
2. The extension exports the authenticated session to Twin's cloud.
3. Future Twin jobs load the stored session, bypassing the login form.
4. When a session expires, Twin will fail the job with `SESSION_EXPIRED` and post to Discord #blocked — Amit re-authenticates manually and re-exports the session.

---

## 3. Dashboards Twin Needs Access To

### 3.1 Apple Developer Program

**URL**: `https://developer.apple.com`

**Why**: Required for App Store Connect access, certificate management, and push notification configuration.

**First-time auth flow**:
- Apple Developer requires Apple ID login plus 2FA via trusted device (Amit's iPhone or Mac) and optionally device-based SMS. **Amit must complete the initial login and 2FA personally.**
- After Amit has authenticated, Twin captures the session via the browser extension.
- Twin can then drive remaining form-filling operations (certificate downloads, provisioning profile updates, App Store Connect navigation) without triggering 2FA again, as long as the session remains valid (Apple sessions typically last several weeks).
- **If Apple invalidates the session** (logout, suspicious activity flag, or new device detection), Twin will fail and post to Discord #blocked. Amit must re-authenticate.

**Credentials Twin must NOT store**: Apple ID password. Twin stores only the post-authentication session cookie, never the password.

**What Twin automates on this dashboard**: Navigation to App Store Connect from the Developer portal, certificate status checks, and provisioning profile downloads.

### 3.2 Google Play Console

**URL**: `https://play.google.com/console`

**Why**: Required for submitting Android builds, managing app listings, content rating, and internal test tracks.

**First-time auth flow**:
- Google Play Console uses Google OAuth. Amit completes the initial $25 developer registration fee and account setup **personally** (this is a one-time payment and identity verification that cannot be delegated).
- After account setup, Amit logs in with his Google account and Twin captures the session via the extension.
- Google sessions on Play Console are typically long-lived but may require periodic re-authentication via Google's security check (which may trigger 2FA on Amit's device).

**What Twin automates**: Creating and updating app listings, uploading AAB files to internal test tracks, filling content ratings, data safety forms, and managing release tracks.

### 3.3 App Store Connect

**URL**: `https://appstoreconnect.apple.com`

**Why**: App record creation, metadata entry, screenshot upload, pricing configuration, TestFlight management, and release submission.

**First-time auth flow**:
- App Store Connect is accessed via the same Apple Developer session. If the Developer portal session is valid, App Store Connect is accessible without a separate login step.
- Amit creates the initial app record manually (this confirms the Bundle ID and primary language — decisions that require judgment).
- After the record exists, Twin handles all subsequent metadata updates.

**What Twin automates**:
- Filling app metadata (description, keywords, promotional text, support URL, marketing URL) from a structured JSON input file that Amit maintains at `docs/store-metadata/appstore.json`.
- Uploading screenshots from `/tempo-flow/assets/appstore/<release>/` (generated by Zo).
- Setting pricing and availability.
- Submitting builds from TestFlight for App Review.
- Managing App Privacy labels (see Section 3.7).

### 3.4 Google Play Console — App Listing

(Same dashboard as 3.2, different section.)

**What Twin automates**:
- Short and long descriptions from `docs/store-metadata/play.json`.
- Feature graphic and screenshots uploaded from `/tempo-flow/assets/appstore/<release>/` (Google Play accepts the same device frames as App Store for phone sizes).
- Content rating questionnaire (answers sourced from `docs/store-metadata/content-rating-answers.json`).
- Data safety form (see Section 3.8).
- Internal test track management and promotion to closed/open testing.
- Pricing and distribution settings.

### 3.5 RevenueCat Dashboard

**URL**: `https://app.revenuecat.com`

**Why**: Product catalog setup, entitlement configuration, offering creation, and webhook configuration for in-app subscription management.

**First-time auth flow**:
- Amit creates the RevenueCat account and the Tempo Flow project manually.
- After project creation, Amit logs in and Twin captures the session.

**Products to create** (in the RevenueCat dashboard under the Tempo Flow project):

| Product ID | Store | Type | Price |
|---|---|---|---|
| `tempo_basic_monthly` | App Store + Play | Auto-renewing subscription | Tier to be set by Amit |
| `tempo_basic_annual` | App Store + Play | Auto-renewing subscription | |
| `tempo_pro_monthly` | App Store + Play | Auto-renewing subscription | |
| `tempo_pro_annual` | App Store + Play | Auto-renewing subscription | |
| `tempo_max_monthly` | App Store + Play | Auto-renewing subscription | |
| `tempo_max_annual` | App Store + Play | Auto-renewing subscription | |

**Entitlements to create**:
- `basic` — unlock Basic tier features
- `pro` — unlock Pro tier features
- `max` — unlock Max tier features

**Offerings to create**:
- `default` offering containing all six products
- `launch_promo` offering (if a promotional offering is needed at launch — configure with Amit's input)

**Webhook configuration**:
- In RevenueCat → **Project Settings → Integrations → Webhooks**, add a new webhook:
  - URL: `https://<convex-deployment>.convex.cloud/revenuecat/webhook`
  - Events: All events (or at minimum: `INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, `BILLING_ISSUE`, `EXPIRATION`)
  - Shared secret: Copy from `REVENUECAT_WEBHOOK_SECRET` in Vercel/Convex environment variables.

**What Twin automates**: All of the above product, entitlement, offering, and webhook configuration steps, driven by a structured input JSON at `docs/store-metadata/revenuecat-config.json`.

### 3.6 GetTerms.io

**URL**: `https://getterms.io`

**Why**: Generates Privacy Policy, Terms of Service, and Cookie Policy documents and provides embed IDs for rendering them in the app.

**First-time auth flow**:
- Amit creates the GetTerms account and the Tempo Flow policy set manually.
- Twin captures the session after initial setup.

**What Twin automates**:
1. Navigating to the Tempo Flow policy set.
2. Triggering a new version generation (when Amit updates `docs/store-metadata/getterms-inputs.json` with any new data practices).
3. Copying the three embed IDs from the GetTerms dashboard.
4. Navigating to the Vercel dashboard (see Section 3.9) and updating the following environment variables:
   - `TEMPO_GETTERMS_PRIVACY_ID=<new-id>`
   - `TEMPO_GETTERMS_TERMS_ID=<new-id>`
   - `TEMPO_GETTERMS_COOKIES_ID=<new-id>`
5. Triggering a Vercel redeploy to apply the new env vars.
6. Posting the new embed IDs to Discord #agent-twin for Amit's record.

### 3.7 Apple App Privacy Labels

**URL**: `https://appstoreconnect.apple.com` → App record → App Privacy

**Why**: Apple requires detailed privacy label disclosures before any app can be submitted or updated. The questionnaire has 40+ fields across data categories.

**First-time auth flow**: Same Apple Developer session as Section 3.1.

**Answer source**: Amit maintains a canonical answer file at `docs/store-metadata/privacy-labels-apple.json`. The schema follows Apple's data category groupings:
```json
{
  "data_not_collected": false,
  "categories": {
    "contact_info": { "collected": true, "linked_to_user": true, "used_for_tracking": false, "purposes": ["app_functionality", "analytics"] },
    "identifiers": { "collected": true, "linked_to_user": true, "used_for_tracking": false, "purposes": ["app_functionality"] },
    "usage_data": { "collected": true, "linked_to_user": false, "used_for_tracking": false, "purposes": ["analytics", "product_personalization"] }
  }
}
```

**What Twin automates**: Loads `privacy-labels-apple.json`, navigates to each category in App Store Connect's privacy form, selects the correct checkboxes and radio buttons, and saves the form. Twin does not submit the privacy section for review independently — it saves a draft and posts to Discord #agent-twin for Amit to review before final submission.

### 3.8 Google Play Data Safety Form

**URL**: `https://play.google.com/console` → App → Policy → App content → Data safety

**Why**: Google Play requires similar privacy disclosures to Apple, organized into the Data Safety section.

**Answer source**: Amit maintains `docs/store-metadata/data-safety-google.json` using Google's category schema.

**What Twin automates**: Same pattern as Apple labels — loads the JSON, fills each section of the form, saves (does not submit to review independently).

### 3.9 Vercel Dashboard

**URL**: `https://vercel.com/dashboard`

**Why**: Domain binding for `tempoflow.app`, environment variable management, deployment protection, and build configuration.

**First-time auth flow**:
- Amit logs in to Vercel (GitHub OAuth).
- Twin captures the session.

**What Twin automates**:
- Adding and verifying custom domain `tempoflow.app` (if not already done via CLI).
- Setting and updating environment variables for Production, Preview, and Development environments.
- Enabling/disabling Deployment Protection for preview URLs.
- Checking deployment status and reading build logs for failed deployments.

**Environment variables Twin manages** (sourced from Amit's Vercel env file at `docs/config/vercel-env.md`):
- `TEMPO_GETTERMS_*` (updated as part of GetTerms workflow)
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `REVENUECAT_WEBHOOK_SECRET`
- Any other vars Amit adds to the canonical env file.

### 3.10 EAS Build Dashboard

**URL**: `https://expo.dev` → Organization → Project → Builds

**Why**: Managing iOS and Android build credentials, build profiles, and internal distribution.

**First-time auth flow**:
- Amit creates the EAS project and sets up credentials interactively via `eas credentials` on his local machine. **This step cannot be delegated — Apple certificate signing requires Amit's Apple Developer account.**
- After credentials are set up, Twin can navigate the EAS dashboard to check build status, download artifacts, and manage distribution.

**What Twin automates**:
- Checking build queue status.
- Downloading build artifacts to Zo's `/tempo-flow/artifacts/` (coordinated with Zo jobs).
- Managing internal distribution groups (adding tester emails).
- Reading build logs when a build fails.

### 3.11 Expo.dev Organization

**URL**: `https://expo.dev`

**Why**: Organization settings, push notification credentials, and project configuration.

**First-time auth flow**: Amit creates the Expo organization manually. Twin captures the session.

**What Twin automates**: Navigating to push notification credentials, verifying they are configured correctly, and reading any error states in the Expo dashboard.

### 3.12 OpenRouter

**URL**: `https://openrouter.ai`

**Why**: API key management and budget cap configuration for AI inference.

**What Twin automates**:
- Generating new API keys when rotation is needed (keys named by purpose: `cursor-cloud`, `zo-tempo-flow`, `app-server`).
- Setting monthly budget caps on each key.
- Reading current spend and posting a weekly spend summary to Discord #agent-zo.
- After generating a new key, Twin posts it to Discord #blocked (encrypted) for Amit to manually update in the relevant environment (Vercel, Zo, Cursor Cloud).

**Security note**: Twin does NOT directly write API keys to production systems. It generates the key, posts it to a secure channel, and Amit or Cursor Cloud applies it.

### 3.13 PostHog Self-Hosted Admin

**URL**: `https://posthog.tempoflow.app` (or wherever self-hosted PostHog is deployed)

**Why**: First-run admin setup, project creation, and API key extraction for the Tempo Flow analytics pipeline.

**First-time auth flow**: PostHog self-hosted first-run creates a superuser. Amit completes this manually. Twin captures the admin session.

**What Twin automates**:
- Creating a PostHog project named "Tempo Flow Production".
- Copying the Project API Key and Personal API Key from the PostHog settings page.
- Posting both keys to Discord #blocked for Amit to manually add to Vercel env vars.
- Navigating to the PostHog dashboards for the weekly digest (Pokee pulls PostHog data via API, not Twin).

---

## 4. Standard Job Templates

Each template is a self-contained prompt to give to Twin. Substitute `{{variable}}` placeholders at call time. Run via Twin's job runner or API.

---

### 4.1 Submit New iOS Build to TestFlight

**Trigger**: Manual, or Pokee triggers after Zo confirms EAS build artifact is in `/tempo-flow/artifacts/{{RELEASE_TAG}}/`.

**Prompt template**:

```
You are a browser automation agent. You will submit an iOS build to TestFlight on App Store Connect.

Target URL: https://appstoreconnect.apple.com
App name: Tempo Flow
Build version: {{BUILD_VERSION}} (e.g. 1.0.0 build 42)
Release notes: {{RELEASE_NOTES_PATH}} — read the file content and use it as TestFlight "What to Test" text.

Steps:
1. Navigate to https://appstoreconnect.apple.com and verify the session is authenticated.
2. Click "My Apps" and select "Tempo Flow".
3. Click "TestFlight" in the top navigation.
4. Wait for the build {{BUILD_VERSION}} to appear in the build list (it will have been uploaded by EAS).
   - If it does not appear within 5 minutes, stop and post to Discord #blocked:
     "TestFlight build {{BUILD_VERSION}} not visible. Check EAS upload status."
5. Click on the build {{BUILD_VERSION}}.
6. Fill in the "What to Test" field with the content from {{RELEASE_NOTES_PATH}}.
7. Under "Groups", add the "Internal Testers" group.
8. Click "Save".
9. If a compliance dialog appears (encryption), answer:
   - "Does your app use encryption beyond what Apple provides in the OS?" → No (adjust if Amit's compliance JSON at docs/store-metadata/compliance.json says otherwise).
10. Click "Submit to Review" if the build requires review, or confirm distribution to the Internal group.
11. Take a screenshot of the final success state.
12. Post to Discord #agent-twin:
    "iOS build {{BUILD_VERSION}} submitted to TestFlight. Screenshot: [attach]"

On any error: post to Discord #blocked with the exact error message and the screenshot.
```

---

### 4.2 Submit New Android Build to Internal Testing

**Trigger**: Manual, or Pokee triggers after EAS build artifact is confirmed.

**Prompt template**:

```
You are a browser automation agent. You will upload an Android build to the Internal Testing track on Google Play Console.

Target URL: https://play.google.com/console
App name: Tempo Flow
AAB file location: {{AAB_FILE_URL}} (either a direct download URL or a path in Zo's artifact store)
Release name: {{RELEASE_TAG}}
Release notes (en-US): Read from {{RELEASE_NOTES_PATH}}

Steps:
1. Navigate to https://play.google.com/console and verify session is authenticated.
2. Select the Tempo Flow app.
3. In the left navigation, click "Testing" → "Internal testing".
4. Click "Create new release".
5. Upload the AAB file from {{AAB_FILE_URL}}.
   - If the file is in Zo's workspace, download it first using Zo's file access API, then upload.
6. Set the release name to {{RELEASE_TAG}}.
7. Fill in the release notes for "en-US" with the content from {{RELEASE_NOTES_PATH}}.
8. Click "Save" and then "Review release".
9. Review the pre-launch report warnings — if any are severity "Error", stop and post to Discord #blocked listing the errors.
10. If no errors, click "Start rollout to Internal testing".
11. Take a screenshot of the confirmation screen.
12. Post to Discord #agent-twin:
    "Android build {{RELEASE_TAG}} submitted to Internal Testing. Screenshot: [attach]"

On any error: post to Discord #blocked with exact error and screenshot.
```

---

### 4.3 Refresh App Privacy Labels for Tempo 1.0

**Trigger**: Manual before any App Store submission that follows a change to data practices.

**Prompt template**:

```
You are a browser automation agent. You will update the App Privacy labels for Tempo Flow on App Store Connect.

Target URL: https://appstoreconnect.apple.com
App name: Tempo Flow
Answer source file: docs/store-metadata/privacy-labels-apple.json (read this file from the repo)

Steps:
1. Navigate to https://appstoreconnect.apple.com → My Apps → Tempo Flow → App Privacy.
2. Read the content of docs/store-metadata/privacy-labels-apple.json.
3. For each data category in the JSON:
   a. Navigate to that category in the App Store Connect privacy form.
   b. Set "Do you collect this data type?" to match the "collected" field.
   c. If collected: set "Is this data linked to the user's identity?" to match "linked_to_user".
   d. If collected: set "Is this data used for tracking?" to match "used_for_tracking".
   e. If collected: select all purposes listed in the "purposes" array.
4. After filling all categories, click "Save".
   Do NOT click "Publish" — save as draft only.
5. Take a screenshot of the saved state.
6. Post to Discord #agent-twin:
    "App Privacy labels updated (draft saved). Amit: please review at appstoreconnect.apple.com before publishing."

On any form error: post to Discord #blocked with the field name and the error.
```

---

### 4.4 Create RevenueCat Offering for Tempo 1.0 Launch

**Trigger**: Manual, run once before launch.

**Prompt template**:

```
You are a browser automation agent. You will configure the RevenueCat product catalog for Tempo Flow's 1.0 launch.

Target URL: https://app.revenuecat.com
Project: Tempo Flow
Config source: docs/store-metadata/revenuecat-config.json

Steps:
1. Navigate to https://app.revenuecat.com and verify session.
2. Select the Tempo Flow project.

--- Products ---
3. Navigate to "Products" and create the following if they do not already exist:
   For App Store:
   - tempo_basic_monthly (auto-renewing subscription)
   - tempo_basic_annual (auto-renewing subscription)
   - tempo_pro_monthly (auto-renewing subscription)
   - tempo_pro_annual (auto-renewing subscription)
   - tempo_max_monthly (auto-renewing subscription)
   - tempo_max_annual (auto-renewing subscription)
   For Play Store (same IDs, mark as "Google Play" platform).

--- Entitlements ---
4. Navigate to "Entitlements" and create if not existing:
   - Identifier: basic, Display name: Basic
   - Identifier: pro, Display name: Pro
   - Identifier: max, Display name: Max
5. Attach products to entitlements:
   - basic entitlement: attach tempo_basic_monthly, tempo_basic_annual
   - pro entitlement: attach tempo_pro_monthly, tempo_pro_annual
   - max entitlement: attach tempo_max_monthly, tempo_max_annual

--- Offerings ---
6. Navigate to "Offerings" and create if not existing:
   - Identifier: default, Display name: Default Offering
   - Attach all 6 products as packages: basic_monthly, basic_annual, pro_monthly, pro_annual, max_monthly, max_annual

--- Webhook ---
7. Navigate to "Project Settings" → "Integrations" → "Webhooks".
8. If no webhook exists for Convex, create one:
   - URL: https://<convex-deployment>.convex.cloud/revenuecat/webhook
   - Read the deployment URL from docs/config/convex-deployment.txt
   - Events: select all
   - Shared secret: post to Discord #blocked asking Amit to provide the REVENUECAT_WEBHOOK_SECRET value, then wait for Amit's reply before saving.

9. Take a screenshot of the completed Offerings view.
10. Post to Discord #agent-twin:
    "RevenueCat catalog configured. Products: 6. Entitlements: 3. Offering: default. Screenshot: [attach]"
```

---

### 4.5 Generate New GetTerms Policy Version and Copy Embed IDs to Vercel

**Trigger**: Manual, run whenever Tempo Flow's data practices change (new analytics, new third-party integrations, etc.).

**Prompt template**:

```
You are a browser automation agent. You will regenerate Tempo Flow's legal policies on GetTerms.io and update the resulting embed IDs in Vercel.

GetTerms URL: https://getterms.io
Vercel URL: https://vercel.com/dashboard
Input file: docs/store-metadata/getterms-inputs.json

Steps:
1. Navigate to https://getterms.io and verify session.
2. Open the Tempo Flow policy set.
3. Review current inputs against docs/store-metadata/getterms-inputs.json.
   If any fields differ, update them in the GetTerms form.
4. Click "Generate new version" (or equivalent).
5. Wait for generation to complete.
6. Copy the three embed IDs:
   - Privacy Policy embed ID
   - Terms of Service embed ID
   - Cookie Policy embed ID
7. Record them in a local variable (do not post them to a public Discord channel).

8. Navigate to https://vercel.com/dashboard.
9. Select the Tempo Flow project.
10. Navigate to Settings → Environment Variables.
11. Update or create the following variables for the Production environment:
    - TEMPO_GETTERMS_PRIVACY_ID = <privacy-embed-id>
    - TEMPO_GETTERMS_TERMS_ID = <terms-embed-id>
    - TEMPO_GETTERMS_COOKIES_ID = <cookies-embed-id>
12. Save changes.
13. Trigger a redeployment: navigate to Deployments, click "Redeploy" on the latest production deployment.
14. Wait for redeployment to succeed (check status every 30 seconds, timeout after 5 minutes).
15. Post to Discord #agent-twin:
    "GetTerms policies regenerated and embed IDs updated in Vercel. Vercel redeployment: [complete|timed out]. Privacy/Terms/Cookies IDs updated."

On session expiry (GetTerms or Vercel): post to Discord #blocked.
```

---

## 5. Handoff Patterns

### 5.1 Twin Completes a Dashboard Action → Discord → Optional Pokee Handoff

After every successful job, Twin posts a structured summary to Discord #agent-twin:

```
[TWIN] Job: <job-name> | Status: complete | Duration: <HH:MM:SS>
Dashboard: <dashboard-name>
Summary: <one-line description of what was done>
<screenshot URL if applicable>
```

If the completed action requires a follow-up release announcement (e.g., a new build was submitted to TestFlight), Twin also fires a webhook to Pokee:

```json
{
  "source": "twin",
  "event": "build_submitted",
  "platform": "ios | android",
  "release": "{{RELEASE_TAG}}",
  "dashboard_url": "<app-store-connect-or-play-console-url>",
  "timestamp": "<iso>"
}
```

Pokee receives this and, depending on the event type, either routes to Discord only (internal builds do not get public announcements) or prepares a release announcement for public channels once Amit approves (see `pokee_setup.md` Section 4.1).

### 5.2 Twin Hits a CAPTCHA or 2FA Prompt → #blocked + SMS

CAPTCHA and 2FA prompts cannot be solved by Twin automatically. When Twin encounters either:

1. Twin immediately pauses the job and posts to Discord #blocked:
   ```
   [TWIN BLOCKED] Job: <job-name> | Reason: <CAPTCHA | 2FA | session-expired>
   Dashboard: <url>
   Action needed: Complete the verification at the Twin session URL below, then resume the job.
   Twin session: <twin-session-live-url>
   ```

2. Simultaneously, Twin triggers the Twilio SMS webhook (`TWILIO_SMS_WEBHOOK` env var) with:
   ```
   Twin blocked on <job-name> at <dashboard>. Reason: <CAPTCHA|2FA>. Complete at: <twin-session-url>
   ```

3. After Amit completes the verification step in the Twin session UI, he clicks "Resume" in the Twin dashboard. Twin continues from where it paused.

4. If Amit does not resume within 4 hours, Twin cancels the job and logs it to Convex `agent_runs` with `status: "cancelled-awaiting-human"`.

---

## 6. Credential Storage

### What Twin Stores (Session Cookies, Not Passwords)

Twin stores only post-authentication browser sessions — specifically the HTTP cookies set by each platform after a successful login. Passwords are never stored in Twin.

| Dashboard | Session duration | Re-auth frequency |
|---|---|---|
| Apple Developer / App Store Connect | Several weeks (Apple's discretion) | As needed when Twin reports session expired |
| Google Play Console | Several weeks (Google's discretion) | As needed |
| RevenueCat | Long-lived (weeks to months) | As needed |
| GetTerms.io | Long-lived | As needed |
| Vercel | Moderate (days to weeks, Vercel uses short-lived JWTs) | Weekly |
| EAS / Expo.dev | Long-lived | As needed |
| OpenRouter | Long-lived | As needed |
| PostHog admin | Long-lived | As needed |

### What Amit Must Re-Enter Each Time

- **Apple 2FA codes** — tied to Amit's trusted Apple device. Cannot be delegated.
- **Google 2FA codes** — if Google prompts for 2FA during session refresh.
- **Any password change prompts** — if a platform forces a password change, Amit must complete it and then re-export the session.
- **CAPTCHA challenges** — any platform that presents a CAPTCHA on login.

### 1Password Export (Recommended)

Store all Tempo Flow dashboard credentials in a 1Password vault named `Tempo Flow Agents`. For each dashboard, create a Login item with:
- Username/email
- Password
- 2FA seed (TOTP) if the platform supports authenticator-based 2FA (preferred over SMS for dashboards where Amit controls 2FA setup)
- Notes field: Twin session last exported on `<date>`

Using TOTP-based 2FA where possible (rather than SMS) gives Twin a path to read the TOTP code from 1Password CLI (`op item get "..." --fields otp`) in jobs that include a TOTP step. This applies to platforms like Vercel, PostHog, and OpenRouter — not Apple (Apple requires its own trusted device).

---

## 7. Troubleshooting

### Session Expired

**Symptom**: Twin job fails immediately with `NOT_AUTHENTICATED` or is redirected to a login page.

**Fix**:
1. Check Discord #blocked for the auto-posted blocked message.
2. Amit opens the Twin session URL, completes login (including any 2FA), and re-exports the session via the browser extension.
3. Re-run the Twin job.

### CAPTCHA on Login

**Symptom**: Twin encounters a CAPTCHA immediately after navigating to a login page.

**Fix**:
1. As above — Amit must complete the CAPTCHA manually via the Twin session URL.
2. Consider using the browser extension's session export after a successful manual login rather than having Twin navigate the login form at all.

### Element Not Found / Layout Changed

**Symptom**: Twin's job fails partway through with an error like `Could not find button "Submit to Review"` or `Element not visible`.

**Cause**: The target dashboard has updated its UI.

**Fix**:
1. Post to Discord #blocked with the screenshot Twin captured.
2. Update the Twin job prompt to use updated selectors, labels, or navigation paths.
3. Re-run the job.
4. If the platform change is frequent, consider writing Twin jobs with multiple fallback selector strategies.

### Apple Build Not Appearing in TestFlight

**Symptom**: Twin waits 5 minutes and the build does not appear.

**Cause**: EAS Build has not finished uploading, or Apple's processing queue is delayed.

**Fix**:
1. Check EAS Build dashboard for the build status.
2. Apple typically takes 15–30 minutes to process a new binary. Wait and re-run the Twin TestFlight job.
3. If still not appearing after 2 hours, check for email from Apple regarding rejection or processing errors.

### RevenueCat Webhook Not Firing

**Symptom**: Twin configured the webhook but Convex is not receiving RevenueCat events.

**Fix**:
1. In RevenueCat dashboard → Webhooks, check the delivery log for the webhook.
2. Verify the Convex HTTP action URL is correct and accessible (test with a `curl` from Zo).
3. Verify the shared secret matches `REVENUECAT_WEBHOOK_SECRET` in Convex environment.

### Rate Limiting / Anti-Bot Detection

**Symptom**: Twin is blocked by the target platform's anti-bot detection (Cloudflare challenge, unusual traffic alert).

**Fix**:
1. Add a delay between Twin actions in the job prompt (e.g., "Wait 2 seconds between each form field fill").
2. Reduce the frequency of Twin jobs against the affected platform.
3. Use the stored session approach (Section 2.4) rather than having Twin navigate login forms, which are more likely to trigger bot detection.

# Twin.so Playbook

Playbook-Version: 1.0.0
Applies-To: $PROJECT (generic — fork and replace placeholder)

---

## 1. What Twin Is

Twin.so is an agentic browser automation agent. You give it natural-language instructions
and it operates a real browser session to complete the task — clicking buttons, filling
forms, uploading files, reading tables, and navigating multi-step flows.

Twin is purpose-built for the class of work that has no useful public API: proprietary
dashboards, approval workflows buried behind a login, admin consoles that predate REST,
and SaaS products that technically have an API but with scopes too narrow to accomplish
what you need.

Key characteristics:

- **Real browser sessions**: Twin operates Chromium (or your browser of choice) against
  the actual live website, not a scraping facsimile.
- **Session persistence**: You can give Twin a saved session cookie or have it log in
  once per day and reuse the session. This avoids repeated 2FA prompts.
- **Natural-language task spec**: Describe the goal in plain English. Twin interprets the
  UI and decides the action sequence.
- **Screenshot + confirmation loop**: Twin takes screenshots at each step and can pause
  to show you a screenshot before proceeding past a point of no return.
- **Human-handoff points**: Twin is designed to pause and notify you when it encounters
  a CAPTCHA, 2FA prompt, card entry field, or identity verification gate.

Twin is not an API client. Do not use it for services that have a proper REST or GraphQL
API — use Pokee AI for those. Twin is the last resort before manual work.

---

## 2. When to Pick Twin

### Use Twin when:

| Scenario | Reason |
|---|---|
| The target service has no public API | Twin is the only automation path |
| The API exists but requires a scope not available without enterprise plan | Twin bypasses the scope gate |
| The task requires navigating a multi-step wizard with conditional branching | Twin handles arbitrary UI flows |
| The task involves uploading binary files (screenshots, IPAs, AABs) through a web form | Twin handles file upload inputs |
| The task requires reading data out of a table that is not exported via API | Twin can scrape and return structured data |
| The task is a one-time or infrequent setup action (submit app, enroll in program) | Not worth building a custom integration |
| An existing Pokee workflow is blocked by a GUI gate | Twin unblocks it |

### Do NOT use Twin when:

| Scenario | Better Agent |
|---|---|
| The service has a documented REST/GraphQL API with adequate scopes | Pokee AI (OAuth integration) |
| The task is writing or reviewing code | Cursor IDE or Cursor Cloud |
| The task is a long-running server process | Zo Computer |
| You need real-time interactivity (you want to watch and correct) | Do it manually, then document for Twin |
| The page uses strong bot-detection (Cloudflare Turnstile v2, hCaptcha) | Flag as human-required |

---

## 3. Account Setup Checklist

- [ ] Create a Twin.so account at twin.so
- [ ] Verify email and set up billing (Twin bills per session minute)
- [ ] Install the Twin browser extension if using the managed browser path
- [ ] Generate a Twin API key: Settings → API → Create Key
- [ ] Store the key as `TWIN_API_KEY` in your secrets manager
- [ ] In Pokee, add a Twin action using the API key (Pokee can trigger Twin sessions)
- [ ] Set the default session region closest to your target services
  (App Store Connect is served from US; choose US-East or US-West)
- [ ] Test with a simple session: navigate to example.com and return the page title

### Session Cookie Strategy

For services requiring login, Twin can reuse a saved session:

- [ ] Log in to the target service manually in a clean browser profile
- [ ] Export cookies as JSON (Cookie Editor extension for Chrome exports RFC 6265 format)
- [ ] Upload the cookie file to Twin session storage: Settings → Sessions → Upload Cookies
- [ ] Label the cookie file clearly: `app-store-connect-YYYY-MM-DD.json`
- [ ] Plan a cookie refresh cycle: most sessions expire after 30–90 days
- [ ] Add a calendar reminder to refresh cookies before they expire

---

## 4. Generic Dashboard Recipes

Each recipe includes:
- A checklist of what to prepare before starting the session
- The Twin prompt scaffold

Replace `$PROJECT`, `$APP_NAME`, `$BUNDLE_ID`, and other placeholders before use.

---

### 4.1 iOS App Store Submission (App Store Connect)

**Pre-session checklist**:
- [ ] Have a signed `.ipa` file ready (built and exported by Cursor Cloud or Zo)
- [ ] Have App Store Connect session cookie loaded in Twin
- [ ] Have the app's metadata file ready:
  - App name, subtitle, description, keywords, support URL, marketing URL
  - Screenshots for all required device sizes (6.7", 6.5", 5.5", iPad Pro 12.9")
  - Privacy policy URL
  - App category (primary + optional secondary)
  - Age rating answers
  - Version number and build number matching the IPA
- [ ] Confirm: is this a new app listing or an update to an existing app?

**Twin prompt scaffold (new version submission)**:

```
Session goal: Submit a new version of $APP_NAME ($BUNDLE_ID) to App Store review.

Context:
- App Store Connect URL: https://appstoreconnect.apple.com
- Use the saved session cookie for App Store Connect.
- This is a version update, not a new app listing.

Steps:
1. Navigate to https://appstoreconnect.apple.com/apps.
2. Find the app "$APP_NAME" in the list and click it.
3. Click the "+" button next to "iOS App" to create a new version.
4. Enter version number: $VERSION_NUMBER. Click "Create".
5. Fill in the "What's New in This Version" field with:
   $WHATS_NEW_TEXT
6. Upload the screenshots from local paths:
   6.7" screenshots: $SCREENSHOT_67_PATHS
   6.5" screenshots: $SCREENSHOT_65_PATHS
   5.5" screenshots: $SCREENSHOT_55_PATHS
   iPad Pro 12.9": $SCREENSHOT_IPAD_PATHS
   (For each size, click "Add" in the screenshot section, select the correct files.)
7. Fill in or verify these metadata fields (update only if the value has changed):
   - App name: $APP_NAME
   - Subtitle: $APP_SUBTITLE
   - Keywords: $KEYWORDS
   - Description: $APP_DESCRIPTION
   - Support URL: $SUPPORT_URL
   - Marketing URL: $MARKETING_URL (if applicable)
8. Under "Build", click "Select a Build" and choose the build matching version
   $VERSION_NUMBER and build number $BUILD_NUMBER.
   If the build is not listed, pause and notify: "[BLOCKED] Build not visible in
   App Store Connect. Possible TestFlight processing delay."
9. Under "App Review Information", fill in:
   - Notes for reviewer: $REVIEW_NOTES
   - Demo account credentials if required: $DEMO_EMAIL / $DEMO_PASSWORD
10. Set pricing to: $PRICING_TIER (e.g., Free, or Tier 1).
11. Set availability to: All territories (or $TERRITORY_LIST if restricted).
12. Click "Save" and then "Submit for Review".
13. On the export compliance screen: answer $EXPORT_COMPLIANCE_ANSWER.
14. On the content rights screen: confirm.
15. Click "Submit".
16. Take a screenshot of the confirmation page and save it as submission-confirmation.png.
17. Post to Discord webhook $DISCORD_WEBHOOK_TWIN:
    {"content": "[DONE] App Store submission complete for $APP_NAME v$VERSION_NUMBER.
     Build: $BUILD_NUMBER. Status: Waiting for Review."}

If you encounter a CAPTCHA, 2FA prompt, or unexpected page state, pause and post:
"[BLOCKED] <describe what you see> — human intervention required."
Do not click "Submit" if there are any validation errors shown on the page.
```

---

### 4.2 Google Play Console Submission

**Pre-session checklist**:
- [ ] Have a signed `.aab` (Android App Bundle) file ready
- [ ] Have Google Play Console session cookie loaded in Twin
- [ ] Have metadata ready:
  - Short description (80 chars), full description (4000 chars)
  - Screenshots: phone (2+ required), 7" tablet, 10" tablet
  - Feature graphic (1024x500)
  - App category, content rating questionnaire answers

**Twin prompt scaffold (production release)**:

```
Session goal: Upload and submit $APP_NAME for production release on Google Play.

Context:
- Google Play Console URL: https://play.google.com/console
- Package name: $PACKAGE_NAME
- Use the saved session cookie for Google Play Console.

Steps:
1. Navigate to https://play.google.com/console and select the $PROJECT account.
2. Find "$APP_NAME" in the app list and click it.
3. Navigate to: Production → Create new release.
4. Upload the AAB file at $AAB_FILE_PATH using the upload button.
   Wait for the upload to complete and processing to finish.
5. In the "Release name" field, enter: $VERSION_NAME.
6. In the "Release notes" field, enter the release notes for each language you support:
   English (US): $RELEASE_NOTES_EN
   (Add other languages if applicable.)
7. Click "Next" to proceed to the review screen.
8. On the review screen, verify there are no policy warnings or errors.
   If there are warnings, screenshot them and post to Discord:
   "[BLOCKED] Play Console policy warning found — screenshot attached. Human review needed."
9. Click "Start rollout to Production".
10. On the confirmation dialog, click "Rollout".
11. Screenshot the success confirmation.
12. Post to Discord webhook $DISCORD_WEBHOOK_TWIN:
    {"content": "[DONE] Google Play submission complete. $APP_NAME $VERSION_NAME
     submitted for production rollout."}
```

---

### 4.3 Developer Program Enrollment Assist

Twin handles form-filling. Humans handle SMS verification, ID upload, and payment.

**Apple Developer Program enrollment**:

```
Session goal: Begin Apple Developer Program enrollment for $COMPANY_NAME.
IMPORTANT: Pause before any step that requires SMS verification, credit card entry,
or government ID upload. Those steps must be completed by a human.

Steps:
1. Navigate to https://developer.apple.com/enroll/.
2. Click "Start Your Enrollment".
3. Sign in with Apple ID: $APPLE_ID (you may need to pause here for 2FA).
4. Select entity type: $ENTITY_TYPE (Individual or Organization).
5. For Organization type, fill in:
   - Legal entity name: $LEGAL_NAME
   - DUNS number: $DUNS_NUMBER
   - Headquarters address: $ADDRESS
   - Website: $WEBSITE_URL
   - Confirm org phone: $ORG_PHONE
6. Fill in contact information:
   - First name: $FIRST_NAME
   - Last name: $LAST_NAME
   - Job title: $JOB_TITLE
   - Work email: $WORK_EMAIL
   - Phone: $PHONE
7. Review the form for accuracy and take a screenshot.
8. Post to Discord: "[APPROVAL] Developer enrollment form filled. Screenshot attached.
   Please review and reply 'proceed' to submit, or list corrections."
9. Wait for human approval before clicking Submit.
10. After human replies 'proceed', click Submit.
11. Post: "[DONE] Enrollment submitted. Next human step: complete payment at
    developer.apple.com/account/. Twin cannot handle payment entry."
```

---

### 4.4 RevenueCat Subscription Product Creation

**Pre-session checklist**:
- [ ] App already listed in RevenueCat and linked to App Store Connect / Play Console
- [ ] Product IDs planned and documented
- [ ] Entitlement names decided

**Twin prompt scaffold**:

```
Session goal: Create subscription products and entitlements in RevenueCat for $PROJECT.

Products to create (read from /local/revenuecat-products.json if available, or use below):
$PRODUCT_LIST (array of: { id, name, duration, price, trial_days })

Steps:
1. Navigate to https://app.revenuecat.com.
2. Select the project "$PROJECT".
3. Navigate to Products → Add Product.
4. For each product in the list:
   a. Click "Add Product".
   b. Enter the Product Identifier: <product.id>.
   c. Select the app store: $APP_STORE (App Store or Play Store).
   d. Click "Add".
5. Navigate to Entitlements → Add Entitlement.
6. Create an entitlement named "pro" (or $ENTITLEMENT_NAME).
7. Attach all created products to the entitlement.
8. Navigate to Offerings → Add Offering.
9. Create an offering named "default".
10. Add a package to the default offering for each product.
11. Screenshot the final offerings configuration.
12. Post to Discord webhook $DISCORD_WEBHOOK_TWIN:
    {"content": "[DONE] RevenueCat products created. $COUNT products, 1 entitlement,
     1 offering. Screenshot attached."}
```

---

### 4.5 Stripe Product Creation

Use this as an alternative or complement to RevenueCat for web-based billing.

```
Session goal: Create subscription products in the Stripe dashboard for $PROJECT.

Products:
$STRIPE_PRODUCT_LIST (array of: { name, description, price_monthly, price_yearly, currency })

Steps:
1. Navigate to https://dashboard.stripe.com (use saved Stripe session cookie).
2. Confirm you are in $STRIPE_MODE mode (Live or Test — check the toggle top-left).
   If wrong mode, switch before proceeding.
3. Navigate to Products → Add Product.
4. For each product:
   a. Name: <product.name>
   b. Description: <product.description>
   c. Pricing model: Recurring
   d. Add price: monthly at <product.price_monthly> <product.currency>
   e. Add price: yearly at <product.price_yearly> <product.currency>
   f. Click "Save Product".
5. Note the Product ID and Price IDs for each created product.
6. Save all IDs to a local JSON file: stripe-product-ids.json
7. Post to Discord: "[DONE] Stripe products created. IDs saved to stripe-product-ids.json."
```

---

### 4.6 Compliance Policy Generation

Generic pattern for GetTerms, Iubenda, or Termly.

```
Session goal: Generate and download a Privacy Policy and Terms of Service for $PROJECT
using $POLICY_SERVICE (GetTerms / Iubenda / Termly).

Project details:
- App name: $APP_NAME
- Company name: $COMPANY_NAME
- Website: $WEBSITE_URL
- Email: $CONTACT_EMAIL
- Collects user data: $COLLECTS_DATA (yes/no)
- Uses analytics: $USES_ANALYTICS
- Uses cookies: $USES_COOKIES
- Jurisdiction: $JURISDICTION (e.g., GDPR + CCPA)

Steps:
1. Navigate to the $POLICY_SERVICE website.
2. Start a new policy generation (Privacy Policy first).
3. Fill in the questionnaire with the project details above.
4. For any question not listed above, choose the most conservative option
   (i.e., assume the user wants maximum disclosure).
5. Generate the policy.
6. Copy the policy text and save to /local/$PROJECT-privacy-policy.md.
7. If the service offers a hosted URL, copy it and note it.
8. Repeat for Terms of Service.
9. Post to Discord: "[DONE] Policies generated. Privacy Policy: $HOSTED_URL.
   Terms: $TOS_URL. Files saved locally."
```

---

### 4.7 Vercel Domain Binding and Env Var Setup

```
Session goal: Bind the domain $DOMAIN to the Vercel project $PROJECT and configure
all required environment variables.

Environment variables to set (read from /local/$PROJECT-env-vars.json):
$ENV_VAR_LIST

Steps:
1. Navigate to https://vercel.com/dashboard.
2. Select the project "$PROJECT".
3. Navigate to Settings → Domains.
4. Click "Add Domain". Enter "$DOMAIN". Click "Add".
5. Note the DNS records Vercel requires (CNAME or A record).
6. Screenshot the DNS record instructions.
7. Post to Discord: "[APPROVAL] Vercel domain added. DNS records shown in screenshot.
   Update your DNS registrar with these records, then reply 'done' to continue."
8. Wait for human to reply 'done'.
9. Click "Verify" on the domain. Wait up to 60 seconds for verification.
   If verification fails, post: "[BLOCKED] Domain verification failed. DNS may not
   have propagated. Retry in 15 minutes or verify DNS records are correct."
10. Navigate to Settings → Environment Variables.
11. For each variable in the env var list:
    a. Click "Add".
    b. Key: <var.name>, Value: <var.value>, Environment: Production + Preview + Development
    c. Click "Save".
12. Screenshot the environment variables list (values will be masked — that is fine).
13. Post to Discord: "[DONE] Domain $DOMAIN bound and $COUNT env vars configured."
```

---

### 4.8 GitHub Org Settings Configuration

```
Session goal: Configure branch protection and required checks for the main branch of
$REPO_OWNER/$REPO_NAME on GitHub.

Required checks to enforce: $REQUIRED_CHECKS (e.g., "build", "test", "lint")

Steps:
1. Navigate to https://github.com/$REPO_OWNER/$REPO_NAME/settings/branches.
2. Click "Add rule" (or edit the existing rule for "main").
3. Branch name pattern: main
4. Enable "Require a pull request before merging".
5. Set required approvals: $REQUIRED_APPROVALS (typically 1).
6. Enable "Require status checks to pass before merging".
7. Search for and add each check in $REQUIRED_CHECKS.
8. Enable "Require branches to be up to date before merging".
9. Enable "Do not allow bypassing the above settings".
10. Click "Save changes".
11. Screenshot the branch protection rule.
12. Post to Discord: "[DONE] Branch protection configured for main in
    $REPO_OWNER/$REPO_NAME. Required checks: $REQUIRED_CHECKS."
```

---

### 4.9 Newsletter Platform First-Run Setup

Generic pattern for Beehiiv, Substack, or ConvertKit.

```
Session goal: Complete first-run setup for $PROJECT on $NEWSLETTER_PLATFORM.

Project details:
- Publication name: $PUBLICATION_NAME
- Tagline: $TAGLINE
- Description: $DESCRIPTION
- Author name: $AUTHOR_NAME
- Author bio: $AUTHOR_BIO
- Logo: /local/$PROJECT-logo.png
- Primary color: $PRIMARY_COLOR
- Domain to connect: $NEWSLETTER_DOMAIN (if custom domain is used)

Steps:
1. Navigate to the $NEWSLETTER_PLATFORM dashboard.
2. Create a new publication (if none exists) with the publication name above.
3. Upload the logo.
4. Set the tagline and description.
5. Configure the author profile.
6. Set the primary brand color to $PRIMARY_COLOR.
7. If custom domain is desired:
   a. Navigate to Settings → Domain.
   b. Enter $NEWSLETTER_DOMAIN.
   c. Note and screenshot the DNS records required.
   d. Post to Discord: "[APPROVAL] Newsletter domain DNS records ready. Screenshot
      attached. Update DNS and reply 'done'."
   e. Wait for human reply before continuing.
8. Set up the welcome email subject: "Welcome to $PUBLICATION_NAME".
9. Set up double opt-in if the platform offers it (recommended for GDPR).
10. Screenshot the final publication settings page.
11. Post to Discord: "[DONE] $NEWSLETTER_PLATFORM setup complete for $PUBLICATION_NAME."
```

---

### 4.10 Analytics Platform Setup

Generic pattern for PostHog self-hosted, Plausible, or Umami.

```
Session goal: Configure analytics for $PROJECT on $ANALYTICS_PLATFORM.

Steps:
1. Navigate to the $ANALYTICS_PLATFORM dashboard.
2. Create a new site/project named "$PROJECT".
3. Enter the domain: $DOMAIN.
4. Copy the tracking snippet or project API key.
5. Save the API key to /local/$PROJECT-analytics-keys.txt.
6. If the platform offers goal/event tracking, create these goals:
   $GOAL_LIST (e.g., "signup", "upgrade", "share")
7. If the platform offers team access, invite $TEAM_EMAILS with Viewer role.
8. Screenshot the tracking snippet (the actual key may need to go into Cursor for
   code integration — post it in Discord so the developer can copy it).
9. Post to Discord: "[DONE] $ANALYTICS_PLATFORM configured for $PROJECT. Tracking
   snippet posted. Developer: paste into your analytics provider init."
```

---

## 5. Handoff Patterns

### Twin → Discord → Pokee (most common)

```
Twin completes a session
  → POST to $DISCORD_WEBHOOK_TWIN with result
  → Pokee monitors #agent-twin channel
  → Pokee cross-posts to #summary
  → If artifacts produced (IDs, URLs, screenshots), Pokee stores them in a GitHub
    Issue comment for persistence
```

### Twin → Human (for approval) → Twin (continue)

```
Twin reaches a point of no return (Submit button, payment gate)
  → Posts to #approvals with screenshot
  → Human reviews in Discord and replies with approval keyword
  → Pokee detects the reply and signals Twin to continue the session
  → Twin completes the remaining steps
```

### Pokee → Twin (Pokee triggers a session)

```
Pokee receives a GitHub Release webhook
  → Pokee evaluates: does this release require App Store submission?
  → If yes, Pokee posts to Twin API webhook with a pre-built prompt
  → Twin executes the App Store Connect session
  → Twin posts result back to Discord
```

---

## 6. Human-Handoff Points

These steps cannot be automated regardless of the tool. Twin is required to pause and
notify the human at these gates.

| Gate | Why Human Required | What Human Must Do |
|---|---|---|
| Apple ID 2FA | Apple sends an OTP to a trusted device | Enter the code on the device |
| Apple Developer SMS verification | Phone number verification for enrollment | Enter the code received by SMS |
| Apple Developer payment | Credit card entry for annual fee | Enter card manually in the browser |
| Google Identity Verification | Google may require ID for Play Console | Upload government ID |
| Stripe card entry | PCI compliance; browsers block automation | Enter card manually |
| CAPTCHA (any service) | Bot detection | Solve manually |
| Identity document upload | Legal KYC requirement | Upload document manually |
| DNS record changes | Registrar login is a separate credential | Log into registrar and add records |

For each of these, Twin should:
1. Stop before the gate.
2. Post to `#approvals` with a screenshot and clear instructions.
3. Wait for a human reply with a specific keyword (`proceed`, `done`, `skip`).
4. Resume after the human signals.

---

## 7. Credential Storage Best Practices

### Session Cookies

- Export cookies after a successful manual login using a cookie manager browser extension.
- Store cookie files in 1Password as Secure Notes, not in the repo.
- Name files clearly: `<service>-session-<YYYY-MM-DD>.json`.
- Load the cookie file into Twin's session storage at the start of each session.
- Set a reminder to refresh cookies 1 week before they expire.

### API Keys in Twin Prompts

- Never paste a raw credential value into a Twin prompt. Write `[use TWIN_API_KEY]`
  and ensure the key is loaded in Twin's secure environment.
- If you must reference a username or password in a prompt (for demo account login),
  store the prompt in 1Password and paste it at session start, not in a committed file.

### Secrets in Repo

- No session files, cookie files, or credential files belong in the repo.
- Add these patterns to `.gitignore`:
  ```
  *-session-*.json
  *-cookies-*.json
  *.credentials.json
  twin-prompts/secrets/
  ```

---

## 8. Troubleshooting

### Session cookie expired mid-session

**Symptom**: Twin navigates to the site and is redirected to a login page instead of
the dashboard.
**Fix**:
1. Log in manually to the service.
2. Export fresh cookies.
3. Upload to Twin session storage with today's date in the filename.
4. Re-run the session.

### Twin clicks the wrong element

**Symptom**: Twin reports completing a step, but screenshots show the wrong state.
**Fix**:
1. Add more specificity to the prompt: instead of "Click the Add button", write
   "Click the blue 'Add Product' button in the top-right corner of the Products table."
2. Add a verification step: "After clicking, confirm the expected modal or page title
   appears before proceeding."
3. Add explicit pause-and-screenshot steps between critical actions.

### Upload fails silently

**Symptom**: Twin reports the upload step completed, but the file does not appear in
the dashboard.
**Fix**:
1. Verify the file path in the prompt is correct and the file exists.
2. Check the file size — some platforms have limits (iTunes Connect: no hard limit,
   but IPA over 4GB may time out).
3. Add an explicit "Wait for upload progress bar to reach 100% and disappear" step.

### CAPTCHA encountered unexpectedly

**Symptom**: Twin posts `[BLOCKED] CAPTCHA detected` during a routine session.
**Fix**:
1. Human solves the CAPTCHA in a fresh browser session.
2. Export a fresh session cookie.
3. Re-run Twin with the new cookie.
4. Consider running the session at an off-peak time — some services throttle and
   show CAPTCHAs to sessions making many requests in a short window.

### Site layout changed

**Symptom**: Twin cannot find an element that previously existed.
**Fix**:
1. Take a screenshot of the current state: ask Twin to "Navigate to [URL], take a
   screenshot, and report what you see."
2. Update the prompt to reference the new UI element labels.
3. Document the layout change in a comment above the prompt in your playbook fork.

---

*End of TWIN_PLAYBOOK.md*

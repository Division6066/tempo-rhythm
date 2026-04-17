# Pokee AI — Tempo Flow Setup & Usage Guide

## 1. What Pokee Is

Pokee AI is a multi-SaaS orchestration agent accessible at `pokee.ai`. Given a plain-text workflow prompt, Pokee connects to authorized integrations — Gmail, Google Docs, GitHub, YouTube, LinkedIn, Instagram, Facebook, TikTok, X (Twitter), Discord, Slack, newsletter platforms, and analytics tools — and executes multi-step workflows across them without writing code. Pokee is not a code executor and not a browser driver; it operates through official APIs and OAuth-authorized connections. For Tempo Flow, Pokee serves as the **router and cross-poster** in the agent spine: it receives webhook events from GitHub and Convex, decides which downstream agents or channels need to act, posts social content, generates and sends digests, triages GitHub Issues, routes founder-inbox messages, and ensures every significant event in the system is surfaced to Amit or to the appropriate agent. Pokee is always on and always connected — it is the nerve center that keeps Zo, Twin, Cursor Cloud, and Amit synchronized.

---

## 2. First-Time Account Setup

### 2.1 Create Account

1. Navigate to `https://pokee.ai` and sign up with `amitlevin65@protonmail.com`.
2. Select the plan that supports the number of active integrations needed (at minimum: GitHub, Gmail, YouTube, LinkedIn, Instagram, Facebook, TikTok, X, Discord, PostHog, Sentry, and one newsletter platform — verify plan limits before choosing).
3. Complete email verification.

### 2.2 Authorize Each Integration

For each integration listed in Section 3, Pokee will walk through an OAuth or API-key authorization flow. Complete each one in order before creating any workflow templates. Pokee will refuse to run a workflow that references an unauthorized integration.

### 2.3 Test with a Dry Run

Before activating any live workflow, run a dry-run test:

1. In Pokee's workflow editor, create a test workflow:
   ```
   Send a Discord message to the webhook at {{DISCORD_ZO_WEBHOOK}} with the text "Pokee dry-run test: {{timestamp}}".
   ```
2. Run the workflow manually.
3. Verify the message appears in Discord #agent-zo.
4. Delete the test workflow.

If the Discord message does not appear, troubleshoot the integration before proceeding (see Section 7).

---

## 3. Integrations to Connect for Tempo Flow

### 3.1 GitHub

**Integration type**: GitHub App (OAuth)

**Authorization steps**:
1. In Pokee → Integrations → GitHub, click **Connect**.
2. Authorize Pokee to access the `tempoflow` repository (and organization if applicable).
3. Grant permissions: Issues (read/write), Pull Requests (read/write), Releases (read), Webhooks (read), Labels (read/write), Contents (read).
4. Confirm the installation.

**What Pokee uses this for**: Receiving `issues.opened`, `pull_request.opened`, `pull_request.merged`, and `release.published` events; applying labels; posting comments on issues; reading TASKS.md.

**Webhook configuration**: In GitHub → Repository Settings → Webhooks, add a Pokee-provided webhook URL (Pokee generates this during setup) for the following events: Issues, Pull requests, Releases, Pushes to main.

### 3.2 Gmail

**Integration type**: Google OAuth (Gmail read/send scope)

**Authorization steps**:
1. In Pokee → Integrations → Gmail, click **Connect** and authorize with Amit's founder Google account.
2. Grant scopes: `gmail.readonly`, `gmail.send`, `gmail.labels`.
3. This account is the "Ask the Founder" inbox: `amitlevin65@protonmail.com` routed through a Gmail alias, or directly if the founder email uses Gmail.

**What Pokee uses this for**: Reading inbound "Ask the Founder" emails (filtered by a Gmail label `tempo-founder-inbox`) and routing them to the handoff pattern in Section 4.4.

### 3.3 YouTube

**Integration type**: Google OAuth (YouTube Data API v3)

**Authorization steps**:
1. In Pokee → Integrations → YouTube, click **Connect** and authorize with the Tempo Flow YouTube channel's Google account.
2. Grant scopes: `youtube.readonly` (for reading upload events).

**What Pokee uses this for**: Detecting new video uploads and triggering the vlog cross-post workflow (Section 4.5). Pokee does not post to YouTube — that remains manual or via EAS.

**Setup note**: Configure a Pokee trigger that polls the channel's uploads RSS feed every 30 minutes (or uses YouTube's PubSubHubbub push if Pokee supports it) to detect new uploads.

### 3.4 LinkedIn

**Integration type**: LinkedIn OAuth

**Authorization steps**:
1. In Pokee → Integrations → LinkedIn, connect Amit's personal LinkedIn account (or the Tempo Flow company page if one exists).
2. Grant scopes: `w_member_social` (post on behalf of member) or `w_organization_social` (post on behalf of company page).

**What Pokee uses this for**: Posting release announcements and founder vlog updates.

**Character limits**: LinkedIn posts support up to 3000 characters. Pokee's release announcement template (Section 4.1) generates platform-specific copy within this limit.

### 3.5 Instagram

**Integration type**: Meta Business OAuth (via Facebook Business Manager)

**Authorization steps**:
1. Connect the Tempo Flow Instagram account through Pokee's Meta integration.
2. The Instagram account must be a Professional account linked to a Facebook Page.
3. Grant permissions: `instagram_content_publish`, `pages_read_engagement`.

**What Pokee uses this for**: Posting release announcement square cards (1080x1080) generated by Zo.

**Media handling**: Instagram posts require a publicly accessible media URL. Pokee retrieves the image from Zo's artifact store URL (Zo publishes a signed URL to Convex `agent_artifacts.manifest_url`).

### 3.6 Facebook

**Integration type**: Meta Business OAuth (same connection as Instagram)

**Authorization steps**: Covered by the same Meta Business OAuth flow as Instagram (Section 3.5). Add the Tempo Flow Facebook Page as an authorized Page in Pokee's Meta integration settings.

**What Pokee uses this for**: Cross-posting release announcements to the Tempo Flow Facebook Page.

### 3.7 TikTok

**Integration type**: TikTok for Developers OAuth

**Authorization steps**:
1. In Pokee → Integrations → TikTok, connect the Tempo Flow TikTok account.
2. Grant scopes: `video.upload`, `video.publish` (if Pokee supports direct TikTok posting; otherwise, Pokee drafts the caption and Amit posts manually).

**What Pokee uses this for**: Posting vlog-derived short-form captions (generated by Zo's vlog pipeline) alongside a manually uploaded video clip from Amit.

**Note**: TikTok's API restrictions may limit automated video posting. If Pokee cannot post video directly, configure Pokee to instead DM Amit with the caption text and a reminder to post the clip.

### 3.8 X (Twitter)

**Integration type**: X Developer OAuth 2.0 (Bearer token + user context)

**Authorization steps**:
1. Create a Tempo Flow X Developer App at `developer.twitter.com` with Read + Write permissions.
2. In Pokee → Integrations → X, authorize using the app credentials and the Tempo Flow X account.

**What Pokee uses this for**: Posting tweet threads (generated by Zo's vlog pipeline) and release announcement tweets.

**Rate limits**: X API free/basic tier allows a limited number of posts per month. Monitor usage in the X Developer dashboard and upgrade the plan if volume increases.

### 3.9 Discord

**Integration type**: Discord Webhooks (per-channel) + Discord Bot (for reading channels)

**Authorization steps**:
1. Create a Discord bot for Pokee in the Tempo Flow Discord server:
   - Server Settings → Integrations → Webhooks: create webhooks for each agent channel.
   - Developer Portal: create a bot with permissions: Read Messages/View Channels, Send Messages, Embed Links.
2. In Pokee → Integrations → Discord, provide the bot token and the per-channel webhook URLs.
3. Channel webhooks needed:
   - `DISCORD_AGENT_CURSOR_WEBHOOK` — #agent-cursor
   - `DISCORD_AGENT_TWIN_WEBHOOK` — #agent-twin
   - `DISCORD_AGENT_POKEE_WEBHOOK` — #agent-pokee
   - `DISCORD_AGENT_ZO_WEBHOOK` — #agent-zo
   - `DISCORD_HANDOFFS_WEBHOOK` — #handoffs
   - `DISCORD_APPROVALS_WEBHOOK` — #approvals
   - `DISCORD_BLOCKED_WEBHOOK` — #blocked
   - `DISCORD_SUMMARY_WEBHOOK` — #summary
   - `DISCORD_FOUNDER_INBOX_WEBHOOK` — #founder-inbox

**What Pokee uses this for**: Posting agent status updates, routing handoffs, surfacing escalations, and sending the daily status summary.

### 3.10 PostHog

**Integration type**: PostHog API key (read-only)

**Authorization steps**:
1. In PostHog admin → Settings → API Keys, create a read-only personal API key named `pokee-digest`.
2. In Pokee → Integrations → PostHog (or Generic HTTP API), add the PostHog API base URL and key.

**What Pokee uses this for**: Pulling weekly active user counts, event totals, and funnel conversion rates for the Monday analytics digest (Section 4.2).

### 3.11 Sentry

**Integration type**: Sentry API key (read-only)

**Authorization steps**:
1. In Sentry → Settings → API → Auth Tokens, create a token with scopes: `project:read`, `event:read`.
2. In Pokee → Integrations → Sentry (or Generic HTTP API), add the Sentry API base URL, organization slug, and token.

**What Pokee uses this for**: Pulling weekly error counts, top errors by frequency, and new errors in the Monday analytics digest.

### 3.12 Newsletter Platform (Beehiiv / Substack / ConvertKit)

**Integration type**: Newsletter platform API key

**Authorization steps**:
1. Choose the primary newsletter platform (Beehiiv is recommended for its API completeness).
2. In the newsletter platform's settings, create an API key with send/draft permissions.
3. In Pokee → Integrations → Beehiiv (or the chosen platform), add the API key and the Tempo Flow publication ID.

**What Pokee uses this for**: Sending the weekly founder newsletter draft (generated by Zo's vlog pipeline) to subscribers. Pokee creates a draft, not a live send — Amit reviews and publishes manually.

---

## 4. Standard Workflow Templates

Each template includes the full prompt and the trigger/schedule. Configure these in Pokee's workflow editor.

---

### 4.1 Release Announcement Cross-Post

**Trigger**: GitHub webhook event `release.published` (Pokee receives this from the GitHub integration in Section 3.1)

**Schedule**: Runs immediately on trigger, no scheduled delay.

**Prompt template**:

```
A new Tempo Flow release has been published on GitHub.

Release tag: {{event.release.tag_name}}
Release title: {{event.release.name}}
Release body: {{event.release.body}}
Release URL: {{event.release.html_url}}
Asset manifest: {{convex_artifact_manifest_url}} (retrieve from Convex agent_artifacts where release={{event.release.tag_name}} and type="assets")

Steps:
1. Read the release body and extract:
   - Key features/changes (bullet list, max 5 items)
   - Any breaking changes
   - Upgrade instructions if applicable

2. Retrieve the social announcement card asset URL from the Convex artifact manifest for this release.
   If no asset is available: use the Tempo Flow default announcement card at {{TEMPO_DEFAULT_CARD_URL}}.

3. Generate platform-specific copy:

   LinkedIn post (max 2500 chars):
   "We just shipped {{release.tag_name}} of Tempo Flow — the AI daily planner built for neurodivergent users.

   What's new:
   {{bullet list of key features}}

   {{if breaking_changes}}Breaking change: {{breaking_changes}}{{end}}

   Try it free for 7 days: https://tempoflow.app
   Release notes: {{release_url}}"
   Attach the 1200x630 social card.

   X / Twitter thread (first tweet max 240 chars):
   Tweet 1: "Tempo Flow {{tag_name}} is live. {{top_feature_one_sentence}} 🧵"
   Tweet 2–4: One feature per tweet, max 240 chars each.
   Final tweet: "Free 7-day trial: https://tempoflow.app | Full notes: {{release_url}}"

   Instagram caption (max 2200 chars):
   "Tempo Flow {{tag_name}} is here. [Feature highlights]. Link in bio for a free 7-day trial."
   Attach the 1080x1080 square card.

   Facebook post:
   Same as LinkedIn post, slightly shortened to 1500 chars.

   TikTok caption (max 2200 chars but typically 150–300 chars for algorithm):
   "POV: your AI planner just got smarter. Tempo Flow {{tag_name}} drops today. #ADHD #neurodivergent #productivityapp #tempoflow"

   Discord #handoffs:
   "[RELEASE] Tempo Flow {{tag_name}} published. Notes: {{release_url}}. Social posts queued for LinkedIn, X, IG, FB, TikTok."

4. Post to each platform:
   a. LinkedIn — post with image.
   b. X — post the thread (first tweet, then replies).
   c. Instagram — post with image.
   d. Facebook — post with image.
   e. TikTok — post caption (Amit will add the video manually if needed).
   f. Discord #handoffs — post summary.

5. On any posting error, skip that platform and post to Discord #blocked:
   "[POKEE] Release cross-post failed for {{platform}}: {{error}}. Release: {{tag_name}}"

6. After all posts: post a summary to Discord #agent-pokee:
   "[POKEE] Cross-post complete for {{tag_name}}. Platforms: LinkedIn ✓/✗, X ✓/✗, IG ✓/✗, FB ✓/✗, TikTok ✓/✗"
```

---

### 4.2 Weekly Analytics Digest

**Trigger**: Scheduled — every Monday at 09:00 UTC.

**Prompt template**:

```
Generate the weekly Tempo Flow analytics digest for the week ending {{last_sunday_date}}.

Data sources:
- PostHog API: retrieve for the period {{last_monday_date}} to {{last_sunday_date}}:
  - Weekly active users (WAU)
  - New signups
  - Trial starts
  - Trial-to-paid conversion rate
  - Top 3 most-used features by event count
  - Funnel: signup → trial → subscription
- Sentry API: retrieve for the same period:
  - Total error events
  - New issues (first seen in period)
  - Top 3 errors by frequency with issue URL
  - Error rate (errors per active user)
- GitHub API: retrieve:
  - Current star count for tempoflow repo
  - Stars added this week
  - PRs merged this week (count + titles)
  - Issues opened and closed this week

Steps:
1. Fetch all data from the three sources above.
2. Format into a Markdown digest:

---
# Tempo Flow — Weekly Digest {{last_monday_date}} to {{last_sunday_date}}

## Growth
- WAU: {{wau}} ({{wau_delta}} vs prior week)
- New signups: {{signups}}
- Trial starts: {{trial_starts}}
- Trial → Paid conversion: {{conversion_rate}}%
- GitHub stars: {{stars}} (+{{stars_delta}} this week)

## Product
- Top features this week: {{feature_1}}, {{feature_2}}, {{feature_3}}
- PRs merged: {{pr_count}}
  {{pr_titles_as_bullet_list}}

## Errors
- Total errors: {{error_count}} ({{error_rate}} per WAU)
- New issues: {{new_issues}}
- Top errors:
  1. {{error_1_title}} — {{error_1_count}} occurrences — {{error_1_url}}
  2. {{error_2_title}} — {{error_2_count}} occurrences — {{error_2_url}}
  3. {{error_3_title}} — {{error_3_count}} occurrences — {{error_3_url}}

## Issues
- Opened: {{issues_opened}} | Closed: {{issues_closed}}
---

3. Email the digest to amitlevin65@protonmail.com via Gmail:
   Subject: "Tempo Flow Weekly Digest — {{last_monday_date}}"
   Body: the Markdown digest (render as HTML if possible).

4. Post the digest to Discord #summary via the summary webhook.

5. Write a row to Convex agent_runs:
   { agent: "pokee", job: "weekly-digest", status: "complete", week: "{{last_monday_date}}", timestamp: <iso> }

On any data fetch error, substitute "N/A" for the affected metric and add a note at the top of the digest.
```

---

### 4.3 GitHub Issue Triage

**Trigger**: GitHub webhook event `issues.opened`.

**Prompt template**:

```
A new GitHub issue has been opened on the Tempo Flow repository.

Issue number: {{event.issue.number}}
Issue title: {{event.issue.title}}
Issue body: {{event.issue.body}}
Author: {{event.issue.user.login}}
Created at: {{event.issue.created_at}}

Steps:
1. Analyze the title and body for keywords to determine the issue type:

   - If title/body contains any of: crash, error, exception, null, undefined, TypeError, 500 → label: `bug`
   - If title/body contains any of: feature, request, suggestion, add, would be nice → label: `enhancement`
   - If title/body contains any of: docs, documentation, readme, guide → label: `docs`
   - If title/body contains any of: perf, performance, slow, lag, memory → label: `performance`
   - If title/body contains any of: a11y, accessibility, screen reader, voiceover → label: `accessibility`
   - If title/body contains any of: convex, schema, backend, database → label: `backend`
   - If title/body contains any of: UI, design, layout, visual, style → label: `frontend`
   - Apply multiple labels if multiple categories match.

2. Apply the determined labels to the issue via the GitHub API.

3. Post a standard comment on the issue:
   "Thanks for opening this issue. It has been logged and labeled. We will triage it shortly.
   — Tempo Flow team"

4. If the issue has a `bug` label:
   - Post to Discord #agent-cursor:
     "[TRIAGE] New bug issue #{{number}}: {{title}}. URL: {{issue_url}}. Cursor Cloud: please review and create a fix branch if confirmed."
   
5. If the issue has a `backend` label:
   - Post to Discord #agent-cursor with the tag `[BACKEND]` instead.

6. All issues: post a brief note to Discord #agent-pokee:
   "[TRIAGE] Issue #{{number}} ({{labels}}) labeled and replied. Author: {{author}}"

7. Write a row to Convex agent_runs:
   { agent: "pokee", job: "issue-triage", issue_number: {{number}}, labels: [{{labels}}], timestamp: <iso> }
```

---

### 4.4 Ask-the-Founder Routing

**Trigger**: Convex HTTP webhook from `askFounderQueue` table write (any new document in `askFounderQueue`). Configure the webhook in `convex/http.ts` to POST to Pokee's inbound webhook URL on any insert to `askFounderQueue`.

**Also triggers on**: Gmail label `tempo-founder-inbox` applied to a new email (secondary trigger — Pokee polls Gmail for this label every 10 minutes as a fallback).

**Prompt template**:

```
A new "Ask the Founder" message has arrived for Tempo Flow.

Source: {{event.source}} (convex | gmail)
Message ID: {{event.message_id}}
Sender name: {{event.sender_name}}
Sender email: {{event.sender_email}}
Message body: {{event.body}}
Priority: {{event.priority}} (high | normal | low — set in the original submission form)
Received at: {{event.received_at}}

Steps:
1. Append the message to the Google Sheet "Tempo Flow Founder Inbox" (Sheet ID: {{FOUNDER_INBOX_SHEET_ID}}):
   Columns: received_at | sender_name | sender_email | priority | message_body | status (default: "new") | response | response_date

2. Post to Discord #founder-inbox:
   "[FOUNDER INBOX] New message from {{sender_name}} <{{sender_email}}>
   Priority: {{priority}}
   Received: {{received_at}}
   ---
   {{message_body | truncate at 500 chars}}
   ---
   Google Sheet: https://docs.google.com/spreadsheets/d/{{FOUNDER_INBOX_SHEET_ID}}"

3. If priority == "high":
   a. Tag @amit (Amit's Discord user ID: {{AMIT_DISCORD_USER_ID}}) in the #founder-inbox message.
   b. Send an SMS via Twilio webhook ({{TWILIO_SMS_WEBHOOK}}):
      "High-priority Founder Inbox message from {{sender_name}}: {{message_body | truncate at 160 chars}}"

4. Write a row to Convex agent_runs:
   { agent: "pokee", job: "founder-inbox-route", message_id: "{{message_id}}", priority: "{{priority}}", timestamp: <iso> }
```

**Google Sheet setup**: Create a Google Sheet named "Tempo Flow Founder Inbox" in Amit's Google Drive. Share it with Pokee's Google service account (displayed in Pokee → Integrations → Google Sheets). Authorize Pokee to append rows.

---

### 4.5 Vlog Cross-Post

**Trigger**: YouTube new upload detected (Pokee polls the Tempo Flow YouTube channel's uploads RSS or PubSubHubbub push).

**Prompt template**:

```
A new Tempo Flow founder vlog has been uploaded to YouTube.

Video title: {{video.title}}
Video ID: {{video.id}}
YouTube URL: https://www.youtube.com/watch?v={{video.id}}
Published at: {{video.published_at}}
Description: {{video.description}}

Steps:
1. Check if Zo has already processed a transcript for this video:
   - Query Convex agent_artifacts where type="transcript-pipeline" and metadata contains the video ID or title.
   - If found: retrieve the artifact paths for the tweet thread, newsletter, and blog post.
   - If not found: trigger Zo to run the vlog transcription pipeline (Section 4.3 in zo_setup.md):
     POST to Zo's job trigger webhook ({{ZO_JOB_TRIGGER_WEBHOOK}}) with:
     { "job": "vlog-transcription", "youtube_url": "https://www.youtube.com/watch?v={{video.id}}", "title": "{{video.title}}", "date": "{{video.published_at}}" }
     Then wait for Zo to post the artifact to Convex (Pokee will be re-triggered by the Convex webhook when Zo finishes).

2. Once transcript artifacts are available, retrieve:
   - Tweet thread text from /tempo-flow/transcripts/processed/{{slug}}_thread.txt (via Zo artifact URL)
   - Newsletter draft from /tempo-flow/transcripts/processed/{{slug}}_newsletter.md
   - Blog post from /tempo-flow/transcripts/processed/{{slug}}_blog.md

3. Post the tweet thread to X:
   - Parse the thread file (tweets separated by blank lines).
   - Post the first tweet.
   - Reply to it with each subsequent tweet in order.

4. Post IG Reel description to Discord #agent-twin:
   "[TWIN] Please post this description to the Tempo Flow Instagram Reel for video {{video.title}}:
   {{ig_description}}
   (Amit uploads the video clip manually)"

5. Post TikTok caption to Discord #agent-twin:
   "[TWIN] TikTok caption for {{video.title}}:
   {{tiktok_caption}}"

6. Create a newsletter draft in Beehiiv (or configured newsletter platform):
   - Title: "Founder update — {{video.published_at}}"
   - Body: content from the newsletter draft file.
   - Status: draft (do not send).
   - Post to Discord #agent-pokee:
     "[POKEE] Newsletter draft created for {{video.title}}. Amit: review and publish at {{newsletter_platform_url}}"

7. Post to Discord #agent-pokee:
   "[POKEE] Vlog cross-post complete for '{{video.title}}'. X thread: posted. IG/TikTok: instructions sent to #agent-twin. Newsletter: draft created."
```

---

### 4.6 Discord Agent Status Summary

**Trigger**: Scheduled — daily at 20:00 local time (convert to UTC based on Amit's timezone, e.g. 18:00 UTC if Amit is UTC+2).

**Prompt template**:

```
Generate the daily Tempo Flow agent status summary for {{today_date}}.

Steps:
1. Read the last 24 hours of messages from the following Discord channels (via Discord bot read access):
   - #agent-cursor
   - #agent-twin
   - #agent-pokee
   - #agent-zo
   - #handoffs
   - #blocked

2. For each channel, extract:
   - Number of messages posted in the last 24 hours
   - Any BLOCKED messages still unresolved (no reaction or follow-up)
   - Key completions (jobs that reported "complete" or "success")
   - Pending items (jobs that started but have not reported completion)

3. Query Convex agent_runs for today's records:
   SELECT agent, job, status, timestamp FROM agent_runs WHERE timestamp > {{24_hours_ago}}
   Group by agent and status (complete, failed, cancelled, in-progress).

4. Format the summary:

---
# Tempo Flow Daily Agent Summary — {{today_date}}

## Cursor Cloud
- Jobs completed: {{count}} | Failed: {{count}} | PRs opened: {{count}}
- Pending: {{list any in-progress}}

## Twin
- Jobs completed: {{count}} | Blocked: {{count}}
- Key actions: {{list completions}}

## Zo
- Jobs completed: {{count}} | Failed: {{count}}
- Artifacts produced: {{count}}

## Pokee
- Workflows run: {{count}} | Errors: {{count}}

## Blocked Items (unresolved)
{{list any blocked items from #blocked with no resolution, including how long they have been blocked}}

## Action needed from Amit
{{list any items explicitly requiring Amit's input}}
---

5. DM Amit on Discord (Discord user ID: {{AMIT_DISCORD_USER_ID}}) with the summary.
6. Post a shorter version (first 10 lines) to Discord #summary.
```

---

## 5. Handoff Patterns

### 5.1 Pokee Receives GitHub Webhook → Routes to Twin / Zo / Cursor Cloud

Pokee subscribes to the following GitHub webhook events (configured in Section 3.1):

| GitHub event | Pokee action |
|---|---|
| `pull_request.opened` with label `needs-twin` | POST to Twin job trigger: `{ "job": "run-from-pr", "pr_url": "..." }`. Post to #agent-twin. |
| `pull_request.opened` with label `needs-zo` | POST to Zo job trigger webhook. Post to #agent-zo. |
| `pull_request.opened` with label `needs-review` | Post to #agent-cursor. |
| `pull_request.merged` to main | Post to #handoffs. Update TASKS.md status (see below). |
| `release.published` | Run the Release Announcement Cross-Post workflow (Section 4.1). |
| `issues.opened` | Run the GitHub Issue Triage workflow (Section 4.3). |

**Updating TASKS.md on PR merge**: Pokee does not directly edit TASKS.md — that is done via a GitHub Action that is triggered by `pull_request.merged`. The Action reads the PR title for a TASKS.md reference (format: `[TASK-123]`) and updates the task status to `done`. Pokee posts to #handoffs confirming the merge and TASKS.md update.

### 5.2 Pokee Hits a Posting Error → #blocked + Email

When any Pokee workflow encounters an error (API call fails, rate limit hit, integration token expired):

1. Pokee posts to Discord #blocked:
   ```
   [POKEE BLOCKED] Workflow: <workflow-name> | Step: <step-number>
   Error: <error-message>
   Platform: <platform-name>
   Action needed: <specific fix required>
   ```

2. Pokee sends an email to `amitlevin65@protonmail.com` via Gmail:
   ```
   Subject: Pokee workflow error — <workflow-name>
   Body: Same content as the Discord message plus any stack trace or API response body.
   ```

3. Pokee retries the failed step once after 15 minutes automatically. If the retry also fails, it marks the workflow as `failed` and does not retry further, to avoid spamming blocked channels.

---

## 6. Integration Auth Rotation Schedule

OAuth tokens and API keys expire or need rotation on different schedules. The following table summarizes each integration's token lifespan and the action required for rotation.

| Integration | Token type | Typical lifespan | Rotation action |
|---|---|---|---|
| GitHub | GitHub App token (short-lived, auto-refreshed) | 1 hour (auto) | Pokee handles automatically |
| Gmail | Google OAuth refresh token | Very long-lived | Re-authorize in Pokee if Gmail disconnects |
| YouTube | Google OAuth refresh token | Very long-lived | Same as Gmail |
| LinkedIn | OAuth 2.0 access token | 60 days | Re-authorize in Pokee every 50 days |
| Instagram / Facebook | Meta long-lived access token | 60 days | Re-authorize in Pokee every 50 days |
| TikTok | OAuth 2.0 access token | 30 days | Re-authorize in Pokee every 25 days |
| X | OAuth 2.0 access + refresh token | Access: 2 hours (auto-refresh) | Pokee handles refresh automatically |
| Discord | Bot token (non-expiring) | Permanent until revoked | Rotate only if compromised |
| PostHog | API key (non-expiring) | Permanent until revoked | Rotate annually or if compromised |
| Sentry | Auth token (non-expiring) | Permanent until revoked | Rotate annually or if compromised |
| Beehiiv | API key | Permanent until revoked | Rotate annually |

**Set calendar reminders**: LinkedIn, Instagram/Facebook, and TikTok tokens require active rotation. Set a recurring calendar reminder at day 50 (LinkedIn, Meta) and day 25 (TikTok) to re-authorize in Pokee before expiry. Expired tokens cause silent failures in cross-post workflows.

**Automated rotation alert**: Configure Pokee to post to Discord #agent-pokee 7 days before any known token expiry date (if Pokee supports token expiry tracking — otherwise, rely on the calendar reminders above).

---

## 7. Troubleshooting + Quota Management

### Workflow Does Not Trigger

**Symptom**: A GitHub release is published but no cross-post appears.

**Cause**: GitHub webhook not delivered to Pokee, or Pokee integration is disconnected.

**Fix**:
1. In GitHub → Repository Settings → Webhooks, click on the Pokee webhook and check "Recent Deliveries". If no delivery is shown, the webhook URL may have changed (Pokee regenerates webhook URLs if the integration is reset).
2. In Pokee, go to the GitHub integration and confirm it is still connected.
3. Reconnect the integration if needed and update the webhook URL in GitHub.
4. Test with a manual workflow trigger.

### Social Post Fails with Rate Limit Error

**Symptom**: Pokee posts to Discord #blocked with `429 Too Many Requests` from LinkedIn, Instagram, or X.

**Cause**: Posting too frequently. LinkedIn limits posts per day; X's API has monthly post counts on lower tiers.

**Fix**:
1. Space out release announcements — do not trigger multiple cross-posts within the same hour.
2. For X: upgrade the X Developer plan if monthly post quota is consistently hit.
3. For LinkedIn: ensure only one workflow is posting at a time (Pokee jobs are not concurrent by default, but verify if multiple workflows could both post to LinkedIn simultaneously).

### Gmail Not Reading Founder Inbox Emails

**Symptom**: "Ask the Founder" emails arrive but no Discord message appears.

**Cause**: Gmail label `tempo-founder-inbox` not applied, or Pokee's Gmail poll is not running.

**Fix**:
1. Verify the Gmail filter/rule is applying the `tempo-founder-inbox` label to incoming emails to the founder address.
2. In Pokee, verify the Gmail integration shows "Active" and the poll trigger is enabled.
3. Test manually: apply the label to an existing email and wait for Pokee's next poll cycle (up to 10 minutes).

### Convex Webhook Not Triggering Pokee

**Symptom**: A new `askFounderQueue` record is written in Convex but Pokee does not receive the event.

**Cause**: The Convex HTTP action that fires the Pokee webhook is not deployed, or the Pokee inbound webhook URL has changed.

**Fix**:
1. Check the Convex dashboard → Logs for the HTTP action at `/internal/pokee/founder-inbox` (or whatever path is configured in `convex/http.ts`).
2. Verify the Pokee inbound webhook URL in Pokee's dashboard and update it in the Convex environment variable `POKEE_FOUNDER_INBOX_WEBHOOK`.
3. Test with a manual Convex mutation to insert a test record.

### Pokee Quota Exceeded

**Symptom**: Workflows start failing with `QUOTA_EXCEEDED` errors.

**Cause**: Pokee's plan limits the number of workflow runs per month.

**Fix**:
1. Audit which workflows are running most frequently (the daily status summary runs once per day = ~30 runs/month; the weekly digest = ~4 runs/month; issue triage depends on issue volume).
2. If over quota, consider:
   - Moving the daily status summary to every-other-day.
   - Reducing the GitHub issue triage to a manual trigger if issue volume is low.
3. Upgrade the Pokee plan if sustained workflow volume warrants it.

### LinkedIn / Meta Token Expired Mid-Workflow

**Symptom**: Pokee reports an authentication error posting to LinkedIn or Instagram.

**Fix**:
1. In Pokee → Integrations → LinkedIn (or Meta), click **Re-authorize**.
2. Complete the OAuth flow.
3. Re-run the failed workflow manually.
4. Update the token expiry calendar reminder to 50 days from today.

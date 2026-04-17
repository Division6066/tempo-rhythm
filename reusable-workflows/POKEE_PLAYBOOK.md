# Pokee AI Playbook

Playbook-Version: 1.0.0
Applies-To: $PROJECT (generic — fork and replace placeholder)

---

## 1. What Pokee Is

Pokee AI is a SaaS-orchestration agent with over 50 OAuth-based integrations. You
instruct it in plain English, and it connects to external services, reads and writes
data across them, and routes events between them.

Pokee operates at the coordination layer: it receives events from GitHub, Convex, HTTP
webhooks, and Discord; decides what to do; and dispatches work to the appropriate
destination — posting to social media, filing a GitHub Issue, sending an email, triggering
a Zo job, or notifying a human.

Key characteristics:

- **Plain-text workflow authoring**: Workflows are plain-English prompts, not YAML.
  You describe what should happen when an event arrives, and Pokee figures out the steps.
- **50+ OAuth integrations**: GitHub, Gmail, LinkedIn, Instagram, Facebook, TikTok, X
  (Twitter), YouTube, Discord, PostHog, Sentry, Beehiiv, ConvertKit, Substack, Stripe,
  Google Sheets, Notion (if needed), Slack, and many more.
- **Webhook listener**: Pokee exposes HTTP endpoints you can point GitHub, Convex, or
  any other service at. When a webhook arrives, the matching workflow fires.
- **Fan-out routing**: One incoming event can trigger actions across many services in
  parallel or in sequence.
- **Scheduled triggers**: Like cron, but described in plain English and backed by real
  integrations.

Pokee is not a code editor. It does not run shell commands or manage files. It moves
data between connected SaaS services and notifies humans or other agents.

---

## 2. When to Pick Pokee

### Use Pokee when:

| Scenario | Reason |
|---|---|
| Cross-posting a release announcement to 5+ platforms | Pokee fans out to all in one workflow |
| Routing a GitHub Issue to the right label and team channel | Pokee reads labels and posts to Discord |
| Sending a weekly analytics digest via email | Pokee fetches from PostHog/Sentry, composes, sends |
| Auto-replying to triaged support email → GitHub Issue | Pokee connects email and GitHub |
| Publishing a newsletter draft from aggregated changelog | Pokee reads GitHub + Beehiiv |
| Daily agent-status summary for the founder | Pokee reads Discord channels, synthesizes, DMs |
| OAuth-based SaaS integration is the right tool | This is Pokee's native domain |

### Do NOT use Pokee when:

| Scenario | Better Agent |
|---|---|
| The target service has no OAuth or has a GUI-only admin console | Twin.so |
| The task involves writing or changing source code | Cursor IDE or Cursor Cloud |
| The task is a long-running batch (asset generation, transcription) | Zo Computer |
| The task requires executing shell commands | Zo Computer |
| The task requires human physical presence (ID upload, card entry) | Human directly |

---

## 3. Account Setup Checklist

- [ ] Create a Pokee AI account at pokee.ai
- [ ] Verify email
- [ ] Set display name to `$PROJECT bot` to distinguish from other Pokee accounts
- [ ] Generate a Pokee webhook inbound URL: Settings → Webhooks → Create Endpoint
  - Note the endpoint URL as `POKEE_WEBHOOK_URL` for use in other agents' configs
- [ ] Enable workflow logging: Settings → Logs → Enable all

---

## 4. Integrations to Connect

Connect these integrations for a typical software project. Navigate to
Pokee → Integrations for each and complete the OAuth flow.

| Integration | Purpose | Required Scopes |
|---|---|---|
| **GitHub** | Issue/PR/Release events, create issues, post comments, apply labels | `repo`, `read:org` |
| **Gmail** | Receive support email, send transactional email from founder address | `gmail.send`, `gmail.readonly` |
| **LinkedIn** | Post release announcements as text posts | `w_member_social` |
| **Instagram** | Post release visuals and short-form content | `instagram_basic`, `instagram_content_publish` |
| **Facebook** | Post to page (if public presence desired) | `pages_manage_posts`, `pages_read_engagement` |
| **TikTok** | Upload and publish short-form video | `video.upload`, `video.publish` |
| **X (Twitter)** | Post threads and announcements | `tweet.write`, `tweet.read`, `users.read` |
| **YouTube** | Cross-post vlog links and notify | `youtube.upload` (handled by Zo; Pokee only posts links) |
| **Discord** | Post to channels, read channel history, send DMs | Bot token with `Send Messages`, `Read Message History` |
| **PostHog** | Fetch analytics events for weekly digest | PostHog API key (personal or project) |
| **Sentry** | Fetch error data for daily/weekly digest | Sentry auth token with `project:read` |
| **Beehiiv** | Create newsletter drafts, publish issues | Beehiiv API key |
| **Resend** | Transactional email delivery as alternative to Gmail | Resend API key |
| **Google Sheets** | Append rows to a founder inbox log sheet | `spreadsheets` scope |

After connecting each integration, test it with a simple action from within Pokee's
workflow builder (e.g., post "test" to a Discord channel, or read the latest 5 issues
from GitHub) to confirm the token works.

---

## 5. Generic Workflow Templates

Each template below includes a plain-English prompt scaffold you paste into Pokee's
workflow builder. The trigger is described first, followed by the action sequence.

Replace `$PROJECT`, `$REPO`, `$DISCORD_CHANNEL_*`, and other placeholders before saving.

---

### 5.1 Release Announcement Cross-Post

**Trigger**: GitHub Release webhook (event: `release.published`)

**Prompt scaffold**:

```
When a new GitHub Release is published for $REPO:

1. Read the release tag, name, and body from the GitHub event payload.
2. Shorten the release URL using the GitHub short link if possible.
3. Compose a release announcement text:
   - Headline: "$PROJECT $TAG_NAME is live."
   - Body: first 3 bullet points from the release notes (strip markdown headers,
     keep bullet items).
   - Footer: "Full release notes: $RELEASE_URL"
4. Post the announcement to these destinations in parallel:
   a. X (Twitter): Post as a thread. First tweet = headline + first bullet.
      Subsequent tweets = remaining bullets. Final tweet = release URL.
   b. LinkedIn: Post as a text post with the full announcement text + hashtags:
      #$PROJECT #release #buildinpublic
   c. Instagram: Post as a caption with the first 150 chars of the announcement
      + release URL in bio note.
   d. Facebook Page ($FB_PAGE_ID): Post the full announcement text.
   e. TikTok: Post a text caption noting the release (video upload must be
      triggered separately via Zo; this is the caption-only notification).
   f. Discord channel #announcements ($DISCORD_CHANNEL_ANNOUNCEMENTS):
      Full announcement text as an embed with title, description, and URL field.
5. After all posts succeed, post to Discord #summary:
   "Release $TAG_NAME announced across X, LinkedIn, IG, FB, TikTok, Discord."
6. If any post fails, post an error to Discord #agent-pokee:
   "[ERROR] Failed to post to <platform>: <error_message>. Manual post required."
```

---

### 5.2 Weekly Analytics Digest

**Trigger**: Scheduled — every Monday at 08:00 UTC

**Prompt scaffold**:

```
Every Monday at 08:00 UTC, generate and send a weekly analytics digest for $PROJECT.

Steps:
1. Fetch from PostHog (project token: $POSTHOG_PROJECT_TOKEN):
   - Total unique users (last 7 days)
   - Top 5 events by count (last 7 days)
   - New user signups (last 7 days)
   - Retention: users who returned after day 1 (last 7-day cohort)
2. Fetch from Sentry (project: $SENTRY_PROJECT_SLUG):
   - Total error count (last 7 days)
   - Top 3 unresolved issues by occurrence count
3. Fetch from GitHub (repo: $REPO):
   - Number of PRs merged (last 7 days)
   - Number of Issues opened (last 7 days)
   - Number of Issues closed (last 7 days)
   - Current total star count
4. Compose a digest email:
   Subject: "$PROJECT Weekly Digest — Week of $DATE"
   Body (plain text + HTML):
   --- USERS ---
   Total active users (7d): $USERS
   New signups: $SIGNUPS
   Day-1 retention: $RETENTION%

   --- TOP EVENTS ---
   $EVENT_1: $COUNT_1
   $EVENT_2: $COUNT_2
   $EVENT_3: $COUNT_3
   $EVENT_4: $COUNT_4
   $EVENT_5: $COUNT_5

   --- ERRORS ---
   Total errors (7d): $ERROR_COUNT
   Top issues:
   1. $ISSUE_1 ($COUNT occurrences)
   2. $ISSUE_2 ($COUNT occurrences)
   3. $ISSUE_3 ($COUNT occurrences)

   --- GITHUB ---
   PRs merged: $PRS_MERGED | Issues opened: $ISSUES_OPENED | Closed: $ISSUES_CLOSED
   Total stars: $STARS

5. Send the email via Resend from $SENDER_EMAIL to $RECIPIENT_EMAILS.
6. Also post an abbreviated version to Discord #summary:
   "$PROJECT weekly digest sent. Users: $USERS | Signups: $SIGNUPS |
    Errors: $ERROR_COUNT | PRs merged: $PRS_MERGED | Stars: $STARS"
```

---

### 5.3 GitHub Issue Triage

**Trigger**: GitHub Issue webhook (event: `issues.opened`)

**Prompt scaffold**:

```
When a new GitHub Issue is opened in $REPO:

1. Read the issue title, body, and author from the event payload.
2. Classify the issue by reading its content:
   - If the title or body mentions "bug", "error", "crash", "broken", "not working":
     label it "bug"
   - If it mentions "feature", "request", "would be nice", "suggestion":
     label it "enhancement"
   - If it mentions "docs", "documentation", "readme", "example":
     label it "documentation"
   - If it mentions "question", "how do I", "help":
     label it "question"
   - Otherwise: label it "triage"
3. Apply the label to the issue using the GitHub API.
4. Post an auto-reply comment on the issue:
   For "bug": "Thanks for reporting! This has been labeled as a bug and will be
   reviewed by the team. If you can reproduce this consistently, please share any
   error logs or screenshots."
   For "enhancement": "Thanks for the feature request! We've added it to our backlog.
   Upvotes (+1 reactions) help us prioritize."
   For "question": "Thanks for reaching out! We'll get back to you. For faster help,
   search existing issues or check the docs at $DOCS_URL."
   For "triage": "Thanks! We've received your issue and will triage it shortly."
5. Route to Discord:
   - Post to #$DISCORD_CHANNEL_ISSUES:
     "New issue [$LABEL] #$ISSUE_NUMBER: $ISSUE_TITLE — $ISSUE_URL"
   - If label is "bug": also ping @$ONCALL_DISCORD_HANDLE in the post.
6. If the issue body is fewer than 20 words and label is "bug", also post to
   Discord #agent-pokee: "Possible low-quality bug report: $ISSUE_URL — manual
   review recommended."
```

---

### 5.4 Founder-Inbox Routing

**Trigger**: Gmail — new email matching filter: `to:$FOUNDER_EMAIL`

**Prompt scaffold**:

```
When a new email arrives at $FOUNDER_EMAIL:

1. Read: sender, subject, body (first 500 chars), timestamp.
2. Classify:
   - "investor": subject or body contains "investment", "funding", "term sheet",
     "cap table", "portfolio", "angel"
   - "partner": "integration", "partnership", "collaborate", "co-market", "B2B"
   - "press": "journalist", "media", "article", "podcast", "interview", "publication"
   - "support": "bug", "not working", "help", "account", "subscription", "refund"
   - "job": "hiring", "role", "resume", "CV", "work with you", "join your team"
   - "other": everything else
3. Append a row to Google Sheet ($FOUNDER_INBOX_SHEET_ID):
   Columns: Timestamp | Sender | Subject | Classification | Snippet | Action Taken
4. Post to Discord #approvals:
   "[INBOX] $CLASSIFICATION: From $SENDER — \"$SUBJECT\"
    Snippet: $BODY_SNIPPET
    Action: [Reply] [Archive] [Create Issue] [Forward]"
5. If classification is "support":
   - Also create a GitHub Issue in $REPO with:
     Title: "Customer support: $SUBJECT"
     Body: Sender email (masked), subject, body snippet, classification label
     Labels: ["support", "needs-triage"]
   - Post the issue link in the Discord message.
6. If classification is "investor" or "press":
   - Send a Twilio SMS to $FOUNDER_PHONE: "Priority email from $SENDER ($CLASSIFICATION).
     Check Discord #approvals."
```

---

### 5.5 Vlog Cross-Post

**Trigger**: HTTP webhook from Zo (Zo posts this after uploading a processed video to YouTube)

**Prompt scaffold**:

```
When a vlog cross-post webhook arrives from Zo:

Payload fields expected:
- youtube_url: string
- video_title: string
- transcript_summary: string (200-word summary produced by Zo transcription pipeline)
- thread_text: string (Twitter thread produced by Zo transcription pipeline)
- reel_description: string (150-char Instagram/TikTok caption produced by Zo)

Steps:
1. Post to X (Twitter): Post the thread_text as a thread. First tweet includes
   the YouTube URL.
2. Post to LinkedIn: "New vlog: $VIDEO_TITLE\n\n$TRANSCRIPT_SUMMARY\n\n
   Watch: $YOUTUBE_URL\n\n#$PROJECT #buildinpublic"
3. Post to Instagram: Caption = reel_description + " Link in bio."
   (Actual video must be uploaded as a Reel separately — this sets the caption
   for the post. Flag to Discord if native video upload is needed.)
4. Post to TikTok: Caption = reel_description. Video URL: $YOUTUBE_URL
   (Note: TikTok requires native video upload, not YouTube links. Flag if
   direct upload is needed.)
5. Post to Discord #announcements: "New vlog posted: $VIDEO_TITLE — $YOUTUBE_URL"
6. Post to Discord #summary: "Vlog cross-post complete. Platforms: X, LinkedIn, IG, TikTok, Discord."
```

---

### 5.6 Daily Agent Status Summary

**Trigger**: Scheduled — every day at 23:00 UTC

**Prompt scaffold**:

```
Every day at 23:00 UTC, compile and DM a daily agent status summary to the founder.

Steps:
1. Read the last 24 hours of messages from these Discord channels:
   - #agent-cursor-cloud
   - #agent-twin
   - #agent-pokee
   - #agent-zo
   - #handoffs
   - #approvals
   - #blocked
2. For each channel, extract:
   - Count of [DONE] events
   - Count of [ERROR] events
   - Count of [BLOCKED] events
   - Count of [APPROVAL] requests
   - Any unresolved [BLOCKED] messages (no subsequent human reply)
3. Compose a DM to $FOUNDER_DISCORD_ID:
   "**$PROJECT Daily Agent Report — $DATE**

   **Cursor Cloud**: $DONE_COUNT done, $ERROR_COUNT errors
   **Twin**: $DONE_COUNT done, $ERROR_COUNT errors, $BLOCKED_COUNT blocked
   **Pokee**: $DONE_COUNT workflows run, $ERROR_COUNT errors
   **Zo**: $DONE_COUNT jobs, $ERROR_COUNT errors

   **Approvals awaiting**: $APPROVAL_COUNT
   **Still blocked** (no reply yet):
   $UNRESOLVED_BLOCKED_LIST

   **Action required**: $ACTION_ITEMS"
4. Also post an abbreviated summary to Discord #summary:
   "Daily report sent to founder DM. Highlights: $HIGHLIGHTS"
```

---

### 5.7 Newsletter Issue Automation

**Trigger**: Scheduled — every Friday at 18:00 UTC

**Prompt scaffold**:

```
Every Friday at 18:00 UTC, draft the weekly newsletter issue for $PROJECT on $NEWSLETTER_PLATFORM.

Steps:
1. Fetch from GitHub ($REPO):
   - All PRs merged this week (Monday 00:00 UTC to Friday 18:00 UTC). Get: title, URL, merged_at.
   - All blog posts published this week: look for commits to /content/blog/ or /posts/ directory.
2. Fetch from Zo S3 bucket: list any digest files from the current week at
   $PROJECT/digests/YYYY/MM/ prefix (if the weekly digest job ran, it will have produced one).
3. Compose newsletter draft:
   Subject: "$PROJECT Weekly — $DATE_RANGE"
   Sections:
   a. "This Week in $PROJECT" — 2–3 sentence intro written conversationally.
   b. "What Shipped" — bullet list of merged PR titles with links.
   c. "From the Blog" — links to any new blog posts with 1-sentence description each.
   d. "By the Numbers" — copy from the weekly analytics digest email (fetch from
      the digest sent by workflow 5.2 earlier in the week if available).
   e. "What's Next" — 2–3 sentences on what's coming next week (read from TASKS.md
      if the repo is connected, or leave as a placeholder: "Continued work on X").
   f. Footer — unsubscribe link, social links.
4. Create a draft in $NEWSLETTER_PLATFORM using the API:
   - Title: "$PROJECT Weekly — $DATE_RANGE"
   - Status: draft (do not publish)
   - Content: the composed HTML/Markdown above
5. Post to Discord #approvals:
   "[APPROVAL] Newsletter draft created in $NEWSLETTER_PLATFORM for week of $DATE_RANGE.
   Review at: $DRAFT_URL. Reply 'publish' to send, or 'skip' to discard."
6. Wait for human reply. If 'publish', trigger $NEWSLETTER_PLATFORM publish API.
   If 'skip', delete the draft.
```

---

### 5.8 Error Log Digest

**Trigger**: Scheduled — every day at 07:00 UTC

**Prompt scaffold**:

```
Every day at 07:00 UTC, send the top error digest for $PROJECT from Sentry.

Steps:
1. Fetch from Sentry (project: $SENTRY_PROJECT_SLUG, auth token: $SENTRY_AUTH_TOKEN):
   - Top 5 unresolved issues by occurrence count in the last 24 hours.
   - For each: issue ID, title, first occurrence, last occurrence, count, culprit file.
2. Compose an email:
   Subject: "$PROJECT Error Digest — $DATE (Top 5 Issues)"
   Body:
   Rank | Issue | Count | First Seen | Last Seen | Culprit
   ---- | ----- | ----- | ---------- | --------- | -------
   (one row per issue)
   Footer: "Full dashboard: $SENTRY_PROJECT_URL"
3. Send via Resend to $ERROR_DIGEST_RECIPIENTS.
4. Post to Discord #agent-pokee:
   "Daily error digest sent. Top issue: $TOP_ISSUE_TITLE ($TOP_ISSUE_COUNT occurrences)."
5. If the top issue count exceeds $ERROR_ALERT_THRESHOLD (default: 100):
   Also post to Discord #blocked: "[ALERT] High error rate. $TOP_ISSUE_TITLE has
   $COUNT occurrences in 24h. Investigate: $SENTRY_ISSUE_URL"
```

---

### 5.9 Customer Feedback Routing

**Trigger**: Gmail — new email matching filter: `to:$SUPPORT_EMAIL`

**Prompt scaffold**:

```
When a new support email arrives at $SUPPORT_EMAIL:

1. Read: sender email, subject, body.
2. Determine if this is a new unique issue or a duplicate:
   - Search existing open GitHub Issues in $REPO with label "support" for
     subject keywords.
   - If a matching issue exists, post a comment on that issue with the
     new email sender (masked to first 3 chars of email) and body snippet.
     Do not create a duplicate issue.
   - If no matching issue exists, create a new one:
     Title: "[Support] $SUBJECT"
     Body: "**From**: $MASKED_EMAIL\n**Subject**: $SUBJECT\n\n**Message**:\n$BODY"
     Labels: ["support", "needs-triage"]
3. Send an auto-reply to the sender via Resend:
   Subject: "Re: $SUBJECT — We received your message"
   Body: "Hi,\n\nThanks for reaching out to $PROJECT support. We've received your
   message and will get back to you within $SUPPORT_SLA (typically 1–2 business days).
   Your reference number is GitHub Issue #$ISSUE_NUMBER.\n\nBest,\nThe $PROJECT Team"
4. Post to Discord #$DISCORD_CHANNEL_SUPPORT:
   "New support email from $MASKED_EMAIL: \"$SUBJECT\" → $ISSUE_URL"
5. Append to Google Sheet ($SUPPORT_LOG_SHEET_ID):
   Columns: Timestamp | Masked Sender | Subject | Issue URL | Auto-Reply Sent
```

---

## 6. Handoff Patterns

Pokee is the central router in this agent stack. It sits between all event sources and
all agent executors.

### Pokee as the Event Hub

```
GitHub Webhook ─┐
Convex Webhook  ─┤
Discord Reply   ─┤──► Pokee ──► Twin (GUI task)
Zo HTTP POST    ─┤         ├──► Zo (batch job)
Scheduled cron  ─┘         ├──► Cursor Cloud (label-based)
                            ├──► Human (Discord DM or SMS)
                            └──► Multi-platform publish
```

### Pokee → Twin (trigger a session)

```
Pokee receives GitHub Release webhook
  → Evaluates: does this release require App Store submission?
    (Check: does the release tag include "ios" or "android" in the name,
     or does the release body contain the string "submit-to-store"?)
  → If yes: POST to Twin API with the App Store Connect prompt scaffold
  → Twin executes the session
  → Twin POSTs result back to Pokee webhook
  → Pokee posts result to Discord
```

### Pokee → Zo (trigger a batch job)

```
Pokee receives a scheduled cron trigger (e.g., Friday 18:00 UTC)
  → POSTs to Zo webhook with the transcription pipeline prompt
  → Zo runs the job overnight
  → Zo POSTs completion to Pokee webhook
  → Pokee fans out the result (Discord, email, newsletter draft)
```

### Pokee → Human (escalation)

```
Pokee detects an unresolved [BLOCKED] in #blocked that is more than N hours old
  → Sends Twilio SMS to $FOUNDER_PHONE: "Agent blocked since <time>. Check Discord #blocked."
  → Sends Resend email to $FOUNDER_EMAIL with the blocked message content
```

---

## 7. OAuth Token Rotation and Quota Management

### Token Rotation Schedule

| Integration | Token Expiry | Rotation Action |
|---|---|---|
| GitHub OAuth | Long-lived (no expiry by default) | Rotate annually or on team change |
| Gmail OAuth | Refresh tokens are long-lived | Test monthly; rotate on Google account password change |
| X (Twitter) | OAuth 2.0 access tokens expire; refresh tokens do not | Pokee handles refresh automatically |
| LinkedIn | 60-day access tokens | Pokee should refresh before expiry; re-authenticate if expired |
| Instagram | 60-day tokens | Same as LinkedIn |
| TikTok | 24-hour access token; 365-day refresh token | Pokee handles rotation; monitor for 401 errors |
| Sentry | Auth tokens do not expire | Rotate annually |
| PostHog | Personal API keys do not expire | Rotate annually |
| Beehiiv | API keys do not expire | Rotate on team change |
| Resend | API keys do not expire | Rotate on security incident |

### Quota Awareness

- **X (Twitter)**: Free tier allows 1,500 tweet writes per month. At 7 posts/week
  across threads, this is approximately 100–200 tweets/month. Monitor usage in the
  Twitter Developer Portal.
- **LinkedIn**: 100 posts per day per user token. Cross-posting is well within limits.
- **Instagram**: 25 API calls per hour (Content Publishing API). Batch posts and add
  delays if posting many assets.
- **Gmail send**: Google Workspace accounts allow 2,000 sends/day via API. For high
  volume, use Resend instead.
- **GitHub API**: 5,000 requests/hour for authenticated apps. The triage workflow
  consumes ~3 requests per issue (read, label, comment). At 100 issues/hour this is
  fine; above that, implement batching.
- **Sentry API**: 100 requests/second. Daily digest jobs are well within this.
- **PostHog Cloud**: API rate limits vary by plan. Check your plan's documentation.

### Monitoring Token Health

- Add a Pokee workflow that runs weekly and makes a test API call to each integration.
- If any call returns 401 or 403, post to Discord #blocked: "Token health check failed
  for $INTEGRATION. Re-authenticate in Pokee settings."

---

## 8. Troubleshooting

### Workflow fires but no action occurs

**Symptom**: The webhook arrives, Pokee logs show the workflow triggered, but nothing
was posted or created.
**Fix**:
1. Check Pokee Logs → Workflow Runs for the specific run.
2. Look for the first step that returned an error.
3. Common causes: expired OAuth token, rate limit hit, malformed payload field reference.
4. Fix the OAuth token or the payload reference, then manually re-trigger the workflow.

### Cross-post succeeds on some platforms but fails on others

**Symptom**: X post appears but LinkedIn post does not.
**Fix**:
1. Check each integration's status separately in Pokee Logs.
2. For LinkedIn: check that the token has not expired (LinkedIn tokens expire after 60 days).
3. For Instagram: check that the account is a Business or Creator account — personal
   accounts cannot use the Content Publishing API.
4. For TikTok: verify the refresh token has not expired (365-day limit).

### GitHub Issue triage creates duplicate labels

**Symptom**: An issue ends up with both "bug" and "triage" labels.
**Fix**: Review the classification logic in the workflow. Add explicit `else if` style
conditions (in Pokee's workflow description) so only one label is applied per issue.
Update the prompt to say: "Apply exactly one label from this list, chosen by the first
matching condition."

### Gmail trigger fires on outgoing auto-replies

**Symptom**: The founder-inbox workflow creates a GitHub Issue for Pokee's own auto-reply.
**Fix**: Add a filter condition at the top of the workflow: "If the sender email matches
$SENDER_EMAIL or $RESEND_FROM_DOMAIN, stop and do nothing." Alternatively, configure
the Gmail filter in Google's own filter settings to only trigger on inbound mail to the
support alias, not outgoing replies.

### Scheduled workflow misses a trigger

**Symptom**: The Friday newsletter draft was not created.
**Fix**:
1. Check Pokee's scheduled job log for that time slot.
2. Common causes: Pokee account was temporarily suspended, network issue, or the
   scheduled trigger was accidentally deleted.
3. Manually trigger the workflow from the Pokee dashboard to catch up.
4. Add a Pokee workflow that checks if the newsletter draft exists by Sunday morning
   and posts to Discord #blocked if not: "Newsletter draft not found for this week."

---

*End of POKEE_PLAYBOOK.md*

# Zo Computer Playbook

Playbook-Version: 1.0.0
Applies-To: $PROJECT (generic — fork and replace placeholder)

---

## 1. What Zo Computer Is

Zo Computer is a personal AI cloud computer — a persistent, remotely accessible virtual
machine operated by an AI agent. Unlike a CI runner that executes a fixed script and
exits, Zo maintains a workspace: files persist between sessions, background processes can
run for hours, and you interact with it through natural-language instructions rather than
YAML pipelines.

Key characteristics:

- **Persistent workspace**: Files you place in the workspace survive across jobs. This
  makes Zo suitable for multi-step pipelines where one job produces artifacts consumed by
  the next.
- **Long-running processes**: Zo can run a job for 8–12 hours without a timeout, making
  it the right tool for overnight asset batches, large transcription runs, and multi-file
  refactors that would exhaust a Cursor Cloud session.
- **Natural-language interface**: You instruct Zo in plain English. It interprets the
  instruction, writes the necessary scripts, executes them, and reports results.
- **Scheduled execution**: Zo supports cron-style triggers. Point a Zo job at a schedule
  and it fires automatically — no GitHub Actions YAML required.
- **Model API passthrough**: Zo can call OpenAI, Anthropic, Replicate, ElevenLabs, and
  other model APIs on your behalf, treating them as tools inside a larger pipeline.

Zo is not a coding IDE. It does not give you a fast feedback loop for iterative coding.
It is a cloud execution environment for jobs you define and then walk away from.

---

## 2. When to Pick Zo

Use this decision matrix before assigning a job to Zo.

### Use Zo when:

| Scenario | Reason |
|---|---|
| Job runs longer than 2 hours | Cursor Cloud sessions have shorter time budgets; Zo has no practical timeout |
| Job produces file artifacts (images, audio, PDFs, zip bundles) | Zo workspace stores them; you retrieve via download or S3 push |
| Job requires calling multiple model APIs in sequence | Zo orchestrates multi-step pipelines natively |
| Job should fire on a schedule (daily, weekly, nightly) | Zo has native cron scheduling |
| Job processes large batches of inputs (100+ items) | Zo handles fan-out loops without timeouts |
| Job is a transcription pipeline (audio → text → structured output) | Zo has audio processing tools |
| Job is research synthesis (read 50 URLs → produce a report) | Zo can run a crawler + summarizer pipeline |
| Job is a release artifact bundle (zip, checksum, upload) | Zo produces and uploads reliably |
| You want "ship while I sleep" execution with no babysitting | Zo is designed for exactly this |

### Do NOT use Zo when:

| Scenario | Better Agent |
|---|---|
| Tight-loop coding with fast iteration | Cursor IDE |
| Parallel PR-based code changes | Cursor Cloud Background Agents |
| GUI-gated dashboard action (App Store, Stripe) | Twin.so |
| Cross-posting a release to social media | Pokee AI |
| Anything requiring human approval before proceeding | Route to `#approvals` first; do not start Zo |

---

## 3. Account Setup Checklist

Complete these steps once per project. Subsequent jobs skip to section 4.

### 3.1 Account Creation

- [ ] Create a Zo Computer account at zo.computer
- [ ] Verify email address
- [ ] Choose a workspace name matching `$PROJECT` (lowercase, hyphenated)
- [ ] Note the workspace URL (used in handoff webhooks)

### 3.2 GitHub Connection

- [ ] In Zo settings → Integrations → GitHub, authorize the OAuth app
- [ ] Grant read access to `$PROJECT` repository (required for code jobs)
- [ ] Grant write access if Zo will open PRs (code error sweep template)
- [ ] Test the connection: run `git clone $PROJECT_REPO_URL` from a Zo session and
  confirm it succeeds

### 3.3 Model API Key Entries

Zo uses these API keys to call external models on your behalf. Enter them in
Zo Settings → API Keys.

| Key Name | Source | Required For |
|---|---|---|
| `OPENAI_API_KEY` | platform.openai.com | GPT-4o summarization, embeddings |
| `ANTHROPIC_API_KEY` | console.anthropic.com | Claude synthesis, code review |
| `REPLICATE_API_TOKEN` | replicate.com | Image generation, audio models |
| `ELEVENLABS_API_KEY` | elevenlabs.io | Text-to-speech (optional) |
| `RESEND_API_KEY` | resend.com | Email delivery from Zo pipelines |
| `$PROJECT_CONVEX_DEPLOY_URL` | Convex dashboard | Posting handoff events |
| `DISCORD_WEBHOOK_ZO` | Discord server settings | Status posts to #agent-zo |
| `S3_BUCKET` + `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` | AWS | Artifact storage |

Never paste key values into Zo prompt text. Always reference the named key.

### 3.4 Workspace Provisioning

- [ ] Create a directory structure in the Zo workspace:
  ```
  /workspace/
    $PROJECT/
      inputs/       # files Zo should read
      outputs/      # files Zo produces
      logs/         # job logs
      scripts/      # reusable helper scripts
  ```
- [ ] Upload any seed files (brand kit, voice samples, logo assets) to `/workspace/$PROJECT/inputs/`
- [ ] Create a `workspace-manifest.md` listing what is in each directory
- [ ] Set the default working directory in Zo preferences to `/workspace/$PROJECT/`

### 3.5 Webhook Configuration

- [ ] Note your Zo workspace webhook URL (Settings → Webhooks → Inbound)
- [ ] In Pokee, add a Zo action using that webhook URL
- [ ] In Convex (if used), add `ZO_WEBHOOK_URL` to environment variables
- [ ] Test with a ping: send `{"event": "ping"}` and confirm Zo logs it

---

## 4. Generic Job Templates

Each template below includes:
- A plain-English description of what the job does
- The full prompt scaffold you paste into Zo to start the job
- Required env vars
- Expected output artifacts

Replace `$PROJECT`, `$REPO_URL`, `$DISCORD_WEBHOOK_ZO`, and other placeholders with
real values before running.

---

### 4.1 Overnight Code Error Sweep

**Purpose**: Zo clones the repo, runs type-checking and linting, patches trivial errors
it can fix automatically, and opens a PR with the changes. Runs overnight so the team
wakes up to a clean state.

**Required env vars**: `ANTHROPIC_API_KEY`, `$REPO_URL`, `GITHUB_TOKEN`

**Prompt scaffold**:

```
You are running an overnight code quality sweep for $PROJECT.

Steps:
1. Clone $REPO_URL into /workspace/$PROJECT/sweep/ using the GITHUB_TOKEN env var
   for authentication.
2. Install dependencies: run `npm install` (or the appropriate package manager for
   this repo — check package.json for a packageManager field).
3. Run the type checker: `npx tsc --noEmit`. Capture all output to
   /workspace/$PROJECT/logs/tsc-output.txt.
4. Run the linter: `npx eslint . --ext .ts,.tsx`. Capture all output to
   /workspace/$PROJECT/logs/eslint-output.txt.
5. For each error or warning in the output:
   a. If it is a trivially auto-fixable issue (unused import, missing semicolon,
      wrong quote style, explicit `any` where the type is obvious from context),
      fix it directly in the file.
   b. If it requires judgment (architectural change, breaking API, unclear intent),
      write it to /workspace/$PROJECT/logs/needs-human-review.md with file path,
      line number, and a one-sentence explanation.
6. After applying all auto-fixes, run tsc and eslint again. All auto-fixed errors
   should now be gone. If new errors appeared, revert those changes and add them
   to needs-human-review.md.
7. Create a git branch named `zo/error-sweep-YYYY-MM-DD`.
8. Commit all changes with message: "chore: automated type and lint fixes [zo]"
9. Push the branch and open a GitHub PR with:
   - Title: "Automated error sweep — YYYY-MM-DD"
   - Body: paste the contents of the logs directory summary
   - Labels: ["zo-automated", "needs-review"]
10. Post to Discord webhook $DISCORD_WEBHOOK_ZO:
    {"content": "[DONE] Error sweep complete. PR: <pr_url>. Human review items: <count>"}

Do not modify any files in /workspace/$PROJECT/sweep/ outside of TypeScript/TSX source
files. Do not change package.json, lock files, config files, or test fixtures.
Do not open more than one PR. If the branch already exists, delete it and recreate.
```

**Expected outputs**:
- GitHub PR with automated fixes
- `/workspace/$PROJECT/logs/needs-human-review.md`
- Discord message in `#agent-zo`

---

### 4.2 Asset Batch Generation

**Purpose**: Zo generates a batch of visual or audio assets (social cards, OG images,
marketing graphics, voice-over clips) from a list of inputs. This offloads expensive
generation from local machines and produces a downloadable artifact bundle.

**Required env vars**: `REPLICATE_API_TOKEN`, `ANTHROPIC_API_KEY`, `S3_BUCKET`,
`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `DISCORD_WEBHOOK_ZO`

**Prompt scaffold**:

```
You are generating a batch of marketing assets for $PROJECT.

Input file: /workspace/$PROJECT/inputs/asset-brief.json
Format of asset-brief.json:
{
  "assets": [
    {
      "id": "string",
      "type": "social-card" | "og-image" | "banner" | "voice-clip",
      "title": "string",
      "subtitle": "string (optional)",
      "theme": "light" | "dark",
      "dimensions": { "width": number, "height": number }
    }
  ],
  "brand": {
    "primary_color": "#hex",
    "font": "string",
    "logo_url": "url"
  }
}

Steps:
1. Read /workspace/$PROJECT/inputs/asset-brief.json.
2. For each asset of type "social-card", "og-image", or "banner":
   a. Generate an image using Replicate (use the model appropriate for the size:
      stabilityai/stable-diffusion-xl-base-1.0 for general images, or
      construct a prompt using the title, subtitle, brand colors, and theme).
   b. Save the output to /workspace/$PROJECT/outputs/<asset.id>.<ext>.
3. For each asset of type "voice-clip":
   a. Call ElevenLabs TTS API with the title text.
   b. Save the output to /workspace/$PROJECT/outputs/<asset.id>.mp3.
4. After all assets are generated:
   a. Create a manifest file /workspace/$PROJECT/outputs/manifest.json listing
      each asset ID, type, file path, dimensions, and file size.
   b. Zip the outputs directory: /workspace/$PROJECT/outputs/assets-YYYY-MM-DD.zip
   c. Upload the zip to S3 bucket $S3_BUCKET at key:
      $PROJECT/assets/YYYY-MM-DD/assets-YYYY-MM-DD.zip
   d. Generate a pre-signed URL valid for 7 days.
5. Post to Discord webhook $DISCORD_WEBHOOK_ZO:
   {"content": "[DONE] Asset batch complete. $COUNT assets. Download: <presigned_url>"}

If any individual asset fails to generate, log the error to
/workspace/$PROJECT/logs/failed-assets.txt and continue with the rest.
Do not abort the entire batch for a single failure.
```

**Expected outputs**:
- All assets in `/workspace/$PROJECT/outputs/`
- `manifest.json`
- Zip uploaded to S3 with pre-signed URL posted to Discord

---

### 4.3 Transcription Pipeline

**Purpose**: Zo takes audio or video files, transcribes them, then produces a structured
set of outputs: cleaned transcript, Twitter/X thread, blog post draft, and newsletter
section draft. Designed for founder vlog recordings, podcast episodes, or meeting
recordings.

**Required env vars**: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `DISCORD_WEBHOOK_ZO`,
`S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

**Prompt scaffold**:

```
You are running a transcription and content repurposing pipeline for $PROJECT.

Input: /workspace/$PROJECT/inputs/audio/ (directory of .mp3 or .mp4 files)
Output: /workspace/$PROJECT/outputs/transcripts/

Steps:
1. List all .mp3 and .mp4 files in /workspace/$PROJECT/inputs/audio/.
2. For each file:
   a. Transcribe using OpenAI Whisper API (model: whisper-1).
      - Request verbose_json format to get word-level timestamps.
      - Save raw transcript to /workspace/$PROJECT/outputs/transcripts/<filename>.raw.json
   b. Clean the transcript:
      - Remove filler words (um, uh, like) that appear more than once per sentence.
      - Fix obvious speech-to-text errors using context.
      - Produce a clean plain-text version at <filename>.clean.txt
   c. Produce a Twitter/X thread from the transcript:
      - Maximum 15 tweets, each under 280 characters.
      - First tweet is a hook summarizing the key insight.
      - Save to <filename>.thread.txt
   d. Produce a blog post draft:
      - 600–900 words.
      - H2 headings for main sections.
      - No "As an AI" language.
      - Use first-person voice matching the speaker.
      - Save to <filename>.blog.md
   e. Produce a newsletter section:
      - 150–200 words.
      - Suitable as a section inside a weekly newsletter.
      - End with a call to action pointing to the blog post.
      - Save to <filename>.newsletter-section.md
3. After all files are processed:
   a. Create a /workspace/$PROJECT/outputs/transcripts/index.md listing each
      input file, its clean transcript path, thread path, blog path, and
      newsletter section path.
   b. Zip the transcripts directory.
   c. Upload to S3 at $PROJECT/transcripts/YYYY-MM-DD/transcripts.zip.
   d. Generate a pre-signed URL valid for 14 days.
4. Post to Discord webhook $DISCORD_WEBHOOK_ZO:
   {"content": "[DONE] Transcription pipeline complete. $COUNT files processed.
    Download: <presigned_url>. Review index: transcripts/index.md"}

If Whisper returns an error for a file, log it and continue.
Do not hallucinate content — base all outputs strictly on the transcript text.
```

**Expected outputs**:
- Per-file: `.raw.json`, `.clean.txt`, `.thread.txt`, `.blog.md`, `.newsletter-section.md`
- `index.md`
- Zip on S3 with pre-signed URL

---

### 4.4 Release Artifact Bundling

**Purpose**: Zo pulls a specific release tag, runs the production build, packages the
output into a distributable archive, generates checksums, and uploads to S3. Used for
self-hosted deployments, desktop builds, or release packages that go alongside a GitHub
Release.

**Required env vars**: `GITHUB_TOKEN`, `$REPO_URL`, `$RELEASE_TAG`, `S3_BUCKET`,
`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `DISCORD_WEBHOOK_ZO`

**Prompt scaffold**:

```
You are building and packaging release artifacts for $PROJECT version $RELEASE_TAG.

Steps:
1. Clone $REPO_URL at tag $RELEASE_TAG:
   git clone --branch $RELEASE_TAG --depth 1 $REPO_URL /workspace/$PROJECT/release-build/
2. Install dependencies:
   cd /workspace/$PROJECT/release-build/ && npm ci
3. Run the production build:
   npm run build
   Capture stdout and stderr to /workspace/$PROJECT/logs/build-RELEASE_TAG.txt.
   If the build exits non-zero, post an error to Discord and abort.
4. Package the build output:
   a. Determine the output directory from package.json (look at the "build" script
      to find the output dir, typically dist/ or build/).
   b. Create a tar.gz archive:
      tar -czf /workspace/$PROJECT/outputs/$PROJECT-$RELEASE_TAG.tar.gz \
        -C /workspace/$PROJECT/release-build/ <output_dir>
   c. Create a zip archive:
      zip -r /workspace/$PROJECT/outputs/$PROJECT-$RELEASE_TAG.zip \
        /workspace/$PROJECT/release-build/<output_dir>
5. Generate checksums:
   sha256sum /workspace/$PROJECT/outputs/$PROJECT-$RELEASE_TAG.tar.gz > \
     /workspace/$PROJECT/outputs/$PROJECT-$RELEASE_TAG.tar.gz.sha256
   sha256sum /workspace/$PROJECT/outputs/$PROJECT-$RELEASE_TAG.zip > \
     /workspace/$PROJECT/outputs/$PROJECT-$RELEASE_TAG.zip.sha256
6. Upload all four files to S3:
   s3 key prefix: $PROJECT/releases/$RELEASE_TAG/
7. Generate pre-signed URLs (valid 30 days) for all four files.
8. Post to Discord webhook $DISCORD_WEBHOOK_ZO:
   {"content": "[DONE] Release $RELEASE_TAG artifacts ready.\n
    tar.gz: <url>\nzip: <url>\nsha256s: <url1> <url2>"}
9. Update the GitHub Release for $RELEASE_TAG by uploading the artifacts
   as release assets using the GitHub API (use GITHUB_TOKEN).
```

**Expected outputs**:
- `.tar.gz` and `.zip` bundles + `.sha256` files on S3
- Artifacts attached to the GitHub Release
- Discord notification

---

### 4.5 Research and Synthesis Batch

**Purpose**: Zo takes a list of URLs or topics, fetches and reads each source, and
produces a synthesized research report. Useful for competitive analysis, literature
review, or weekly link digests.

**Required env vars**: `ANTHROPIC_API_KEY`, `DISCORD_WEBHOOK_ZO`, `S3_BUCKET`,
`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

**Prompt scaffold**:

```
You are running a research synthesis job for $PROJECT.

Input file: /workspace/$PROJECT/inputs/research-brief.json
Format:
{
  "topic": "string — the overarching research question",
  "sources": [
    { "url": "string", "label": "string (optional)" }
  ],
  "output_format": "executive-summary" | "annotated-bibliography" | "competitive-matrix",
  "max_words": number
}

Steps:
1. Read /workspace/$PROJECT/inputs/research-brief.json.
2. For each source URL:
   a. Fetch the page content (use a headless HTTP request; handle redirects).
   b. If the URL returns a PDF, extract text.
   c. If the URL is a YouTube video, extract the auto-caption transcript via the
      YouTube oEmbed or data API.
   d. Save the raw content to /workspace/$PROJECT/outputs/research/raw/<label>.txt.
   e. Produce a 200-word summary of the source.
   f. Extract 3–5 key claims or data points as bullet points.
3. Once all sources are processed:
   a. If output_format is "executive-summary":
      Write a single coherent report of max_words words covering the topic,
      synthesizing all sources, citing them by label.
   b. If output_format is "annotated-bibliography":
      For each source, write: label, URL, 150-word annotation, key claims.
   c. If output_format is "competitive-matrix":
      Build a Markdown table where rows are competitors/solutions and columns
      are evaluation criteria extracted from the topic.
4. Save the final report to /workspace/$PROJECT/outputs/research/report-YYYY-MM-DD.md.
5. Upload the report and raw source files (zipped) to S3.
6. Post to Discord webhook $DISCORD_WEBHOOK_ZO:
   {"content": "[DONE] Research synthesis complete on topic: <topic>.
    Report: <s3_url>. Sources processed: $COUNT"}

Do not fabricate sources or statistics. If a URL is inaccessible, note it in the report
and skip it.
```

**Expected outputs**:
- Per-source raw text files
- Final synthesized report as Markdown on S3
- Discord notification

---

### 4.6 Scheduled Cron Jobs

**Purpose**: Configure Zo to run recurring maintenance tasks on a schedule. The two most
common patterns are daily backups and weekly digests.

#### Daily Backup Job

**Prompt scaffold (set to fire daily at 02:00 UTC)**:

```
You are running the nightly backup job for $PROJECT.

Steps:
1. Clone or pull the latest $REPO_URL into /workspace/$PROJECT/backup-staging/.
2. Export the Convex database to JSON:
   npx convex export --format json --output /workspace/$PROJECT/backup-staging/db-export.json
   (Skip this step if the project does not use Convex.)
3. Create a backup archive:
   tar -czf /workspace/$PROJECT/outputs/backup-YYYY-MM-DD.tar.gz \
     /workspace/$PROJECT/backup-staging/
4. Upload to S3 at $PROJECT/backups/YYYY/MM/DD/backup-YYYY-MM-DD.tar.gz.
5. Delete archives older than 90 days from the S3 prefix $PROJECT/backups/.
6. Post to Discord webhook $DISCORD_WEBHOOK_ZO:
   {"content": "[DONE] Nightly backup complete. Size: <file_size>MB. Retained: <count> archives."}
```

#### Weekly Digest Assembly Job

**Prompt scaffold (set to fire every Sunday at 06:00 UTC)**:

```
You are assembling the weekly digest for $PROJECT for the week ending YYYY-MM-DD.

Steps:
1. Use the GitHub API (GITHUB_TOKEN) to fetch:
   a. All PRs merged this week in $REPO_URL.
   b. All Issues closed this week.
   c. New GitHub stars (if accessible via API).
2. Read the Sentry weekly summary from /workspace/$PROJECT/inputs/sentry-weekly.json
   (this file is written by a Pokee job that runs before this one).
3. Compile a weekly digest document at /workspace/$PROJECT/outputs/digest-YYYY-MM-DD.md:
   - Section 1: What shipped (merged PRs with titles and links)
   - Section 2: What was fixed (closed issues)
   - Section 3: Top errors (from Sentry data)
   - Section 4: Numbers (stars, open issues, open PRs)
4. Post the digest file to Discord webhook $DISCORD_WEBHOOK_ZO as a file attachment.
5. Save to S3 at $PROJECT/digests/YYYY/MM/digest-YYYY-MM-DD.md.
```

---

## 5. Handoff Patterns

### Zo → Pokee → Discord

The most common handoff: Zo completes a job, posts to a Convex HTTP endpoint or Discord
webhook, Pokee picks up the event and fans it out to other channels or agents.

```
Zo finishes job
  → POST to DISCORD_WEBHOOK_ZO with structured JSON
  → Pokee workflow listens on #agent-zo channel
  → Pokee cross-posts summary to #summary
  → If artifacts were produced, Pokee posts download link to relevant Slack/Discord thread
```

### Zo → Convex webhook → Cursor Cloud

When Zo produces code changes and a Cursor Cloud agent needs to continue:

```
Zo pushes a branch
  → GitHub webhook fires → Pokee receives it
  → Pokee posts label "zo-handoff" on the PR
  → Cursor Cloud agent monitors for that label and picks up the PR for review
```

### Zo → Human approval → Twin

When Zo produces an artifact that requires human sign-off before a GUI action:

```
Zo completes asset batch
  → Posts to #approvals: "[APPROVAL] Asset batch ready. Review at <url>. 
     Reply 'approve' to trigger Twin submission."
  → Human reviews and replies
  → Pokee detects the reply and triggers the Twin.so session
```

---

## 6. Cost and Quota Considerations

- **Zo compute time**: Zo bills by the minute of active execution. Overnight jobs of
  8–12 hours can accumulate significant cost. Set a monthly cap in Zo billing settings.
- **Model API calls**: Whisper, Claude, and image generation are billed per call.
  For large batches, estimate cost before running: `input_count × cost_per_call`.
- **S3 storage**: Standard S3 storage is inexpensive, but pre-signed URL generation and
  data transfer have costs. Set a lifecycle policy to expire artifacts older than 90 days.
- **GitHub API rate limits**: Authenticated requests allow 5,000/hour. A large code
  sweep that opens many PRs or fetches many issues can approach this limit.
- **Replicate cold starts**: First job of the day may wait for model warm-up (30–120s).
  Schedule batch jobs to start 5 minutes after any warm-up window.

---

## 7. Security

### API Key Management

- All API keys are stored in Zo's encrypted key vault (Settings → API Keys).
- Keys are referenced by name in prompts, never pasted as values.
- Keys are scoped to minimum required permissions:
  - `GITHUB_TOKEN`: repo scope only, not admin or org.
  - AWS keys: S3 PutObject + GetObject on the specific bucket prefix only.
  - Model API keys: no billing management permissions if the API allows scoping.

### Workspace Isolation

- Each project has its own workspace directory `/workspace/$PROJECT/`.
- If you run multiple projects in the same Zo account, use separate workspaces.
- Never store credentials as files in the workspace — they would persist across jobs
  and could be read by future prompt executions.

### Audit Log

- Zo maintains an execution log of every job: start time, prompt hash, model calls made,
  files written, external API calls, and end time.
- Download the audit log periodically and store in your repo at
  `agent-playbooks/audit-logs/zo-YYYY-MM.json`.
- Review the log after any unexpected behavior.

---

## 8. Troubleshooting

### Job times out without completing

**Symptom**: Zo posts no completion message; the job appears to have stopped.
**Cause**: Job exceeded Zo's maximum session length, or a subprocess hung.
**Fix**:
1. Check Zo execution logs for the last line of output before the timeout.
2. Add explicit timeout wrappers to long subprocesses:
   `timeout 3600 npm run build` instead of `npm run build`.
3. Break the job into smaller chunks; use the workspace to checkpoint progress.

### API key rejected mid-job

**Symptom**: Error mid-job like `401 Unauthorized` from a model API.
**Cause**: Key was rotated on the external service but not updated in Zo.
**Fix**:
1. Rotate the key in the external service.
2. Update in Zo Settings → API Keys.
3. Re-run the job from the checkpoint (use workspace files to skip completed steps).

### Workspace disk full

**Symptom**: `No space left on device` errors in Zo logs.
**Cause**: Previous jobs left large files in the workspace.
**Fix**:
1. In Zo, open a session and run `du -sh /workspace/$PROJECT/outputs/*` to find large files.
2. Delete or archive (upload to S3 then delete) files no longer needed.
3. Add a cleanup step at the end of every job template that deletes intermediate files.

### GitHub PR creation fails

**Symptom**: Zo reports success but no PR appears on GitHub.
**Cause**: `GITHUB_TOKEN` lacks `write:pull_request` scope, or the branch name conflicts.
**Fix**:
1. Check the token scopes: `curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/rate_limit`.
2. Regenerate the token with `repo` scope in GitHub Settings → Developer Settings.
3. If branch already exists, add logic to delete and recreate: `git push origin --delete zo/branch-name`.

### Discord webhook posts fail silently

**Symptom**: Job completes but nothing appears in `#agent-zo`.
**Cause**: Webhook URL was deleted or the Discord channel was renamed.
**Fix**:
1. Test the webhook manually: `curl -X POST $DISCORD_WEBHOOK_ZO -H "Content-Type: application/json" -d '{"content":"test"}'`.
2. If it returns a 404, regenerate the webhook in Discord channel settings.
3. Update `DISCORD_WEBHOOK_ZO` in Zo API Keys.

---

*End of ZO_PLAYBOOK.md*

# Zo Computer — Tempo Flow Setup & Usage Guide

## 1. What Zo Computer Is

Zo Computer is a persistent personal AI cloud computer that runs inside a managed cloud environment accessible via `zo.computer`. Unlike ephemeral CI runners or stateless serverless functions, Zo maintains a persistent workspace across sessions — files written in one job are available to the next. It can execute long-running tasks that would time out in a standard GitHub Action or Cursor Cloud agent: overnight error sweeps, large-batch asset generation, audio/video transcription pipelines, release bundling, and open-source model R&D. Zo connects to external APIs (GitHub, OpenRouter, Convex HTTP actions, S3-compatible storage) and can open pull requests, write to Convex tables via webhook, and post status messages to Discord. For Tempo Flow, Zo fills the role of the "heavy compute" executor in the agent spine: any job that takes more than a few minutes, consumes significant GPU/CPU, or produces large binary artifacts belongs here rather than in Cursor Cloud or Twin.

---

## 2. First-Time Account Setup

### 2.1 Create Account

1. Navigate to `https://zo.computer` and sign up with the GitHub account that owns the Tempo Flow repository (`amitlevin65@protonmail.com` or your GitHub login).
2. Verify your email address via the confirmation link Zo sends.
3. Choose the workspace tier that covers persistent disk and GPU access. At minimum, select the plan that offers at least 50 GB persistent storage and access to GPU nodes (needed for transcription and avatar R&D in Phase 2).

### 2.2 Connect GitHub

1. In Zo's dashboard, open **Settings → Integrations → GitHub**.
2. Click **Authorize** and grant access to the `tempoflow` repository (and the org if you have one).
3. Confirm that Zo can create branches and open pull requests on `tempoflow`.
4. Copy the Zo GitHub App installation ID — you will reference it in GitHub Actions if you want Zo to receive job triggers via `workflow_dispatch`.

### 2.3 Set Up Workspace

1. In the Zo dashboard, click **New Workspace** and name it `tempo-flow`.
2. Select the region closest to your Convex deployment (US East if using Convex's default region).
3. Enable **Persistent Disk** and allocate at least 50 GB.
4. Enable **GPU Node** access for transcription and avatar workloads. You can leave this off by default and enable it per-job to reduce cost.
5. Set the workspace timezone to `UTC` for consistent cron alignment with Pokee and Discord.

### 2.4 Add OpenRouter API Key

1. Log in to `openrouter.ai`, navigate to **Keys**, and create a key named `zo-tempo-flow` with a monthly budget cap (see Section 7 for budget guidance).
2. In Zo's dashboard, open **Settings → Environment Variables** and add:
   ```
   OPENROUTER_API_KEY=<your-key>
   OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
   ```
3. For Tempo Flow's default models, add:
   ```
   TEMPO_AI_PRIMARY=google/gemma-4-26b-it
   TEMPO_AI_SECONDARY=mistralai/mistral-small-4
   ```

### 2.5 Add Convex Credentials

Zo needs to write to Convex `agent_artifacts` and read from `agent_tasks` to participate in the agent spine.

1. In your Convex dashboard, create a server-side API key (or use a Convex HTTP action with HMAC signing — see `AGENT_SETUP/agent_handoff_map.md` Section 10 for the signing pattern).
2. In Zo environment variables, add:
   ```
   CONVEX_URL=https://<your-deployment>.convex.cloud
   CONVEX_DEPLOY_KEY=<server-key>
   TEMPO_ZO_HMAC_SECRET=<shared-secret-with-convex>
   ```

### 2.6 Add Discord Webhook

1. In your Tempo Flow Discord server, open **#agent-zo → Edit Channel → Integrations → Webhooks → New Webhook**.
2. Copy the webhook URL.
3. In Zo environment variables, add:
   ```
   DISCORD_ZO_WEBHOOK=<webhook-url>
   DISCORD_BLOCKED_WEBHOOK=<#blocked-channel-webhook-url>
   ```

### 2.7 Configure Default LLM Routing

In Zo's **LLM Router** settings (if the workspace plan includes it), set:

- **Default model**: `google/gemma-4-26b-it` via OpenRouter
- **Fallback model**: `mistralai/mistral-small-4` via OpenRouter
- **Long-context override**: `anthropic/claude-3-5-sonnet` (for repo-wide sweeps that exceed 32k tokens — add key if needed)
- **Transcription**: Whisper via OpenRouter or a self-hosted Whisper endpoint if GPU node is enabled

---

## 3. Tempo Flow Workspace Structure

The following folder layout should be created inside the `tempo-flow` Zo workspace. Create these directories on first run; they persist across sessions.

```
/tempo-flow/
├── artifacts/          # Packaged release binaries, APKs, IPAs, OTA bundles
│   └── <version>/      # One subdirectory per release tag, e.g. v1.0.0/
├── assets/             # Generated images: App Store screenshots, social cards, illustrations
│   ├── appstore/       # Device-framed screenshots per locale
│   ├── social/         # Release announcement cards (1200x630 OG, 1080x1080 IG square)
│   └── in-app/         # Empty-state illustrations, onboarding graphics
├── transcripts/        # Raw and processed transcripts from vlog pipeline
│   ├── raw/            # Whisper output JSON
│   └── processed/      # Tweet threads, newsletter drafts, blog posts
└── logs/               # Job run logs (one file per run, named by timestamp + job type)
    └── YYYY-MM-DD_HH-MM-SS_<job-type>.log
```

**Retention policy**: Keep `artifacts/` indefinitely. Rotate `logs/` older than 90 days. Keep `transcripts/` for 1 year. Keep `assets/` until superseded by a new release's assets.

---

## 4. Standard Job Templates

Each template below is a self-contained prompt to paste into Zo's job runner, or to trigger programmatically via Zo's API. Substitute `{{variable}}` placeholders at call time.

---

### 4.1 Overnight TypeScript / Convex Error Sweep

**Purpose**: Run nightly against the `main` branch. Read all TypeScript and Convex files, identify type errors, linting violations, and trivial runtime issues, patch them automatically, and open a pull request.

**Schedule**: Daily at 02:00 UTC (configure in Zo's scheduler or via GitHub Actions `workflow_dispatch`).

**Prompt template**:

```
You are a TypeScript and Convex expert running an automated overnight error sweep on the Tempo Flow repository.

Repository: {{GITHUB_REPO}} (e.g. amitlevin/tempoflow)
Branch to read: main
New branch name: zo/nightly-fix-{{YYYY-MM-DD}}

Steps:
1. Clone or pull the latest main branch into the Zo workspace at /tempo-flow/sweep/.
2. Run `npx tsc --noEmit` from the repo root and capture all errors.
3. Run `npx eslint . --ext .ts,.tsx --max-warnings 0` and capture all warnings and errors.
4. Run `npx convex dev --typecheck-only` (or equivalent) to catch Convex schema drift.
5. For each error or warning:
   a. If it is a straightforward type annotation, missing import, unused variable, or trivial null-check issue, patch the file directly.
   b. If it requires architectural judgment (e.g. breaking API change, schema migration), skip it and add it to a list called DEFERRED_ISSUES.
6. After patching, re-run tsc and eslint to verify zero new errors were introduced.
7. Commit all patches with message: "chore(zo): nightly TS/Convex error sweep {{YYYY-MM-DD}}"
8. Push the branch and open a pull request titled "Nightly sweep {{YYYY-MM-DD}} — N fixes, M deferred".
9. In the PR body, list every file changed with a one-line explanation, then list DEFERRED_ISSUES.
10. Post to Discord #agent-zo webhook:
    "Nightly sweep complete. PR: <url>. Fixed: N. Deferred: M."
11. Write a log entry to /tempo-flow/logs/{{YYYY-MM-DD_HH-MM-SS}}_nightly-sweep.log.
12. Write a row to Convex agent_runs via HTTP action POST /agent/log with fields:
    { agent: "zo", job: "nightly-sweep", status: "complete", pr_url: "<url>", timestamp: <iso> }

If any step fails, post to Discord #blocked:
"Zo nightly sweep FAILED at step <N>: <error>. Log: /tempo-flow/logs/<filename>"
```

**Environment variables required**: `GITHUB_TOKEN`, `OPENROUTER_API_KEY`, `DISCORD_ZO_WEBHOOK`, `DISCORD_BLOCKED_WEBHOOK`, `CONVEX_URL`, `CONVEX_DEPLOY_KEY`

---

### 4.2 Asset Batch Generation

**Purpose**: Generate App Store screenshots (all required device sizes), social announcement cards for releases, and in-app empty-state illustrations using an AI image generation API.

**Trigger**: Manual (Amit runs this before each App Store submission) or triggered by Pokee when a release tag is published.

**Device sizes required by App Store Connect (as of 2025)**:
- iPhone 6.9" (1320x2868), iPhone 6.7" (1290x2796), iPhone 5.5" (1242x2208)
- iPad Pro 13" (2064x2752), iPad Pro 12.9" (2048x2732)

**Google Play required sizes**:
- Phone: 1080x1920, Tablet: 1600x2560

**Prompt template**:

```
You are an asset generation agent for Tempo Flow, an AI daily planner app for neurodivergent users.

Job: Generate all required App Store and Google Play screenshots plus social cards for release {{RELEASE_TAG}}.

Brand context:
- App name: Tempo Flow
- Tagline: "Your day, without the overwhelm."
- Color palette: Deep indigo (#3D2785), warm white (#FAFAF8), accent coral (#FF6B5B)
- Typography: Clean, rounded sans-serif. No sharp corners.
- Tone: Calm, supportive, empowering. Never clinical.
- Target user: Neurodivergent adults (ADHD, autism, anxiety).

Screenshot scenes to generate (one composition per scene):
1. Home screen — today's schedule with soft gradient, minimal task list
2. AI planning assistant — chat interface showing a calming, supportive AI message
3. Focus mode — single task view, progress ring, ambient timer
4. Weekly overview — gentle calendar grid, no overwhelming density
5. Onboarding — "Tell me about your day" prompt screen

For each scene:
1. Generate the base illustration at 1242x2208 (iPhone 5.5" base).
2. Upscale/reframe to each required device size listed above using content-aware fill.
3. Composite the actual app UI wireframe overlay (provided at /tempo-flow/assets/ui-frames/{{RELEASE_TAG}}/) on top of the illustration.
4. Add a caption bar at the bottom with scene title in the Tempo brand font.
5. Save outputs to /tempo-flow/assets/appstore/{{RELEASE_TAG}}/<device>/<scene-number>.png

Social cards:
- Generate 5 variants of a 1200x630 release announcement card using the scene 1 artwork.
- Generate 5 variants of a 1080x1080 square card for Instagram.
- Save to /tempo-flow/assets/social/{{RELEASE_TAG}}/

In-app illustrations (if flag GENERATE_ILLUSTRATIONS=true):
- Empty task list state: A small illustrated character sitting on a clean desk, looking content.
- No notifications state: Peaceful scene, plant on windowsill.
- Onboarding welcome: Warm sunrise over a minimal city.
- Save to /tempo-flow/assets/in-app/{{RELEASE_TAG}}/

After all assets are saved:
1. Write a manifest JSON to /tempo-flow/assets/{{RELEASE_TAG}}_manifest.json listing every file path and its dimensions.
2. Write a row to Convex agent_artifacts:
   { agent: "zo", type: "assets", release: "{{RELEASE_TAG}}", manifest_path: "...", timestamp: <iso> }
3. Post to Discord #agent-zo:
   "Asset batch generation complete for {{RELEASE_TAG}}. Files: N. Manifest: /tempo-flow/assets/{{RELEASE_TAG}}_manifest.json"
```

**Environment variables required**: `IMAGE_GEN_API_KEY` (Stability AI, DALL-E, or Flux via OpenRouter), `DISCORD_ZO_WEBHOOK`, `CONVEX_URL`, `CONVEX_DEPLOY_KEY`

---

### 4.3 Vlog Transcription Pipeline

**Purpose**: Accept an MP3 or MP4 file from Amit's vlog, transcribe it with Whisper, then generate a tweet thread, newsletter draft, and blog post from the transcript.

**Trigger**: Manual upload to `/tempo-flow/transcripts/raw/` in the Zo workspace, or Pokee triggers this job when a new YouTube upload is detected.

**Prompt template**:

```
You are a content repurposing agent for Tempo Flow's founder vlog.

Input file: {{INPUT_FILE_PATH}} (MP3 or MP4)
Video title: {{VIDEO_TITLE}}
Video date: {{VIDEO_DATE}}
YouTube URL (if already published): {{YOUTUBE_URL}}

Step 1 — Transcription:
1. Run Whisper on {{INPUT_FILE_PATH}} with model=large-v3, language=en.
2. Save raw transcript JSON to /tempo-flow/transcripts/raw/{{SLUG}}.json
3. Save clean plaintext transcript (no timestamps) to /tempo-flow/transcripts/raw/{{SLUG}}.txt

Step 2 — Tweet thread:
1. Read the clean transcript.
2. Identify the 8–12 most shareable insights, observations, or updates.
3. Write a tweet thread:
   - Tweet 1: Hook (max 240 chars). Must not start with "I". Start with the most surprising or emotionally resonant point.
   - Tweets 2–N: One idea per tweet, max 240 chars each.
   - Final tweet: CTA — "Full vlog: {{YOUTUBE_URL}} | Try Tempo Flow free: https://tempoflow.app"
4. Save to /tempo-flow/transcripts/processed/{{SLUG}}_thread.txt

Step 3 — Newsletter draft:
1. Write a ~600-word newsletter section titled "Founder update — {{VIDEO_DATE}}".
2. Tone: personal, candid, behind-the-scenes. Amit speaks directly to early adopters.
3. Include 3 key takeaways in bullet form.
4. End with a CTA to try Tempo Flow.
5. Save to /tempo-flow/transcripts/processed/{{SLUG}}_newsletter.md

Step 4 — Blog post:
1. Expand the newsletter draft into a ~1200-word blog post with H2 headers.
2. Add an intro paragraph optimized for search: include "ADHD planner", "neurodivergent productivity", "AI daily planner".
3. Add a conclusion with a soft conversion CTA.
4. Save to /tempo-flow/transcripts/processed/{{SLUG}}_blog.md

After all steps:
1. Write a row to Convex agent_artifacts:
   { agent: "zo", type: "transcript-pipeline", slug: "{{SLUG}}", files: [...], timestamp: <iso> }
2. Post to Discord #agent-zo:
   "Vlog pipeline complete for {{SLUG}}. Thread, newsletter, and blog post saved to /tempo-flow/transcripts/processed/"
3. Post artifact notification to Pokee via the handoff pattern (see Section 5) so Pokee can cross-post the thread.
```

**Environment variables required**: `WHISPER_MODEL_PATH` or OpenRouter Whisper endpoint, `OPENROUTER_API_KEY`, `DISCORD_ZO_WEBHOOK`, `CONVEX_URL`, `CONVEX_DEPLOY_KEY`, `POKEE_HANDOFF_WEBHOOK`

---

### 4.4 Release Artifact Bundling

**Purpose**: After a GitHub release tag is published, pull all release assets (JS bundles, OTA update payloads, APK/IPA if EAS Build outputs them), package them, and store them in `/tempo-flow/artifacts/<version>/`.

**Trigger**: Pokee webhook when GitHub release is published (event: `release.published`).

**Prompt template**:

```
You are a release artifact bundler for Tempo Flow.

Release tag: {{RELEASE_TAG}}
GitHub repo: {{GITHUB_REPO}}
EAS Build profile: production

Steps:
1. Use the GitHub API to fetch the release object for {{RELEASE_TAG}} and list all attached assets.
2. Download each asset to /tempo-flow/artifacts/{{RELEASE_TAG}}/:
   - .ipa file (iOS, from EAS Build artifacts if linked in release notes)
   - .aab file (Android, same)
   - expo-updates OTA bundle (if present)
   - CHANGELOG.md excerpt for this version
3. Generate a SHA256 checksum file: /tempo-flow/artifacts/{{RELEASE_TAG}}/checksums.sha256
4. Create a bundle manifest JSON: /tempo-flow/artifacts/{{RELEASE_TAG}}/manifest.json
   {
     "release": "{{RELEASE_TAG}}",
     "bundled_at": "<iso-timestamp>",
     "assets": [
       { "filename": "...", "size_bytes": ..., "sha256": "..." }
     ]
   }
5. Write a row to Convex agent_artifacts:
   { agent: "zo", type: "release-bundle", release: "{{RELEASE_TAG}}", manifest_path: "...", timestamp: <iso> }
6. Post to Discord #agent-zo:
   "Release bundle complete for {{RELEASE_TAG}}. N assets archived. Checksums verified."
7. Trigger Pokee handoff (see Section 5) to announce the release.

On error (asset download fails, checksum mismatch):
Post to Discord #blocked:
"Zo release bundler FAILED for {{RELEASE_TAG}}: <error>. Manual intervention required."
```

**Environment variables required**: `GITHUB_TOKEN`, `DISCORD_ZO_WEBHOOK`, `DISCORD_BLOCKED_WEBHOOK`, `CONVEX_URL`, `CONVEX_DEPLOY_KEY`, `POKEE_HANDOFF_WEBHOOK`

---

### 4.5 Avatar R&D (Phase 2 Onwards)

**Purpose**: Experimental. Evaluate open-source VTuber pipelines, lip-sync models, and character rigging tools for a potential Tempo Flow animated assistant avatar.

**Trigger**: Manual only. This is a research job, not production automation.

**Prompt template**:

```
You are an AI research assistant evaluating open-source avatar and lip-sync pipelines for Tempo Flow's Phase 2 animated assistant feature.

Research objectives:
1. Survey current open-source VTuber frameworks (VTube Studio protocol, Live2D Cubism SDK free tier, Ready Player Me, Avaturn, Metahuman).
2. Evaluate lip-sync models compatible with React Native / Expo:
   - Rhubarb Lip Sync
   - wav2lip (GPU required)
   - SadTalker
3. Evaluate character rigging options compatible with React Native Skia or Three.js via Expo:
   - Spine2D runtime
   - Lottie-based rigs
   - Three.js GLTF with morph targets
4. For each evaluated option, produce a scorecard:
   - License (commercial use allowed?)
   - Integration complexity (1–5)
   - Runtime performance on mobile (estimate)
   - Bundle size impact
   - Quality of lip sync output
5. Generate a 30-second test animation using the top-scored pipeline with a placeholder character saying:
   "Hi, I'm Tempo. Let's plan your day."
6. Save the test output to /tempo-flow/assets/avatar-rd/{{DATE}}/
7. Write a report to /tempo-flow/logs/{{DATE}}_avatar-rd.md summarizing findings and a recommended path forward.
8. Post to Discord #agent-zo:
   "Avatar R&D complete. Report: /tempo-flow/logs/{{DATE}}_avatar-rd.md"
```

**Environment variables required**: `OPENROUTER_API_KEY`, `DISCORD_ZO_WEBHOOK`, GPU node enabled for wav2lip / SadTalker

---

## 5. Handoff Patterns

### 5.1 Zo Produces an Artifact → Convex → Pokee → Discord / Social

When any Zo job completes successfully and produces an artifact (asset bundle, transcript, release package), it follows this sequence:

1. **Zo writes to Convex** via an HTTP POST to the Convex HTTP action at `/internal/agent/artifact`:
   ```json
   {
     "agent": "zo",
     "job_type": "release-bundle | assets | transcript-pipeline | nightly-sweep",
     "release": "v1.0.0",
     "artifact_path": "/tempo-flow/artifacts/v1.0.0/",
     "manifest_url": "https://zo.computer/workspace/tempo-flow/artifacts/v1.0.0/manifest.json",
     "timestamp": "2026-04-17T02:45:00Z",
     "hmac_signature": "<computed-with-TEMPO_ZO_HMAC_SECRET>"
   }
   ```
   The Convex action validates the HMAC, writes a row to `agent_artifacts`, and fires a database trigger.

2. **Convex triggers Pokee** via a webhook configured in `convex/http.ts`. The webhook payload includes the artifact type and metadata.

3. **Pokee routes the notification**:
   - If `job_type == "release-bundle"`: Pokee cross-posts the release announcement to all social channels (see `pokee_setup.md` Section 4.1).
   - If `job_type == "transcript-pipeline"`: Pokee posts the tweet thread and schedules the newsletter send.
   - If `job_type == "assets"`: Pokee posts a preview to Discord #agent-zo only (no public cross-post until Amit approves).
   - If `job_type == "nightly-sweep"`: Pokee posts the PR link to Discord #agent-cursor for Cursor Cloud review.

### 5.2 Zo Finishes a Long Job → Discord → Blocked if Needed

Every Zo job posts its completion status to Discord #agent-zo via the `DISCORD_ZO_WEBHOOK`. Message format:

```
[ZO] Job: <job-type> | Status: <complete|failed|partial> | Duration: <HH:MM:SS>
Details: <one-line summary>
<optional PR URL or artifact path>
```

If a job is **blocked** (awaiting a human decision, credential expired, disk full, etc.):

1. Zo posts to Discord #blocked:
   ```
   [ZO BLOCKED] Job: <job-type> | Reason: <description>
   Action needed: <specific instruction for Amit>
   Session URL: <zo.computer/workspace/tempo-flow/jobs/<job-id>>
   ```
2. After 2 hours with no Discord reaction from Amit, Zo calls the Twilio SMS webhook (configured in `TWILIO_SMS_WEBHOOK` env var) to send an SMS:
   ```
   Zo blocked on <job-type>. Action needed: <description>. Discord: #blocked
   ```
3. After 24 hours still blocked, Zo cancels the job and logs the cancellation to `agent_runs` with `status: "cancelled-timeout"`.

---

## 6. Troubleshooting

### Timeout on Very Long Jobs

**Symptom**: Job disappears or shows "timed out" in Zo's dashboard after 1–2 hours.

**Cause**: Zo has a default job timeout. Long transcription or asset generation jobs can exceed it.

**Fix**:
1. In Zo's job runner settings, increase the timeout for the `tempo-flow` workspace to 6 hours (or the maximum allowed by your plan).
2. Break large batch jobs into smaller sub-jobs. For example, generate screenshots per device size rather than all at once.
3. Use Zo's checkpoint/resume feature if available: save intermediate state to `/tempo-flow/logs/<job-id>_checkpoint.json` and resume from that checkpoint if the job is restarted.

### API Key Rotation

**Symptom**: Job fails with `401 Unauthorized` or `403 Forbidden` from OpenRouter or GitHub.

**Cause**: API key expired, rotated, or budget cap hit.

**Fix**:
1. Go to Zo dashboard → **Settings → Environment Variables**.
2. Update the relevant key.
3. Re-run the failed job. Zo does not automatically retry on 401.
4. For OpenRouter budget caps: log in to `openrouter.ai`, navigate to **Keys → zo-tempo-flow**, and increase the monthly cap or reset the budget period.
5. Set a calendar reminder to rotate all keys quarterly.

### Workspace Disk Full

**Symptom**: Job fails with "No space left on device" or similar.

**Cause**: `/tempo-flow/artifacts/` or `/tempo-flow/assets/` has accumulated too many large files.

**Fix**:
1. SSH into the Zo workspace (if supported) or use Zo's file manager.
2. Delete old release artifacts beyond the current + previous two versions.
3. Compress transcript files older than 3 months: `tar -czf transcripts-archive-<date>.tar.gz /tempo-flow/transcripts/raw/<year>/`
4. Move large archives to external S3-compatible storage (add `AWS_S3_BUCKET` and `AWS_ACCESS_KEY_ID` to env vars and update job templates to upload to S3 before deleting local copies).

### Convex Write Failures

**Symptom**: Job completes but no row appears in `agent_artifacts` or `agent_runs`.

**Cause**: HMAC signature mismatch, Convex deployment URL changed, or `CONVEX_DEPLOY_KEY` expired.

**Fix**:
1. Verify `CONVEX_URL` matches the active Convex deployment in your Convex dashboard.
2. Re-generate the `CONVEX_DEPLOY_KEY` and update it in Zo's environment variables.
3. Verify the HMAC secret matches between Zo (`TEMPO_ZO_HMAC_SECRET`) and the Convex HTTP action handler.
4. Test with a manual `curl` from Zo's terminal:
   ```bash
   curl -X POST $CONVEX_URL/internal/agent/artifact \
     -H "Content-Type: application/json" \
     -H "X-Hmac-Signature: <test-sig>" \
     -d '{"agent":"zo","job_type":"test","timestamp":"2026-04-17T00:00:00Z"}'
   ```

### Discord Webhook Failures

**Symptom**: Job completes but no message appears in Discord.

**Cause**: Webhook URL invalidated (Discord deletes webhooks if the channel is deleted or the webhook is manually removed).

**Fix**:
1. Regenerate the webhook in Discord: **#agent-zo → Edit Channel → Integrations → Webhooks**.
2. Update `DISCORD_ZO_WEBHOOK` in Zo environment variables.

---

## 7. Cost Considerations

### Estimated Monthly Budget

| Cost category | Estimated monthly cost (USD) |
|---|---|
| Zo workspace plan (persistent disk + compute) | $30–$80 depending on tier |
| GPU node usage (transcription, avatar R&D) | $10–$50 depending on hours |
| OpenRouter API calls (Gemma 4 26B sweeps) | $5–$20 depending on repo size |
| Image generation API (asset batch) | $10–$30 per release |
| GitHub API | Free (within rate limits) |
| **Total estimated** | **$55–$180/month** |

### When to Pause the Workspace

- Between major development phases (e.g., after v1.0 launch, before v1.1 sprint starts), pause the Zo workspace in the dashboard to stop compute billing.
- Keep persistent disk active even when paused — disk billing is minimal and losing the `/tempo-flow/` directory structure would require manual re-setup.
- Resume the workspace 24 hours before a planned nightly sweep or asset generation job to ensure the environment is warm.

### When to Upgrade the Plan

- If nightly sweeps consistently time out: upgrade to a plan with longer job timeout limits.
- If asset generation jobs are slow: add a dedicated GPU node rather than upgrading the base plan.
- If disk is consistently near capacity: add a storage expansion add-on rather than moving to a higher tier.

### Cost Alerts

Configure Zo's spending alerts (if available) to notify via email when monthly spend exceeds $100. Cross-reference with OpenRouter's budget cap on the `zo-tempo-flow` key to prevent runaway API spending from a runaway sweep job.

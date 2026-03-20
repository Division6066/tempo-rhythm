# TEMPO — Project Status Report

**Date:** March 20, 2026
**Architecture:** pnpm monorepo — Web (Vite+React), API (Express+PostgreSQL), Mobile (Expo), Marketing (Vite)

---

## WHAT HAS BEEN DONE (Complete)

### Infrastructure & Auth
- Monorepo setup with pnpm workspaces, Turborepo build orchestration
- PostgreSQL database with Drizzle ORM (20+ tables: tasks, notes, memories, folders, projects, tags, calendar_events, daily_plans, note_links, note_templates, staged_suggestions, ai_action_log, saved_filters, preferences, conversations, messages, push_subscriptions, password_reset_tokens, plugins, task_sub_items, search_embeddings)
- Convex backend for mobile app (auth, chat messages, data export)
- Express REST API on port 8080 with OpenAPI 3.0 spec + Orval codegen (React Query hooks, Zod validators)
- Token-based auth (login, signup, logout, session)
- Forgot/reset password flow with DB-backed tokens (1hr expiry, single-use)
- VAPID-based web push notifications + Expo push notifications
- 5 cron jobs (morning briefing, streak guardian, overdue escalator, weekly review, inbox nudge)
- Compression middleware, CORS, static file serving for uploads
- GitHub integration connected (Division6066/tempo-rhythm)

### Web App (artifacts/tempo) — 30+ pages
- **Dashboard:** AI Top-3 priority selection, daily summary bar (due today, overdue, events), streak counter with flame icon, progress ring with color transitions, inline quick-add
- **Today View:** Drag-to-reorder via @dnd-kit, overdue section with warning, inline add per priority section, filter chips (tags + projects), context menu (edit, move, delete)
- **Inbox:** Task list with move-to-today, AI prioritize button, reset to manual order
- **Calendar:** Month/Week views with react-big-calendar + drag-and-drop, Day view with hour-by-hour timeline (06:00-24:00, 80px/hour), current time indicator, mini-month picker, task sidebar for drag-to-timeline, event resize (15-min snap), click-to-create tasks or events
- **Notes:** List/Kanban/Table views with drag-and-drop, folder-based Kanban columns, sortable table with word count, empty state with CTA, archive toggle
- **Note Editor:** Split-pane (raw markdown + live preview) with resizable panels, full toolbar (H1-H3, bold, italic, strikethrough, code, blockquote, lists, table, link, wiki-link, voice), keyboard shortcuts, auto-save with debounce + status indicator, word count + reading time, [[wiki-link]] autocomplete, #tag autocomplete, collapsible headings in preview, backlinks panel with context snippets, note rename with reference sync, AI text actions (rewrite, summarize, simplify, ADHD-friendly, expand, translate), archive, save as template, file attachments (upload/list/delete), Classic/Rich Editor toggle (Milkdown)
- **Period Notes:** Daily/Weekly/Monthly/Quarterly/Yearly tabs, date navigator with period-appropriate pickers, auto-generation with templates, upcoming tasks section, inline task completion
- **Projects:** List/Kanban/Table views, drag-to-reorder, status-based Kanban (active/archived), task counts, progress percentage
- **Folders:** Detail page showing projects as cards, drag-to-reorder
- **Sidebar:** Collapsible folder tree, DnD reordering, context menus (rename/delete), add folder/project buttons
- **AI Daily Plan:** Pre-generation energy form (Low/Medium/High + context), per-block rationale, drag-to-reorder blocks, inline edit (time, title, duration, task swap), mood log after accept (5 emojis)
- **AI Extract:** Textarea for freeform text, AI extraction, per-task accept/reject, create accepted tasks. Also available via modal from QuickCapture
- **AI Chat:** Full chat with TTS "Read aloud" on assistant messages
- **AI Co-Pilot:** Auto-categorize suggestions banner, AI priority scoring with circular badge on tasks
- **Search:** Hybrid vector+lexical search, collapsible filter panel (type/status/priority/project/date/tag), saved searches
- **Preferences:** Wake/sleep time, planning style, ADHD mode, focus/break duration, prep buffer, energy peaks grid
- **Settings:** 9 sections (Profile, Appearance, Planning, Calendar, Notifications, AI, Templates, Data & Privacy, App Install). Desktop sidebar nav, mobile chip nav. Auto-save with debounce. Theme selector (dark/light/system). Export, reset memories, delete account. Data import (CSV/JSON/MD). Rebuild search index
- **Memories:** Hot/Warm/Cold tier display with counts, stats dashboard, manual decay button
- **Tags:** Management page
- **Task Detail:** Full detail view
- **Task Filters:** List/Table views with sortable columns, checkboxes
- **Focus Session:** Pomodoro timer page
- **Auth:** Login, Signup, Forgot Password, Reset Password pages
- **Onboarding:** Multi-step setup
- **Published Notes:** Public note sharing
- **PWA:** Manifest, service worker (cache-first assets, network-first API, offline fallback), install prompt (Chrome + iOS), precache manifest from Vite build, loading screen
- **Error Handling:** Per-route ErrorBoundary with "Report Issue" mailto, loading skeletons on all major pages
- **Design:** Anthropic-inspired earth-tone palette (terracotta primary, warm cream light, charcoal dark), Inter typography, semantic CSS tokens, full dark/light/system theme support
- **Performance:** Route-based code splitting (React.lazy), service worker caching, compression

### API Server (artifacts/api-server) — 25+ route files
- Tasks CRUD + reorder + complete + recurring
- Notes CRUD + rename + attachments (upload/delete) + archive
- Folders/Projects CRUD + reorder
- Tags CRUD
- Calendar Events CRUD
- Daily Plans (get/create/update with topThree, reflection, mood)
- Memories CRUD + decay + stats + reset
- AI routes: chat, generate-plan, extract-tasks, auto-categorize, prioritize, rewrite (6 actions + Deep Think)
- Search (hybrid vector+lexical+trigram)
- Import (JSON/Markdown/CSV LorePack format)
- Export (all tables as JSON)
- Templates CRUD
- Saved Filters CRUD
- Note Links (backlinks)
- Staging (AI suggestions)
- Transcription (Whisper)
- TTS (OpenAI text-to-speech)
- Push notifications (subscribe/unsubscribe/VAPID key)
- Auth (login/signup/logout/forgot/reset password)
- Preferences (GET/PUT/PATCH with auth)
- Account deletion
- Health check
- Library status (dev-only: LlamaIndex, LangChain, instructor-js, BullMQ)

### Mobile App (artifacts/tempo-mobile) — 20+ screens
- Tab navigation (Home, Today, Inbox, AI Chat, More)
- Home with animated stats, progress ring, FAB (4 quick actions), pull-to-refresh
- Today with swipe-to-complete/defer, haptic feedback, offline caching
- Inbox with brain dump, offline caching
- AI Chat with Convex-persisted history, memory count indicator
- Calendar with week/month toggle, dot indicators, event detail modal
- Notes list + note editor with Edit/Preview toggle + SimpleMarkdown renderer
- Task detail with subtasks, tags, project/folder assignment
- Project detail with tasks, notes, progress stats
- Folders/Areas management
- Tags management
- Memories viewer (grouped by tier)
- Extract/Brain-dump with AI task extraction
- Search across tasks and notes
- Focus/Pomodoro timer with haptic feedback
- Settings (theme toggle, notifications, profile editing, data export, sign-out)
- Onboarding (4-step guided setup)
- Templates viewer
- Filters
- Daily Plan
- Swipe gestures (SwipeableTaskRow via react-native-gesture-handler)
- Animations (FadeIn/FadeOut, spring scale, animated progress bar)
- Offline support (network detection, data caching, write queue, sync-on-reconnect, AI feature gating)
- Push notifications (Expo push tokens, notification tap navigation)
- Theme system (dark/light following device)
- Error boundary + offline indicator

### Marketing Site (artifacts/tempo-marketing)
- Home, About, Features, Pricing, Login, Signup, Onboarding pages
- Legal pages: Privacy, Terms, Cookies
- Convex Auth integration (login/signup)
- Quick-login test button (beta1@tempo.app)
- Anthropic earth-tone theme with dark/light mode
- Published and deploy-ready

### RAG / Knowledge Base
- Markdown Formatting Guide (20 hot-tier memories imported)
- ADHD Life Coaching Knowledge Base (22 warm-tier memories imported)
- Reproducible import scripts for both

### Libraries Installed & Configured
- Milkdown (rich Markdown editor)
- CodeMirror (code editing)
- unified/remark/rehype (Markdown processing pipeline)
- LlamaIndex (document ingestion/RAG)
- LangChain.js (text splitting, chains)
- instructor-js (structured AI extraction)
- BullMQ (background job queue — needs Redis)
- Turborepo (build orchestration)

---

## WHAT'S PARTIALLY BUILT (Exists but Incomplete)

### Web App
1. **BullMQ job queue** — Installed and configured but not connected to Redis (no REDIS_URL env var set). Worker initialization skipped at startup. Background jobs (email sending, heavy AI processing) can't run.
2. **LlamaIndex RAG pipeline** — Module exists at `api-server/src/lib/llamaindex.ts` but not wired into any production route. No document ingestion endpoint uses it yet.
3. **LangChain text splitting** — Utility at `api-server/src/lib/langchain.ts` exists but not called from any route. No chunking pipeline is active.
4. **instructor-js structured extraction** — Utility exists but guarded by OpenAI API key check. Not integrated into any active route.
5. **Plugins system** — `plugins` table exists in DB schema but no UI, no API routes, no plugin loading mechanism.
6. **Conversations/Messages tables** — Schema exists but no REST API routes for general conversations (chat goes through `/ai/chat`).
7. **Recurring tasks** — `recurrenceMode` column exists on tasks table but no UI to set recurrence rules, no cron job to generate recurring instances.
8. **Task sub-items** — `task_sub_items` table exists, mobile app has subtask UI, but web app TaskDetail may not fully utilize the backend table.
9. **Note attachments backend** — Routes exist for upload/delete, but file storage is local (`./uploads/`) — not cloud-backed. Won't survive redeployment.
10. **Search embeddings** — `search_embeddings` table exists, hybrid search works, but "Rebuild search index" button in Settings may not generate embeddings for all existing content.
11. **AI memory auto-update** — Setting toggle exists in preferences but no automated pipeline observes user behavior and creates memories.
12. **Push notification delivery** — Infrastructure complete (VAPID keys, Expo tokens, service worker) but cron jobs send to "all users" without per-user timezone handling. Morning briefing at 8am server time, not user time.
13. **Calendar recurring events** — `recurrenceRule` column exists on calendar_events but no UI to create recurring events and no expansion logic.
14. **Note frontmatter/backgroundColor** — Columns exist on notes table but no UI to set them.
15. **Data import in Settings** — Upload UI exists but may have issues with large files or edge-case formats.

### Mobile App
1. **Notification preferences** — Toggles exist in Settings (persisted to AsyncStorage) but not synced to API server. No actual notification channel configuration.
2. **Profile editing** — Name editing persisted to AsyncStorage only, not synced to server preferences.
3. **Theme** — Follows device system setting only. No manual dark/light/system selector like web app.
4. **SimpleMarkdown renderer** — Basic support (headers, bold, italic, lists, blockquotes, code) but missing tables, images, links, strikethrough, checkboxes.
5. **Offline queue** — Only handles createTask and updateTask mutations. Other writes (notes, calendar events, memories) are not queued.
6. **Expo package version mismatches** — 23 packages need version updates for compatibility (shown in startup warnings).

### Marketing Site
1. **Pricing page** — Page exists but pricing tiers may be placeholder content.
2. **SEO** — Basic meta tags but no sitemap.xml, robots.txt, or structured data.

---

## WHAT NEEDS TO BE DONE (Known Gaps / Not Started)

### Critical for Production
1. **Production deployment configuration** — Web app builds but isn't deployed/published to Replit hosting yet.
2. **Redis setup for BullMQ** — No Redis instance configured. Background job processing is completely inactive.
3. **Cloud file storage** — Note attachments use local filesystem. Need object storage (S3/Replit Object Storage) for persistence across deploys.
4. **Per-user timezone handling** — Cron jobs assume server timezone. Push notifications fire at server-local times, not user-local times.
5. **Rate limiting** — Only TTS endpoint has rate limiting. All other API routes are unprotected against abuse.
6. **Input sanitization** — Markdown rendering uses rehype-sanitize in some places but not consistently across all preview surfaces.
7. **Database connection pooling** — No explicit connection pool configuration for high-concurrency production use.

### Feature Gaps (Web)
1. **Command Bar (Cmd+K)** — Component file exists (`CommandBar.tsx`) but likely basic. Should provide global search, quick navigation, and action execution.
2. **Real recurring tasks** — No UI to set daily/weekly/monthly recurrence. No task instance generation.
3. **Real recurring calendar events** — Same gap as tasks. `recurrenceRule` column unused.
4. **Plugin system** — Table exists, no implementation. No plugin API, no UI, no marketplace.
5. **Collaborative features** — No multi-user support, no sharing, no team features.
6. **Notification center** — No in-app notification feed/inbox. Only browser push.
7. **Activity/audit log UI** — `ai_action_log` table exists but no user-facing activity feed.
8. **Mobile-responsive polish** — Many pages built desktop-first. Sidebar overlay works but individual page layouts may need mobile testing.
9. **Accessibility (a11y)** — No systematic ARIA labels, keyboard navigation testing, or screen reader optimization.
10. **Internationalization (i18n)** — English only. No translation infrastructure.
11. **Data backup/restore** — Export exists but no import-from-backup flow.
12. **Undo/redo** — No global undo system. Only specific undo (e.g., archive undo toast).

### Feature Gaps (Mobile)
1. **Calendar day view** — Web has full day timeline; mobile only has week/month.
2. **AI Daily Plan generation** — Mobile has a Plan screen but may not match web's full energy-form + drag-reorder + mood-log flow.
3. **Note wiki-links and backlinks** — Web has full [[wiki-link]] autocomplete and backlinks panel; mobile note editor is basic.
4. **AI text actions in notes** — Web has rewrite/summarize/simplify/expand/translate; mobile doesn't.
5. **Kanban/Table views** — Web has list/kanban/table for notes and projects; mobile is list-only.
6. **File attachments** — Web has note attachment upload/delete; mobile doesn't.
7. **Saved searches/filters** — Web has saved filter presets; mobile search is basic text.
8. **Period notes** — Web has daily/weekly/monthly/quarterly/yearly; mobile has basic notes only.
9. **Focus timer sharing** — Timer exists but doesn't log sessions or sync with web app.
10. **Deep linking** — Push notification taps navigate, but no universal link handling for shared URLs.
11. **App Store readiness** — No app icon, splash screen assets, or store listing metadata prepared.
12. **Biometric auth** — No Face ID / fingerprint login.

### Feature Gaps (Marketing)
1. **Blog/content section** — No blog or content marketing pages.
2. **Changelog** — No public changelog or release notes page.
3. **Demo/interactive tour** — No product demo or guided walkthrough.
4. **Analytics** — No tracking (Google Analytics, Plausible, etc.).

### Testing & Quality
1. **End-to-end tests** — No Playwright or Cypress test suite for the web app.
2. **Unit tests** — No Jest/Vitest test files for API routes or components.
3. **API integration tests** — No automated API endpoint testing.
4. **Mobile testing** — No Detox or similar mobile testing framework.
5. **Performance profiling** — No Lighthouse CI, no bundle size monitoring.
6. **Error monitoring** — No Sentry or equivalent error tracking in production.

---

## SUMMARY COUNTS

| Category | Count |
|----------|-------|
| Completed tasks merged | 25+ |
| Web app pages | 30+ |
| Mobile app screens | 20+ |
| API route files | 25+ |
| DB schema tables | 20+ |
| Partially built features | ~15 |
| Missing critical (prod-blocking) | ~7 |
| Missing features (web) | ~12 |
| Missing features (mobile) | ~12 |
| Missing testing/quality | ~6 |

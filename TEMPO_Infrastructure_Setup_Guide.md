# TEMPO — What You Need To Set Up (And What To Give Me)

This document explains **what Convex and Vercel are**, **why TEMPO needs them**, **exactly what you need to do** in each one, and **what to copy back to me** so I can connect everything.

---

## THE BIG PICTURE

Right now, TEMPO runs entirely on Replit:
- The **web app** (your calendar, tasks, notes, AI chat) lives here
- The **database** (PostgreSQL) lives here
- The **API server** (Express) lives here

This works great for development, but for production you want:

| Service | What It Does For TEMPO | Why You Need It |
|---|---|---|
| **Convex** | Replaces your database AND API server with a real-time backend | Instant sync between devices, built-in auth, no server to manage, scales automatically |
| **Vercel** | Hosts your web app and marketing site on the public internet | Fast global CDN, automatic HTTPS, custom domains (like tempo.app) |

Think of it this way:
- **Convex** = your brain (stores all data, runs all logic)
- **Vercel** = your face (what users see and interact with)
- **Replit** = your workshop (where we build everything)

---

## PART 1: CONVEX — YOUR BACKEND

### What Is Convex?

Convex is a cloud database that also runs your server-side code. Instead of having a separate database (PostgreSQL) and a separate API server (Express), Convex combines both into one service. The big advantage: when data changes, every connected device sees it instantly — no refresh needed.

### Why TEMPO Needs It

- **Real-time sync**: Open TEMPO on your phone and laptop — changes appear instantly on both
- **Built-in authentication**: Users can sign up/log in without you managing passwords
- **No server management**: No Express server to crash, no database to back up
- **The code is already written**: I've already created all 15 database tables and all the server functions in `tempo-app/convex/`. I just need the connection credentials to deploy them.

### What You Need To Do

**Step 1: Create an account**
1. Go to **https://dashboard.convex.dev**
2. Click "Sign up" — use your GitHub account (fastest)
3. You're in

**Step 2: Create a project**
1. Click **"Create a project"**
2. Name it **`tempo`**
3. Click Create

**Step 3: Copy two things**

Once your project is created, you need two credentials:

**Credential 1 — Deployment URL:**
1. You should see it on the project dashboard, or go to Settings
2. It looks like: `https://something-something-123.convex.cloud`
3. Copy the whole URL

**Credential 2 — Deploy Key:**
1. Go to your project's **Settings** page
2. Find **"Deploy Keys"** section
3. Click **"Generate Deploy Key"**
4. It generates a long string starting with `prod:`
5. Copy the whole string

**Step 4: (Optional — can do later) Set up login**

If you want users to be able to sign up and log in:
1. In your Convex project, go to **Settings → Authentication**
2. The simplest option: enable **Email/Password** — no external setup needed
3. Or add **GitHub** login (since you already have GitHub connected)

### What To Give Me

Just paste these two values:
```
Convex URL:        https://[your-project].convex.cloud
Convex Deploy Key: prod:[your-key-here]
```

### What I'll Do With Them

1. Push the database schema (15 tables — tasks, notes, projects, calendar, etc.)
2. Deploy all the server functions (create/read/update/delete for everything)
3. Wire up the app to use Convex instead of the current Express API
4. Set up real-time sync so changes appear instantly

---

## PART 2: VERCEL — YOUR WEB HOSTING

### What Is Vercel?

Vercel hosts websites. When you want TEMPO to be available at a real URL (not just on Replit), Vercel serves it to users worldwide through fast servers. It's free for personal projects.

### Why TEMPO Needs It

- **Public access**: Users can reach TEMPO from any browser
- **Custom domain**: Use your own domain name (like `tempo.app` or `app.mytempo.com`)
- **Speed**: Vercel serves from the closest server to each user
- **Automatic HTTPS**: Secure by default

### What You Need To Do

**Step 1: Create an account**
1. Go to **https://vercel.com**
2. Click "Sign up" — use your GitHub account (fastest)

**Step 2: Create two projects** (one for the app, one for the marketing site)

**Project 1 — The main TEMPO app:**
1. Click **"Add New" → "Project"**
2. You can skip the import step — just name it: **`tempo-web`**
3. Set Framework to **Vite**
4. That's it for now — I'll handle the build configuration

**Project 2 — The marketing/landing page:**
1. Same process, name it: **`tempo-marketing`**
2. Framework: **Vite**

**Step 3: Get your API token**
1. Click your profile icon → **"Settings"**
2. Go to **"Tokens"** (or visit https://vercel.com/account/tokens directly)
3. Click **"Create Token"**
4. Name it: **`replit-deploy`**
5. Click Create and **copy the token immediately** (you won't see it again)

**Step 4: Copy your IDs**

You need three IDs:

1. **Org ID**: Go to Account Settings → General → scroll to bottom → find "Vercel ID"
2. **App Project ID**: Click into `tempo-web` → Settings → General → "Project ID"
3. **Marketing Project ID**: Click into `tempo-marketing` → Settings → General → "Project ID"

### What To Give Me

Paste these four values:
```
Vercel Token:                  [your-token]
Vercel Org ID:                 [your-org-id]
Vercel Project ID (app):       [your-tempo-web-project-id]
Vercel Project ID (marketing): [your-tempo-marketing-project-id]
```

### What I'll Do With Them

1. Configure the build settings for both projects
2. Deploy the TEMPO app and marketing site
3. Set up environment variables (connecting Vercel to Convex)
4. Set up your custom domain if you have one

---

## PART 3: YOUR COMPLETE CHECKLIST

Do these in order. The whole process takes about 10-15 minutes.

### Convex (5 minutes)
- [ ] Go to https://dashboard.convex.dev and sign up
- [ ] Create a project called `tempo`
- [ ] Copy the **Deployment URL** (looks like `https://xxx.convex.cloud`)
- [ ] Generate and copy the **Deploy Key** (starts with `prod:`)

### Vercel (5-10 minutes)
- [ ] Go to https://vercel.com and sign up
- [ ] Create project **`tempo-web`** (Framework: Vite)
- [ ] Create project **`tempo-marketing`** (Framework: Vite)
- [ ] Generate an **API Token** (Settings → Tokens)
- [ ] Copy your **Org ID** (Account Settings → General → bottom)
- [ ] Copy the **Project ID** for `tempo-web`
- [ ] Copy the **Project ID** for `tempo-marketing`

### Give Me Everything

Come back and paste something like this:

```
Here are my credentials:

Convex URL: https://happy-panda-123.convex.cloud
Convex Deploy Key: prod:abc123def456ghi789...

Vercel Token: vercel_abc123def456...
Vercel Org ID: team_abc123...
Vercel Project ID (app): prj_abc123...
Vercel Project ID (marketing): prj_def456...
```

I'll store them securely and connect everything.

---

## PART 4: WHAT'S ALREADY BUILT (FOR AI TOOLS)

If you're feeding this document to another AI to help you, here's the full context about TEMPO.

### What TEMPO Is

An ADHD-friendly AI daily planner. It combines:
- **Calendar** with event and task visualization
- **Task management** with priority, time blocking, recurrence
- **Notes** with markdown, wiki-linking, templates, publishing
- **AI assistant** that helps plan your day, extract tasks from messy text, break big tasks into small ones, and prioritize based on energy levels
- **Daily planning** with an Accept/Edit/Reject workflow for AI suggestions

### Current Tech Stack
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui (dark theme, mobile-first)
- **Backend**: Express.js + PostgreSQL + Drizzle ORM (on Replit)
- **AI**: Ollama Cloud (models: ministral-3 default, magistral backup, 6-model council)
- **Target stack**: Frontend stays React, backend moves to Convex, mobile via Expo

### What Exists in the Codebase

**16 working app pages:**
Dashboard, Calendar, Today View, Inbox (with AI brain dump), Notes, Note Editor (markdown + wiki-links + voice), Projects, AI Chat, Settings, Daily Plan (AI-generated), Task Detail (time blocking + recurrence + AI chunking), Task Filters, Note Templates, Period Notes (weekly/monthly/yearly), Onboarding wizard, Published Note view

**30+ API endpoints covering:**
Tasks, Notes, Projects, Folders, Calendar Events, Daily Plans, AI Chat, AI Task Extraction, AI Task Chunking, AI Prioritization, AI Plan Generation, Search, Tags, Note Links, Templates, Staging (AI suggestions), Preferences, Memories, Voice Transcription, Auth

**Complete Convex backend (ready to deploy):**
15 database tables and all query/mutation functions are written at `tempo-app/convex/`. The agent just needs the Convex credentials to push them live.

### The Migration Plan

```
TODAY:    React app → Express REST API → PostgreSQL (all on Replit)

AFTER CONVEX:  React app → Convex real-time hooks → Convex DB (cloud)
               Marketing site → Vercel (static hosting)
               (Later) Expo mobile app → same Convex backend
```

The Convex migration replaces `fetch('/api/tasks')` calls with `useQuery(api.tasks.list)` — the data model stays the same, but updates become real-time and the Express server goes away.

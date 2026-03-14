# TEMPO - ADHD-Friendly AI Daily Planner

TEMPO is a calm, minimalist, ADHD-friendly planning app that combines daily planning, tasks, notes, projects, folders, tags, and AI-assisted planning into one tool.

## Stack

- **Backend**: Express + PostgreSQL + Drizzle ORM
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + wouter
- **API layer**: OpenAPI spec + Orval codegen + React Query hooks
- **Marketing**: Vite React SPA

## Project Structure

```
artifacts/
  api-server/     Express REST API (port 8080)
  tempo/          Vite React SPA (main app)
  tempo-marketing/ Marketing website
lib/
  api-spec/       OpenAPI 3.0 spec (source of truth)
  api-client-react/ Generated React Query hooks (via Orval)
  api-zod/        Generated Zod validators
  db/             Drizzle ORM schema + PostgreSQL connection
```

## Features

- Calendar view with month/week toggle and event CRUD
- Period notes (weekly, monthly, yearly)
- Bi-directional note linking with wiki-links
- Command bar (Cmd+K) for global search and navigation
- Time blocking with date, start time, and duration
- Recurring tasks (daily/weekly/monthly/yearly/custom)
- Advanced task filters with save/load presets
- 10 built-in note templates + custom templates
- Tags and @mentions with auto-linking
- Note publishing with public slugs
- Voice notes with server-side transcription
- AI staging pattern (accept/edit/reject workflow)
- Pomodoro-style focus timer with task selection
- Areas/folders for broad life categories
- Tag management with color picker
- AI memory (warm/cold tier) for personalization
- Project detail views with linked tasks/notes and progress
- 6-step onboarding (ADHD mode, planning style, schedule, energy peaks)
- AI chat with conversation history, quick prompts, and memory panel
- Dashboard with Top 3 focus tasks and progress ring
- Now/Soon/Later friendly priority labels
- Energy level indicators on tasks
- Quick capture from any page (floating + button)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- pnpm 9+

### Setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
# DATABASE_URL - PostgreSQL connection string
# OLLAMA_API_KEY - Ollama Cloud API key
# OLLAMA_API_URL - Ollama API base URL (default: https://api.ollama.com)

# Push database schema
cd lib/db && npx drizzle-kit push --force

# Start development servers
pnpm --filter @workspace/api-server run dev   # API server (port 8080)
pnpm --filter @workspace/tempo run dev         # Frontend
pnpm --filter @workspace/tempo-marketing run dev # Marketing site
```

### API Codegen

After modifying `lib/api-spec/openapi.yaml`:

```bash
cd lib/api-spec && pnpm run codegen
```

This regenerates the React Query hooks and Zod validators.

## Authentication

- Admin: `admin1234567` / `admin1234567`
- Beta testers: `beta1`-`beta10` / `beta1234567`

## Design

Warm light theme with violet primary, ADHD-friendly with low cognitive load. Features gentle animations, glass-effect cards, and visual chunking.

## License

Private - All rights reserved.

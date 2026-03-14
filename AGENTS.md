# AGENTS.md

## Cursor Cloud specific instructions

### Overview

TEMPO is an ADHD-friendly AI daily planner — a pnpm workspace monorepo with:

| Service | Path | Dev command | Port |
|---|---|---|---|
| API Server | `artifacts/api-server/` | `pnpm --filter @workspace/api-server run dev` | 8080 |
| Tempo Frontend | `artifacts/tempo/` | `pnpm --filter @workspace/tempo run dev` | 5173 |
| Marketing Site | `artifacts/tempo-marketing/` | `pnpm --filter @workspace/tempo-marketing run dev` | (set via PORT) |

### Running services

Standard commands are documented in `README.md` under "Getting Started". Key non-obvious notes:

- **PostgreSQL is required.** Start it with `sudo pg_ctlcluster 16 main start`. The database and user must exist (see setup below).
- **Four environment variables are required** for the API server to start (it throws at module-load time if missing):
  - `DATABASE_URL` — PostgreSQL connection string
  - `OLLAMA_API_URL` — set to `https://api.ollama.com` (or any URL; placeholder is fine if AI features aren't needed)
  - `OLLAMA_API_KEY` — set to `placeholder` if no real key available
  - `AI_INTEGRATIONS_OPENAI_BASE_URL` — set to `https://api.openai.com/v1` (or placeholder)
  - `AI_INTEGRATIONS_OPENAI_API_KEY` — set to `placeholder` if no real key available
- **Vite frontend needs `PORT` and `BASE_PATH` env vars.** Use `PORT=5173 BASE_PATH="/"` for the main Tempo app.
- The Tempo frontend Vite config includes a proxy from `/api` to `http://localhost:8080` so relative API paths work in dev mode.

### Database setup (one-time)

```bash
sudo pg_ctlcluster 16 main start
sudo -u postgres psql -c "CREATE USER tempouser WITH PASSWORD 'tempopass' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE tempo OWNER tempouser;"
DATABASE_URL="postgresql://tempouser:tempopass@localhost:5432/tempo" pnpm --filter @workspace/db run push-force
```

### Typecheck and lint

- `pnpm run typecheck` — runs TypeScript build for libs, then per-artifact typecheck. Note: there are pre-existing TS errors in `lib/api-zod` (duplicate exports from codegen) and `lib/integrations-openai-ai-server` (missing `@types/node`, strict null checks).
- `npx prettier --check .` — Prettier formatting check (no ESLint configured).

### Authentication

Hard-coded beta accounts (no external auth service needed):
- Admin: `admin1234567` / `admin1234567`
- Beta testers: `beta1`–`beta10` / `beta1234567`

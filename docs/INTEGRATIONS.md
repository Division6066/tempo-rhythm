# TEMPO Integration Patterns

Reference for technologies and patterns integrated from external repositories.

## Council Mode (from OpenWriter)

**Source**: OpenWriter's multi-model AI synthesis pattern  
**Files**: `lib/integrations-openai-ai-server/src/client.ts`

### What it does
- Sends the same prompt to multiple AI models simultaneously
- Scores each response on quality (length, structure, coherence)
- Synthesizes the best insights into a single response
- Tracks model health with exponential backoff for failures
- Per-call timeout protection to prevent hangs

### Key functions
- `callCouncil()` — parallel multi-model calls with timeout + health checks
- `synthesizeCouncil()` — council + scoring + synthesis into one best answer
- `callWithFallbackDetailed()` — single call with token/latency tracking
- `getModelHealthStats()` — runtime model health dashboard

### API endpoints
- `POST /api/ai/chat?council=true` — use council for chat responses
- `POST /api/ai/generate-plan?council=true` — council-powered daily plans
- `GET /api/ai/model-health` — model health stats

---

## Hybrid Search (from RCE v2)

**Source**: RCE v2's ranked hybrid search combining keyword + full-text  
**Files**: `artifacts/api-server/src/routes/search.ts`

### What it does
- PostgreSQL full-text search with `tsvector`/`tsquery` for ranked relevance
- Falls back to ILIKE keyword matching if full-text indexing unavailable
- Searches across notes, tasks, AND memories (expanded from notes+tasks only)
- Title matches boosted with scoring priority
- Supports `?mode=keyword` for simple ILIKE-only search

### API
- `GET /api/search?q=term` — hybrid ranked search (default)
- `GET /api/search?q=term&mode=keyword` — keyword-only fallback

---

## Memory Spine (from RalphHub/AmitOS)

**Source**: AmitOS Memory Spine pattern with action logging and decay  
**Files**: `artifacts/api-server/src/routes/memories.ts`, `lib/db/src/schema/aiActionLog.ts`

### What it does
- **AI Action Log**: Every AI call logged with model, tokens, cost, latency, status
- **Memory Decay**: Memories have a `decay` field (0.0–1.0) that degrades over time
- **Auto-pruning**: Short-term memories with low decay get automatically removed
- **Memory Stats**: Per-tier statistics (count, average decay, age range)
- **Filterable**: Query memories by tier and content search

### Schema: `ai_action_log`
| Column | Type | Description |
|--------|------|-------------|
| action | text | What AI operation was performed |
| model | text | Which model was used |
| input_tokens | int | Prompt tokens |
| output_tokens | int | Completion tokens |
| total_tokens | int | Total tokens |
| cost_usd | real | Estimated cost |
| latency_ms | int | Call duration |
| status | text | success/error |
| council_models | text | CSV of models used (council only) |
| council_response_count | int | How many models responded |

### API
- `GET /api/memories?tier=core&q=search` — filtered memory listing
- `POST /api/memories/decay` — apply decay tick, prune expired short-term
- `GET /api/memories/stats` — per-tier statistics
- `GET /api/ai/action-log?limit=50` — AI call history

---

## Lore Pack Import (from OpenWriter)

**Source**: OpenWriter's Lore Pack system for bulk content importing  
**Files**: `artifacts/api-server/src/routes/import.ts`, `artifacts/tempo/src/pages/Settings.tsx`

### What it does
- Bulk import tasks, notes, and memories from JSON, Markdown, or CSV
- Markdown parser understands `# Tasks`, `# Notes`, `# Memories` sections
- CSV parser auto-detects columns by header names
- JSON accepts full Lore Pack schema with all fields
- Template endpoint provides example format for each type
- Frontend UI on Settings page with format picker + paste area

### Lore Pack JSON Schema
```json
{
  "name": "My Pack",
  "tasks": [{ "title": "...", "priority": "high", "tags": ["work"] }],
  "notes": [{ "title": "...", "content": "..." }],
  "memories": [{ "content": "...", "tier": "core" }]
}
```

### API
- `POST /api/import` — import data `{ format, data, type? }`
- `GET /api/import/template?format=json|markdown|csv` — example template

---

## Future Patterns (from amit-template/concilium)

**Source**: concilium + amit-template repos  
**Status**: Documented for future Convex integration

### Convex Auth + Payment (amit-template)
- Clerk authentication with role-based access
- Stripe subscription management with plan tiers
- Server-side auth middleware pattern
- Ready to port when Convex backend is connected

### Multi-Agent Orchestration (concilium)
- Agent registry with capability declarations
- Task routing based on agent specialties
- Shared memory bus between agents
- Applicable when TEMPO adds specialized AI agents (e.g., scheduling agent, wellness agent)

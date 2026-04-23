# Cursor browser — quick smoke after install

After `bun run dev:web` is running and `apps/web/.env.local` has a real **`NEXT_PUBLIC_CONVEX_URL`**:

1. Open **Simple Browser** (or Cursor’s browser preview) to `http://localhost:3000/`.
2. Confirm **HTTP 200** and the page renders (marketing or app shell).
3. Open `http://localhost:3000/sign-in` — should return **200** (public route per `apps/web/proxy.ts`).
4. Open a protected route (e.g. `/dashboard` if it exists) while signed out — expect **redirect to `/sign-in`**, not an infinite loop.

**Automated check (same machine):** from repo root with dev server up:

```bash
bash ./scripts/smoke-local-web.sh
```

Or manually:

```bash
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/sign-in
```

Both should print `200` for public routes.

**If Convex is not configured yet:** `bun x convex dev` must succeed once (interactive login / project selection) so you can paste the real deployment URL into `NEXT_PUBLIC_CONVEX_URL`.

# TEMPO Flow Setup in Cursor

This setup guide preserves the exact TEMPO Flow (`tempo-rhythm`) instructions.

## Step 1: Clone the repo

Open a terminal in Cursor and run:

```bash
git clone https://github.com/Division6066/tempo-rhythm.git
cd tempo-rhythm
```

## Step 2: Install dependencies

```bash
npm install -g pnpm
pnpm install
```

## Step 3: Set up environment variables

Create a `.env` file in the project root with:

```bash
CONVEX_DEPLOY_KEY=<your convex deploy key>
```

Then, for the Convex app, also create `.env.local` inside `tempo-app/apps/web/` (if working on the web app):

```bash
VITE_CONVEX_URL=<your convex deployment URL>
```

## Step 4: Run the marketing site (to test it works)

```bash
pnpm --filter @workspace/tempo-marketing run dev
```

## Step 5: Run the mobile app

```bash
cd tempo-app/apps/mobile
npx expo start
```

## Project structure overview for Cursor

- `artifacts/tempo-marketing/` — Marketing website (React + Vite)
- `tempo-app/apps/mobile/` — React Native mobile app (Expo)
- `tempo-app/apps/web/` — Main web app (Next.js / Vite)
- `convex/` — Convex backend (functions, schema, auth)
- `lib/` — Shared libraries

## Cursor tips

- Open the root `tempo-rhythm` folder in Cursor so it sees the full monorepo.
- Use Cursor AI chat to ask questions about any file; it can index the whole project.
- When you make changes, commit and push from Cursor's built-in Git panel.
- Convex backend deploys separately: run `npx convex deploy --yes` from the project root when backend functions change.

## Notes for this workspace

If you are working in the current `tempo` workspace (instead of `tempo-rhythm`), paths are different:

- `tempo-app/apps/web/` -> `apps/web/`
- `tempo-app/apps/mobile/` -> `apps/mobile/`
- `lib/` -> `packages/`

For local Convex development, prefer:

```bash
npx convex dev
```

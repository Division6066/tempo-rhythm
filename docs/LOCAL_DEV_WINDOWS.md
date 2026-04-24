# Local dev on Windows (Node PATH + tools)

## Node.js and npm in Git Bash

If `node` is **not found** in Cursor’s Git Bash but Node is installed (e.g. via **nvm-windows** under `C:\nvm4w\...`), prepend it to `PATH` for the session:

```bash
source ./scripts/ensure-dev-path.sh
node --version
npm --version
```

To make this permanent for Git Bash, add the same `source` line to your `~/.bashrc`.

Optional: point the script at a specific install:

```bash
export NODE_HOME="/c/Program Files/nodejs"
source ./scripts/ensure-dev-path.sh
```

## Bun (required)

This repo uses **Bun** (`package.json` → `packageManager: bun@1.3.9`). Install from [bun.sh](https://bun.sh) and run installs from the repo root:

```bash
bun install
```

## Vercel CLI (optional)

After `node` / `npm` work:

```bash
npm i -g vercel
vercel --version
```

You can also run the CLI without a global install: `bunx vercel --version`.

## Environment files

- Copy [`.env.example`](../.env.example) → `.env.local` at repo root (git-ignored).
- Copy `apps/web/.env.example` → `apps/web/.env.local` and set **`NEXT_PUBLIC_CONVEX_URL`** to your Convex deployment URL.

Then start Convex and the web app from the root (see [README](../README.md) — prefer **`bun run convex:dev`** and **`bun run dev:web`**).

## Single lockfile (monorepo)

Use **`bun install` only at the repo root** — the root [`bun.lock`](../bun.lock) is the source of truth for CI and Vercel (`apps/web/vercel.json`). Do not maintain a separate `apps/web/bun.lock`.

## Convex + web package versions

`convex` and `@convex-dev/auth` are aligned across the root workspace and `apps/web` / `apps/mobile` `package.json` files so local installs match tooling.

## Which deployment am I talking to?

This doc only covers **local development**. For the full four-mode contract (dev / test / preview / deployment) across Convex, Vercel, and the repo env files, see [docs/ENVIRONMENTS.md](./ENVIRONMENTS.md).

Quick rule of thumb on your laptop:

- `bun run convex:dev` → talks to **your own `dev:*` Convex deployment** (auto-generated, stored in `.env.local`).
- `bun run dev:web` → talks to whatever Convex URL is set in `apps/web/.env.local`.
- Nothing you run locally can deploy anything. Deployment is a dashboard action (see `docs/ENVIRONMENTS.md`).

## Typecheck: `Cannot find type definition file for 'babel__core'` (mobile)

If `apps/mobile/node_modules/@types` contains **empty** folders (`babel__core`, `yargs`, etc.), TypeScript fails with TS2688. Remove those empty directories, then reinstall from the repo root:

```bash
rm -rf apps/mobile/node_modules/@types/babel__core \
  apps/mobile/node_modules/@types/babel__generator \
  apps/mobile/node_modules/@types/babel__template \
  apps/mobile/node_modules/@types/babel__traverse \
  apps/mobile/node_modules/@types/graceful-fs \
  apps/mobile/node_modules/@types/istanbul-lib-coverage \
  apps/mobile/node_modules/@types/istanbul-lib-report \
  apps/mobile/node_modules/@types/istanbul-reports \
  apps/mobile/node_modules/@types/stack-utils \
  apps/mobile/node_modules/@types/yargs \
  apps/mobile/node_modules/@types/yargs-parser
bun install
```

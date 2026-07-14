import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PORT ?? 3000);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
  webServer: {
    command: `CONVEX_AGENT_MODE=anonymous bun x convex dev --run-sh "bunx @convex-dev/auth --skip-git-check --web-server-url http://127.0.0.1:${port} && cd apps/web && set -a && . ../../.env.local && set +a && NEXT_PUBLIC_CONVEX_URL=\\$CONVEX_URL bun run dev --hostname 127.0.0.1 --port ${port}"`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

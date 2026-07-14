import { defineConfig } from "@playwright/test";

const port = 3100;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 120_000,
  expect: {
    timeout: 20_000,
  },
  use: {
    baseURL,
    channel: "chrome",
    trace: "retain-on-failure",
  },
  webServer: {
    command: [
      "CONVEX_AGENT_MODE=anonymous",
      "NEXT_TELEMETRY_DISABLED=1",
      "bun x convex dev --typecheck disable --tail-logs disable --run-sh 'set -a; . ./.env.local; set +a; node tests/e2e/setup-convex-auth-env.mjs && cd apps/web && NEXT_PUBLIC_CONVEX_URL=\"$CONVEX_URL\" CONVEX_SITE_URL=\"$CONVEX_SITE_URL\" bun run dev -- --port 3100 --hostname 127.0.0.1'",
    ].join(" "),
    url: `${baseURL}/sign-up`,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
});

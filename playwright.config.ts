import { defineConfig } from "@playwright/test";

const convexUrl = "http://127.0.0.1:3210";
const webUrl = "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: webUrl,
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command:
        "CONVEX_AGENT_MODE=anonymous BETA_ALLOWLIST_EMAILS=e2e-routines@tempo.test BETA_MAX_TESTERS=100 bun x convex dev",
      url: convexUrl,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `NEXT_PUBLIC_CONVEX_URL=${convexUrl} bun run --cwd apps/web dev --hostname 127.0.0.1 --port 3000`,
      url: webUrl,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});

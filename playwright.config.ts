import { defineConfig } from "@playwright/test";

const convexUrl = "http://127.0.0.1:3210";
const webUrl = "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  timeout: 60_000,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: webUrl,
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "bash scripts/start-convex-e2e.sh",
      url: convexUrl,
      timeout: 120_000,
      reuseExistingServer: false,
    },
    {
      command: `NEXT_PUBLIC_CONVEX_URL=${convexUrl} bun run --cwd apps/web dev --hostname 127.0.0.1 --port 3000`,
      url: webUrl,
      timeout: 120_000,
      reuseExistingServer: false,
    },
  ],
});

import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: ".",
  testMatch: ["apps/web/e2e/**/*.spec.ts"],
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: `cd apps/web && PLAYWRIGHT_E2E=1 NEXT_PUBLIC_CONVEX_URL=https://precious-wildcat-890.eu-west-1.convex.cloud bun run dev --hostname 127.0.0.1 --port ${port}`,
    url: `${baseURL}/projects/aw-34/kanban`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

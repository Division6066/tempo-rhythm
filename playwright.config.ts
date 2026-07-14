import { defineConfig, devices } from "@playwright/test";

process.env.TEMPO_PLAYWRIGHT = "1";

export default defineConfig({
  testDir: ".",
  testMatch: ["apps/web/e2e/**/*.spec.ts"],
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command:
      "NEXT_PUBLIC_CONVEX_URL=https://example.convex.cloud bun run dev:web",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
});

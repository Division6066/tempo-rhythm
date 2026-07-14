import { defineConfig, devices } from "@playwright/test";

const mobileConvexUrl =
  process.env.EXPO_PUBLIC_CONVEX_URL ?? "http://127.0.0.1:3210";

export default defineConfig({
  testDir: ".",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: "http://127.0.0.1:8081",
    trace: "on-first-retry",
  },
  webServer: {
    command: `CI=1 EXPO_PUBLIC_CONVEX_URL=${mobileConvexUrl} bun run --cwd apps/mobile web -- --port 8081`,
    url: "http://127.0.0.1:8081",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

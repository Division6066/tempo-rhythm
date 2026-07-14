import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command:
      "cd apps/web && bun run dev -- --hostname 127.0.0.1 --port 3000",
    env: {
      NEXT_PUBLIC_CONVEX_URL: "https://example.convex.cloud",
    },
    url: "http://127.0.0.1:3000/renderer-prototype",
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

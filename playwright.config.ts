import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: ["apps/mobile/e2e/**/*.spec.ts"],
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "bun run --cwd apps/web dev -- --hostname 127.0.0.1 --port 3100",
    env: {
      NEXT_PUBLIC_CONVEX_URL: "https://test-not-used.convex.cloud",
    },
    url: "http://127.0.0.1:3100/dashboard",
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

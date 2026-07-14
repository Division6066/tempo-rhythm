import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "bun run --cwd apps/web dev",
    env: {
      NEXT_PUBLIC_CONVEX_URL: "https://example.convex.cloud",
      NEXT_PUBLIC_TEMPO_E2E_AUTH_BYPASS: "1",
      TEMPO_E2E_AUTH_BYPASS: "1",
    },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: "http://localhost:3000",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

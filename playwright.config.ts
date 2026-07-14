import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3000);
const baseURL = `http://127.0.0.1:${port}`;
const convexAuthEnvPath = `/tmp/tempo-convex-auth-${port}.env`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: [
      `NEXT_PUBLIC_APP_URL=${baseURL}`,
      `bash tests/e2e/start-calendar-e2e-server.sh ${convexAuthEnvPath} ${baseURL} ${port}`,
    ].join(" "),
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

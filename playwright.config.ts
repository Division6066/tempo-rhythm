import { defineConfig, devices } from "@playwright/test";

const mobileWebPort = Number(process.env.MOBILE_E2E_PORT ?? "8099");
const mobileWebUrl = `http://127.0.0.1:${mobileWebPort}`;

export default defineConfig({
  testDir: ".",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  webServer: {
    command: `bun run --cwd apps/mobile web --port ${mobileWebPort}`,
    url: `${mobileWebUrl}/settings`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      CI: "1",
      EXPO_NO_TELEMETRY: "1",
      EXPO_PUBLIC_CONVEX_URL:
        process.env.EXPO_PUBLIC_CONVEX_URL ??
        "https://precious-wildcat-890.eu-west-1.convex.cloud",
    },
  },
  use: {
    ...devices["Desktop Chrome"],
    baseURL: mobileWebUrl,
    trace: "retain-on-failure",
  },
});

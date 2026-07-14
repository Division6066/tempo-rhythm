import { defineConfig, devices } from "@playwright/test";

const mobileWebPort = 8081;
const mobileWebUrl = `http://127.0.0.1:${mobileWebPort}`;

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  testDir: ".",
  timeout: 60_000,
  use: {
    ...devices["Pixel 5"],
    baseURL: mobileWebUrl,
    trace: "on-first-retry",
  },
  webServer: {
    command:
      "cd apps/mobile && EXPO_PUBLIC_CONVEX_URL=https://precious-wildcat-890.eu-west-1.convex.cloud EXPO_NO_TELEMETRY=1 CI=1 bunx expo start --web --port 8081",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: mobileWebUrl,
  },
});

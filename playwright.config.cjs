/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  expect: {
    timeout: 15_000,
  },
  testDir: ".",
  timeout: 60_000,
  use: {
    baseURL: "http://127.0.0.1:8081",
    channel: "chrome",
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "cd apps/mobile && CI=1 EXPO_NO_TELEMETRY=1 BROWSER=none EXPO_PUBLIC_CONVEX_URL=https://precious-wildcat-890.eu-west-1.convex.cloud bunx expo start --web --port 8081 --clear",
    reuseExistingServer: true,
    timeout: 120_000,
    url: "http://127.0.0.1:8081",
  },
};

module.exports = config;

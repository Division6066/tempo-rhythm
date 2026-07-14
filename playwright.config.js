/** @type {import('playwright/test').PlaywrightTestConfig} */
module.exports = {
  testDir: './apps/mobile/e2e',
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:8081',
    trace: 'retain-on-failure',
  },
  webServer: {
    command:
      'cd apps/mobile && EXPO_PUBLIC_CONVEX_URL=https://test-agent.convex.cloud bun run web -- --port 8081',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: 'http://127.0.0.1:8081/routines',
  },
};

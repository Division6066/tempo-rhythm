import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: ['apps/mobile/e2e/**/*.spec.ts'],
  timeout: 30_000,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'bun run web -- --port 8081',
    cwd: 'apps/mobile',
    env: {
      EXPO_PUBLIC_CONVEX_URL:
        process.env.EXPO_PUBLIC_CONVEX_URL ??
        'https://precious-wildcat-890.eu-west-1.convex.cloud',
    },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: 'http://localhost:8081',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

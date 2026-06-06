import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for Tempo Flow web smoke tests.
 *
 * Strategy: build the app once, then start `next start` against a local
 * port that points at a fake Convex URL. Public routes (sign-in, /,
 * /about, /privacy, /terms) render without auth. Authenticated routes
 * redirect to /sign-in via the proxy middleware — this is itself a
 * useful smoke check (we assert the redirect happens).
 *
 * Run:  bun run test:e2e   (from apps/web)
 *
 * The harness deliberately does NOT spin up a real Convex deployment.
 * Anything that requires a logged-in session belongs in a dedicated
 * provider-fixture suite, not here.
 */
const PORT = Number(process.env.E2E_PORT ?? 3737);
const BASE = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  // Use `.e2e.ts` (not `.spec.ts`) so `bun test` doesn't pick these up.
  testMatch: /.*\.e2e\.ts$/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { outputFolder: "test-results/html", open: "never" }]],
  outputDir: "test-results/artifacts",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: BASE,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 7_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "tablet-chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 820, height: 1180 } },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: "bun run start",
    port: PORT,
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      PORT: String(PORT),
      // Use a sentinel URL: ConvexReactClient is constructed at module load
      // but does not connect until a query/mutation runs. SSR for unauth
      // public routes works fine with this stub.
      NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://e2e.invalid",
    },
  },
});

import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import type { expect as playwrightExpect, test as playwrightTest } from "playwright/test";

const runnerRequire = createRequire(process.argv[1] ?? __filename);
const { expect, test } = runnerRequire("playwright/test") as {
  expect: typeof playwrightExpect;
  test: typeof playwrightTest;
};

test.setTimeout(120_000);

const port = 8099;
const baseUrl = `http://127.0.0.1:${port}`;
const appDir = path.resolve(process.cwd(), "apps/mobile");
const notFoundCopy = "המסך הזה לא קיים.";

let server: ChildProcessWithoutNullStreams | undefined;
let serverOutput = "";

async function waitForServer(): Promise<void> {
  const deadline = Date.now() + 60_000;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) {
        return;
      }
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(
    `Expo web server did not become ready: ${String(lastError)}\n${serverOutput.slice(-4_000)}`
  );
}

test.beforeAll(async () => {
  serverOutput = "";
  server = spawn("bun", ["run", "web", "--", "--port", String(port)], {
    cwd: appDir,
    env: {
      ...process.env,
      BROWSER: "none",
      CI: "1",
      EXPO_NO_TELEMETRY: "1",
      EXPO_PUBLIC_CONVEX_URL: "https://example.convex.cloud",
    },
  });
  server.stdout.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });
  server.stderr.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });

  await waitForServer();
});

test.afterAll(async () => {
  if (!server || server.killed) {
    return;
  }

  server.kill("SIGTERM");
  await new Promise<void>((resolve) => {
    server?.once("exit", () => resolve());
    setTimeout(resolve, 5_000);
  });
});

const routes = [
  { path: "/home", label: "Home" },
  { path: "/breathe", label: "Breathe" },
  { path: "/move", label: "Move" },
  { path: "/condition", label: "Condition" },
  { path: "/progress", label: "Progress" },
  { path: "/settings", label: "Settings" },
] as const;

test.describe("mobile navigation renders", () => {
  for (const route of routes) {
    test(`renders ${route.label}`, async ({ page }) => {
      const pageErrors: string[] = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));

      await page.goto(`${baseUrl}${route.path}`);

      await expect(page.getByText(route.label, { exact: true }).first()).toBeVisible();
      await expect(page.getByText(notFoundCopy)).toHaveCount(0);
      expect(pageErrors).toEqual([]);
    });
  }
});

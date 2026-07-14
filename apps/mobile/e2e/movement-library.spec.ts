import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import path from "node:path";
import { expect, test as playwrightTest } from "playwright/test";

const port = 19176;
const baseUrl = `http://127.0.0.1:${port}`;
const mobileDir = path.join(process.cwd(), "apps/mobile");

let server: ChildProcessWithoutNullStreams | undefined;
let serverOutput = "";

async function waitForServer(): Promise<void> {
  const startedAt = Date.now();
  const timeoutMs = 90_000;

  while (Date.now() - startedAt < timeoutMs) {
    if (server?.exitCode !== null && server?.exitCode !== undefined) {
      throw new Error(`Expo exited early.\n${serverOutput}`);
    }

    if (serverOutput.includes("Metro error:")) {
      throw new Error(`Expo failed to bundle.\n${serverOutput}`);
    }

    try {
      const response = await fetch(baseUrl);
      if (response.ok) {
        return;
      }
    } catch {
      // Metro is still booting; retry until the timeout.
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(`Timed out waiting for Expo web.\n${serverOutput}`);
}

function stopServer(): void {
  if (!server?.pid || server.exitCode !== null) {
    return;
  }

  try {
    process.kill(-server.pid, "SIGTERM");
  } catch {
    server.kill("SIGTERM");
  }
}

if ("Bun" in globalThis) {
  const { test: bunTest } = require("bun:test") as typeof import("bun:test");

  bunTest.skip("opens-player runs with Playwright", () => {});
} else {
  playwrightTest.describe("movement library", () => {
    playwrightTest.describe.configure({ timeout: 120_000 });

    playwrightTest.beforeAll(async () => {
      playwrightTest.setTimeout(120_000);

      server = spawn(
        process.execPath,
        ["expo-start-windows.js", "--web", "--port", String(port)],
        {
          cwd: mobileDir,
          detached: true,
          env: {
            ...process.env,
            BROWSER: "none",
            CI: "1",
            EXPO_NO_TELEMETRY: "1",
            EXPO_PUBLIC_CONVEX_URL:
              "https://precious-wildcat-890.eu-west-1.convex.cloud",
          },
        }
      );

      server.stdout.on("data", (chunk: Buffer) => {
        serverOutput += chunk.toString();
      });
      server.stderr.on("data", (chunk: Buffer) => {
        serverOutput += chunk.toString();
      });

      await waitForServer();
    });

    playwrightTest.afterAll(() => {
      stopServer();
    });

    playwrightTest("opens-player", async ({ page }) => {
      await page.goto(`${baseUrl}/routines`);

      await expect(page.getByText("Movement library")).toBeVisible();
      await page.getByRole("button", { name: "Open Morning reset" }).click();

      await expect(page).toHaveURL(/\/routines\/morning-reset/);
      await expect(page.getByTestId("routine-player-title")).toHaveText(
        "Morning reset"
      );
      await expect(page.getByText("Stand and notice")).toBeVisible();
    });
  });
}

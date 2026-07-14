import { expect, test, type Page } from "@playwright/test";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import path from "node:path";

const mobileRoot = path.resolve(__dirname, "..");
const port = 19176;
const baseUrl = `http://127.0.0.1:${port}`;

let server: ChildProcessWithoutNullStreams | undefined;
let serverOutput = "";

test.setTimeout(120_000);

async function waitForMobileWebServer() {
  const deadline = Date.now() + 90_000;
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

    if (server?.exitCode !== null) {
      throw new Error(`Expo web server exited before it was ready.\n${serverOutput}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  if (server?.pid && !server.killed) {
    server.kill("SIGTERM");
  }
  throw new Error(
    `Expo web server did not become ready. Last error: ${String(lastError)}\n${serverOutput}`,
  );
}

async function ringDashOffset(page: Page) {
  const rawOffset = await page.getByTestId("enso-ring-progress").getAttribute("stroke-dashoffset");
  expect(rawOffset).not.toBeNull();

  const offset = Number(rawOffset);
  expect(Number.isFinite(offset)).toBe(true);

  return offset;
}

test.beforeAll(async () => {
  test.setTimeout(120_000);
  serverOutput = "";
  server = spawn("bunx", ["expo", "start", "--clear", "--web", "--port", String(port)], {
    cwd: mobileRoot,
    env: {
      ...process.env,
      BROWSER: "none",
      CI: "1",
      EXPO_NO_TELEMETRY: "1",
      EXPO_PUBLIC_CONVEX_URL:
        process.env.EXPO_PUBLIC_CONVEX_URL ?? "https://precious-wildcat-890.eu-west-1.convex.cloud",
    },
  });
  server.stdout.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });
  server.stderr.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });

  await waitForMobileWebServer();
});

test.afterAll(() => {
  if (server?.pid && !server.killed) {
    server.kill("SIGTERM");
  }
});

test("streak increments and enso ring reflects it", async ({ page }) => {
  await page.goto(`${baseUrl}/tracking-dashboard`);

  await expect(page.getByTestId("streak-value")).toHaveText("3");
  const initialOffset = await ringDashOffset(page);

  await page.getByTestId("complete-today-button").click();

  await expect(page.getByTestId("streak-value")).toHaveText("4");
  await expect(page.getByTestId("enso-ring")).toHaveAttribute("aria-valuenow", "4");

  const updatedOffset = await ringDashOffset(page);
  expect(updatedOffset).toBeLessThan(initialOffset);
});

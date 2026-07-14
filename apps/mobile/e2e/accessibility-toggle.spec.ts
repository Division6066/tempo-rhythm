import { expect, test } from "@playwright/test";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";

const port = 8097;
const baseUrl = `http://127.0.0.1:${port}`;
const comfortableReadingKey = "tempo.comfortableReading";

let server: ChildProcessWithoutNullStreams | undefined;
let serverOutput = "";

test.setTimeout(180_000);

async function waitForServer(): Promise<void> {
  const deadline = Date.now() + 120_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok || response.status === 404) {
        return;
      }
    } catch {
      // Expo is still booting.
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(
    `Timed out waiting for Expo web server.\n\nExpo output:\n${serverOutput}`,
  );
}

test.beforeAll(async ({}, testInfo) => {
  testInfo.setTimeout(180_000);

  server = spawn(
    "bun",
    ["run", "web", "--", "--port", String(port), "--host", "localhost"],
    {
      cwd: "apps/mobile",
      env: {
        ...process.env,
        CI: "1",
        EXPO_PUBLIC_CONVEX_URL:
          process.env.EXPO_PUBLIC_CONVEX_URL ??
          "https://example-test.convex.cloud",
        EXPO_NO_TELEMETRY: "1",
      },
    },
  );
  server.stdout.on("data", (chunk: Buffer) => {
    serverOutput += chunk.toString();
  });
  server.stderr.on("data", (chunk: Buffer) => {
    serverOutput += chunk.toString();
  });

  await waitForServer();
});

test.afterAll(() => {
  if (server && !server.killed) {
    server.kill();
  }
});

test("comfortable reading increases root type and persists", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(`${baseUrl}/settings/accessibility`);
  await page.evaluate((key) => localStorage.removeItem(key), comfortableReadingKey);
  await page.reload();

  const initialFontSize = await page.evaluate(() =>
    Number.parseFloat(getComputedStyle(document.documentElement).fontSize),
  );

  await page
    .getByRole("switch", { name: "Comfortable reading" })
    .click();

  await expect(page.locator("html")).toHaveAttribute(
    "data-comfortable-reading",
    "on",
  );

  const comfortableFontSize = await page.evaluate(() =>
    Number.parseFloat(getComputedStyle(document.documentElement).fontSize),
  );
  const expectedStep = await page.evaluate(() =>
    Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--tempo-reading-font-step-px",
      ),
    ),
  );

  expect(comfortableFontSize).toBe(initialFontSize + expectedStep);

  await page.reload();
  await expect(
    page.getByRole("switch", { name: "Comfortable reading" }),
  ).toBeChecked();
  await expect(page.locator("html")).toHaveAttribute(
    "data-comfortable-reading",
    "on",
  );
});

test("reduced motion users get reduced accessible motion tokens by default", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${baseUrl}/settings/accessibility`);

  await expect(page.locator("html")).toHaveAttribute(
    "data-accessible-motion",
    "reduced",
  );

  const motionDuration = await page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue("--tempo-reading-motion-duration")
      .trim(),
  );

  expect(motionDuration).toBe("0ms");
});

import { expect, test, type Page } from "@playwright/test";
import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";

const mobileRoot = path.join(process.cwd(), "apps/mobile");
const port = Number(process.env.MOBILE_E2E_PORT ?? "8099");
const baseUrl = `http://127.0.0.1:${port}`;

let server: ChildProcess | undefined;
let serverOutput = "";

test.setTimeout(120_000);
test.use({ channel: "chrome" });

async function waitForExpo(): Promise<void> {
  const deadline = Date.now() + 120_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) {
        return;
      }
    } catch {
      // Metro is still booting.
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(`Expo web server did not start at ${baseUrl}`);
}

async function forceRtl(page: Page): Promise<void> {
  await page.addInitScript(() => {
    document.documentElement.setAttribute("dir", "rtl");
  });
  await page.evaluate(() => {
    document.documentElement.setAttribute("dir", "rtl");
  });
}

function tabLabel(page: Page, name: string) {
  return page.getByText(name, { exact: true }).last();
}

test.beforeAll(async ({ browserName: _browserName }, testInfo) => {
  testInfo.setTimeout(120_000);

  server = spawn(
    "bunx",
    ["expo", "start", "--web", "--port", String(port), "--clear"],
    {
      cwd: mobileRoot,
      env: {
        ...process.env,
        BROWSER: "none",
        CI: "1",
        EXPO_NO_TELEMETRY: "1",
        EXPO_PUBLIC_CONVEX_URL: "https://example.convex.cloud",
      },
      stdio: "pipe",
    }
  );

  server.stdout?.on("data", (chunk: Buffer) => {
    serverOutput += chunk.toString();
  });
  server.stderr?.on("data", (chunk: Buffer) => {
    serverOutput += chunk.toString();
  });

  await waitForExpo();
});

test.afterAll(() => {
  server?.kill();
});

test("RTL tab navigation preserves tap targets and visual order", async ({
  page,
}, testInfo) => {
  await testInfo.attach("expo-output", {
    body: serverOutput,
    contentType: "text/plain",
  });
  await page.goto(`${baseUrl}/today`);
  await forceRtl(page);

  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByText("Today", { exact: true }).first()).toBeVisible();

  const tabNames = ["Today", "Tasks", "Notes", "Coach"];
  const tabBoxes = await Promise.all(
    tabNames.map(async (name) => {
      const box = await tabLabel(page, name).boundingBox();
      expect(box, `${name} tab has a tap target`).not.toBeNull();
      return box;
    })
  );

  expect(tabBoxes[0]!.x).toBeGreaterThan(tabBoxes[1]!.x);
  expect(tabBoxes[1]!.x).toBeGreaterThan(tabBoxes[2]!.x);
  expect(tabBoxes[2]!.x).toBeGreaterThan(tabBoxes[3]!.x);

  await tabLabel(page, "Tasks").click();
  await expect(page).toHaveURL(/\/tasks$/);
  await expect(page.getByText("Tasks", { exact: true }).first()).toBeVisible();

  await tabLabel(page, "Notes").click();
  await expect(page).toHaveURL(/\/notes$/);
  await expect(page.getByText("Notes", { exact: true }).first()).toBeVisible();

  await tabLabel(page, "Coach").click();
  await expect(page).toHaveURL(/\/coach$/);
  await expect(page.getByText("Coach", { exact: true }).first()).toBeVisible();

  await tabLabel(page, "Today").click();
  await expect(page).toHaveURL(/\/today$/);
  await expect(page.getByText("Today", { exact: true }).first()).toBeVisible();
});

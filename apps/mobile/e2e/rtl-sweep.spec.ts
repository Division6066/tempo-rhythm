// @ts-nocheck
import { expect, test } from "@playwright/test";
import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { bidiFixture, rtlLanguage, rtlSweepRoutes } from "./routes";

const currentFile = fileURLToPath(import.meta.url);
const e2eDir = path.dirname(currentFile);
const mobileRoot = path.resolve(e2eDir, "..");
const appRoot = path.join(mobileRoot, "app");
const port = Number(process.env.RTL_SWEEP_PORT ?? "19066");
const baseUrl = `http://127.0.0.1:${port}`;
const routeFilePattern = /\.(tsx|ts|jsx|js)$/;
const ignoredRouteFileNames = new Set(["_layout.tsx", "_layout.ts", "_layout.jsx", "_layout.js"]);

let serverProcess: ReturnType<typeof spawn> | undefined;
let serverOutput = "";

test.use({
  locale: rtlLanguage.locale,
});

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  serverProcess = spawn(
    "bun",
    ["run", "web", "--", "--port", String(port), "--host", "127.0.0.1", "--non-interactive"],
    {
      cwd: mobileRoot,
      env: {
        ...process.env,
        BROWSER: "none",
        CI: "1",
        EXPO_NO_TELEMETRY: "1",
        EXPO_PUBLIC_CONVEX_URL:
          process.env.EXPO_PUBLIC_CONVEX_URL ?? "https://example.convex.cloud",
      },
      stdio: ["ignore", "pipe", "pipe"],
    }
  );

  serverProcess.stdout?.on("data", (chunk: Buffer) => {
    serverOutput += chunk.toString();
  });
  serverProcess.stderr?.on("data", (chunk: Buffer) => {
    serverOutput += chunk.toString();
  });

  await waitForServer();
});

test.afterAll(() => {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
  }
});

test("route manifest matches current Expo Router screen files", async () => {
  const actualRouteFiles = await listRouteFiles(appRoot);
  const manifestRouteFiles = rtlSweepRoutes
    .map((route) => route.sourceFile)
    .toSorted();

  expect(manifestRouteFiles).toEqual(actualRouteFiles);
});

for (const route of rtlSweepRoutes) {
  test(`${route.id} renders in Hebrew RTL`, async ({ page }, testInfo) => {
    await page.addInitScript((language) => {
      Object.defineProperty(window.navigator, "language", {
        configurable: true,
        get: () => language.locale,
      });
      Object.defineProperty(window.navigator, "languages", {
        configurable: true,
        get: () => [language.locale, language.lang, "en-US"],
      });
      document.documentElement.lang = language.lang;
      document.documentElement.dir = language.dir;
    }, rtlLanguage);

    await page.goto(`${baseUrl}${route.path}`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {
      // Expo web keeps a dev websocket open; DOM readiness is enough for this sweep.
    });

    await expect
      .poll(() => page.evaluate(() => document.documentElement.getAttribute("dir")))
      .toBe(rtlLanguage.dir);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.getAttribute("lang")))
      .toBe(rtlLanguage.lang);

    const fixtureResult = await page.evaluate((fixture) => {
      const element = document.createElement("p");
      element.dataset.testid = fixture.id;
      element.dir = "rtl";
      element.lang = "he";
      element.textContent = fixture.text;
      document.body.append(element);

      return {
        direction: window.getComputedStyle(element).direction,
        text: element.textContent,
      };
    }, bidiFixture);

    expect(fixtureResult).toEqual({
      direction: rtlLanguage.dir,
      text: bidiFixture.text,
    });

    const screenshotPath = testInfo.outputPath(`he-rtl-${route.id}.png`);
    await page.screenshot({ fullPage: true, path: screenshotPath });
    await testInfo.attach(`he-rtl-${route.id}`, {
      contentType: "image/png",
      path: screenshotPath,
    });
  });
}

async function waitForServer(): Promise<void> {
  const startedAt = Date.now();
  let lastError: unknown;

  while (Date.now() - startedAt < 120_000) {
    if (serverProcess?.exitCode !== null && serverProcess?.exitCode !== undefined) {
      throw new Error(
        `Expo web exited early with code ${serverProcess.exitCode}.\n${serverOutput}`
      );
    }

    try {
      const response = await fetch(baseUrl);
      if (response.ok || response.status === 404) {
        return;
      }
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(
    `Expo web did not become ready at ${baseUrl}.\nLast error: ${String(
      lastError
    )}\n${serverOutput}`
  );
}

async function listRouteFiles(rootDir: string): Promise<string[]> {
  const entries = await readdir(rootDir, { withFileTypes: true });
  const routeFiles = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(rootDir, entry.name);

      if (entry.isDirectory()) {
        return await listRouteFiles(absolutePath);
      }

      if (
        !entry.isFile() ||
        ignoredRouteFileNames.has(entry.name) ||
        !routeFilePattern.test(entry.name)
      ) {
        return [];
      }

      return [toManifestPath(absolutePath)];
    })
  );

  return routeFiles.flat().toSorted();
}

function toManifestPath(absolutePath: string): string {
  return path.relative(mobileRoot, absolutePath).split(path.sep).join("/");
}

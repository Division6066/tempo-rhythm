// @ts-nocheck
const { spawn } = require("node:child_process");
const { readdir } = require("node:fs/promises");
const path = require("node:path");

const { bidiFixture, rtlLanguage, rtlSweepRoutes } = require("./routes");

const e2eDir = __dirname;
const mobileRoot = path.resolve(e2eDir, "..");
const appRoot = path.join(mobileRoot, "app");
const defaultPort = 19_000 + (process.pid % 1_000);
const port = Number(process.env.RTL_SWEEP_PORT ?? String(defaultPort));
const baseUrl = `http://127.0.0.1:${port}`;
const routeFilePattern = /\.(tsx|ts|jsx|js)$/;
const ignoredRouteFileNames = new Set(["_layout.tsx", "_layout.ts", "_layout.jsx", "_layout.js"]);
const isPlaywrightRun = process.argv.some((arg) => arg.includes("playwright"));

let serverProcess: ReturnType<typeof spawn> | undefined;
let serverOutput = "";

if (isPlaywrightRun) {
  const { expect, test } = require("@playwright/test");

  test.use({
    locale: rtlLanguage.locale,
  });

  test.setTimeout(180_000);

  test.beforeAll(async ({}, testInfo) => {
    testInfo.setTimeout(180_000);

    serverProcess = spawn(
      "bun",
      ["run", "web", "--", "--port", String(port)],
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

  test("all manifest routes render in Hebrew RTL", async ({ page }, testInfo) => {
    const failures: string[] = [];

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

    for (const route of rtlSweepRoutes) {
      await page.goto(`${baseUrl}${route.path}`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {
        // Expo web keeps a dev websocket open; DOM readiness is enough for this sweep.
      });

      const result = await page.evaluate((fixture) => {
        const element = document.createElement("p");
        element.dataset.testid = fixture.id;
        element.dir = "rtl";
        element.lang = "he";
        element.textContent = fixture.text;
        document.body.append(element);

        return {
          fixtureDirection: window.getComputedStyle(element).direction,
          fixtureText: element.textContent,
          htmlDir: document.documentElement.getAttribute("dir"),
          htmlLang: document.documentElement.getAttribute("lang"),
        };
      }, bidiFixture);

      const screenshotPath = testInfo.outputPath(`he-rtl-${route.id}.png`);
      await page.screenshot({ fullPage: true, path: screenshotPath });
      await testInfo.attach(`he-rtl-${route.id}`, {
        contentType: "image/png",
        path: screenshotPath,
      });

      if (result.htmlDir !== rtlLanguage.dir) {
        failures.push(`${route.id}: expected html dir=rtl, received ${result.htmlDir}`);
      }
      if (result.htmlLang !== rtlLanguage.lang) {
        failures.push(`${route.id}: expected html lang=he, received ${result.htmlLang}`);
      }
      if (result.fixtureDirection !== rtlLanguage.dir) {
        failures.push(
          `${route.id}: expected bidi fixture direction=rtl, received ${result.fixtureDirection}`
        );
      }
      if (result.fixtureText !== bidiFixture.text) {
        failures.push(`${route.id}: bidi fixture text did not round-trip`);
      }
    }

    expect(failures).toEqual([]);
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

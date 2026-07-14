import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";

const port = 19087;
const baseUrl = `http://127.0.0.1:${port}`;

let server: ChildProcess | undefined;

async function waitForServer(): Promise<void> {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) {
        return;
      }
    } catch {
      // Keep polling while Metro compiles the web bundle.
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error(`Expo web server did not become ready at ${baseUrl}`);
}

if (!("Bun" in globalThis)) {
  const { test, expect } =
    require("@playwright/test") as typeof import("@playwright/test");

  test.beforeAll(async () => {
    server = spawn("bun", ["expo", "start", "--web", "--port", String(port)], {
      cwd: "apps/mobile",
      env: {
        ...process.env,
        CI: "1",
        EXPO_NO_TELEMETRY: "1",
        EXPO_PUBLIC_CONVEX_URL: "https://example.convex.cloud",
      },
      stdio: "inherit",
    });

    server.once("exit", (code, signal) => {
      if (code !== null && code !== 0) {
        throw new Error(`Expo web server exited with code ${code}`);
      }
      if (signal) {
        throw new Error(`Expo web server exited with signal ${signal}`);
      }
    });

    await waitForServer();
  });

  test.afterAll(async () => {
    if (!server?.pid || server.killed) {
      return;
    }
    server.kill("SIGTERM");
    await Promise.race([
      once(server, "exit"),
      new Promise((resolve) => setTimeout(resolve, 5_000)),
    ]);
  });

  test("settings language toggles direction immediately and persists", async ({
    page,
  }) => {
    await page.goto(`${baseUrl}/settings`);

    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    await expect(page.getByTestId("settings-about-version")).toContainText(
      "1.0.0",
    );
    await expect(page.getByText("settings.about.dojoCredit")).toBeVisible();

    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");

    await page.getByRole("button", { name: "עברית" }).click();
    await expect(
      page.evaluate(() => window.localStorage.getItem("tempo:prefs:v1")),
    ).resolves.toContain('"language":"he"');
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("button", { name: "עברית" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await expect(
      page.evaluate(() => window.localStorage.getItem("tempo:prefs:v1")),
    ).resolves.toContain('"language":"he"');
  });
}

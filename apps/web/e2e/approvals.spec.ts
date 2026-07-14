import { type ChildProcess, spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const port = Number(process.env.APPROVALS_E2E_PORT ?? 3377);
const baseUrl = `http://127.0.0.1:${port}`;
const repoRoot = process.env.PWD ?? process.cwd();
const webRoot = `${repoRoot}/apps/web`;
const screenshotPath = `${webRoot}/e2e/approvals-pending.png`;

declare global {
  interface Window {
    __approvalsE2e?: {
      getRowStatus: (id: string) => string | null;
    };
  }
}

let server: ChildProcess | undefined;

async function waitForServer() {
  const deadline = Date.now() + 45_000;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/approvals`);
      if (response.ok) {
        return;
      }
      lastError = new Error(`Unexpected status ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for ${baseUrl}/approvals: ${String(lastError)}`);
}

test.beforeAll(async () => {
  server = spawn("bun", ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", String(port)], {
    cwd: webRoot,
    env: {
      ...process.env,
      APPROVALS_E2E_FIXTURE: "1",
      NEXT_PUBLIC_APPROVALS_E2E_FIXTURE: "1",
      NEXT_PUBLIC_CONVEX_URL: "https://approvals-e2e.convex.cloud",
    },
    stdio: "inherit",
  });

  await waitForServer();
});

test.afterAll(async () => {
  if (server?.pid && !server.killed) {
    server.kill("SIGTERM");
  }
});

test("renders pending approval and approves it", async ({ page }) => {
  await page.goto(`${baseUrl}/approvals`);

  await expect(page.getByRole("heading", { name: "Approvals" })).toBeVisible();
  await expect(page.getByText("Run connector sync")).toBeVisible();
  await expect(page.getByText("$0.18")).toBeVisible();
  await expect(page.getByText("Spend ceiling")).toBeVisible();

  await mkdir(`${webRoot}/e2e`, { recursive: true });
  await page.screenshot({ path: screenshotPath, fullPage: true });

  await page.getByRole("button", { name: "Approve Run connector sync" }).click();

  await expect(page.getByText("Nothing needs you.")).toBeVisible();
  await expect(page.getByText("Run connector sync")).toBeHidden();

  await expect
    .poll(() =>
      page.evaluate(() => window.__approvalsE2e?.getRowStatus("approval_fixture") ?? null)
    )
    .toBe("approved");
});

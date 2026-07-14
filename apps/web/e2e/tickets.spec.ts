import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { request as httpRequest } from "node:http";
import { test, expect, type Page } from "@playwright/test";

const port = Number(process.env.TICKETS_E2E_PORT ?? 4100);
const baseUrl = `http://localhost:${port}`;
const artifactsDir = join(process.cwd(), "apps/web/e2e/artifacts");

let server: ChildProcessWithoutNullStreams | undefined;

async function canReachServer() {
  return new Promise<boolean>((resolve) => {
    const req = httpRequest(baseUrl, { method: "GET", timeout: 500 }, (res) => {
      res.resume();
      resolve(true);
    });
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
    req.on("error", () => resolve(false));
    req.end();
  });
}

async function waitForServer() {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 30_000) {
    if (await canReachServer()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${baseUrl}`);
}

test.beforeAll(async () => {
  await mkdir(artifactsDir, { recursive: true });

  if (await canReachServer()) {
    return;
  }

  server = spawn("bun", ["run", "dev", "--", "-p", String(port)], {
    cwd: join(process.cwd(), "apps/web"),
    env: {
      ...process.env,
      NEXT_PUBLIC_CONVEX_URL:
        process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://example.convex.cloud",
    },
  });

  server.stdout.on("data", (chunk) => process.stdout.write(chunk));
  server.stderr.on("data", (chunk) => process.stderr.write(chunk));

  await waitForServer();
});

test.afterAll(async () => {
  if (server) {
    server.kill("SIGTERM");
  }
});

async function gotoTickets(page: Page, fixture: "aw34" | "empty") {
  await page.goto(`${baseUrl}/tickets?fixture=${fixture}`);
  await page.waitForLoadState("networkidle");
}

test("renders six tickets in the correct state columns", async ({ page }) => {
  await gotoTickets(page, "aw34");

  await expect(page.getByRole("heading", { name: "Ticket board" })).toBeVisible();
  await expect(page.getByTestId("column-backlog")).toHaveAttribute("data-count", "2");
  await expect(page.getByTestId("column-ready")).toHaveAttribute("data-count", "1");
  await expect(page.getByTestId("column-in-progress")).toHaveAttribute("data-count", "1");
  await expect(page.getByTestId("column-review")).toHaveAttribute("data-count", "1");
  await expect(page.getByTestId("column-done")).toHaveAttribute("data-count", "1");

  await expect(page.getByTestId("column-backlog").getByTestId("ticket-card")).toHaveCount(2);
  await expect(page.getByTestId("column-ready").getByTestId("ticket-card")).toHaveCount(1);
  await expect(page.getByTestId("column-in-progress").getByTestId("ticket-card")).toHaveCount(1);
  await expect(page.getByTestId("column-review").getByTestId("ticket-card")).toHaveCount(1);
  await expect(page.getByTestId("column-done").getByTestId("ticket-card")).toHaveCount(1);

  await page.screenshot({
    path: join(artifactsDir, "tickets-board.png"),
    fullPage: true,
  });
});

test("detail pane shows dependency links and evidence exit codes", async ({ page }) => {
  await gotoTickets(page, "aw34");

  await page.getByRole("button", { name: /open aw-34/i }).click();

  const detail = page.getByTestId("ticket-detail");
  await expect(detail.getByRole("heading", { name: "AW-34" })).toBeVisible();
  await expect(detail.getByRole("link", { name: "AW-03" })).toBeVisible();
  await expect(detail.getByRole("link", { name: "AW-32" })).toBeVisible();
  await expect(detail.getByTestId("evidence-entry")).toHaveCount(2);
  await expect(detail.getByText("bun install")).toBeVisible();
  await expect(detail.getByText("exit 0")).toBeVisible();
  await expect(detail.getByText("bunx playwright test apps/web/e2e/tickets.spec.ts")).toBeVisible();
  await expect(detail.getByText("exit 1")).toBeVisible();
});

test("empty project renders an empty state", async ({ page }) => {
  await gotoTickets(page, "empty");

  await expect(page.getByRole("heading", { name: "No tickets here yet" })).toBeVisible();
  await expect(page.getByText("When a project has tickets, they will appear by state here.")).toBeVisible();
  await page.screenshot({
    path: join(artifactsDir, "tickets-empty.png"),
    fullPage: true,
  });
});

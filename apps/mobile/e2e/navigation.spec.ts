import { expect, test, type Page } from "playwright/test";
import { spawn, type ChildProcess } from "node:child_process";
import { resolve } from "node:path";

const port = 8099;
const baseUrl = `http://127.0.0.1:${port}`;
const mobileDir = resolve(process.cwd(), "apps/mobile");

const routes = [
  { path: "/today", testId: "today-empty-state", title: "Today" },
  { path: "/tasks", testId: "tasks-empty-state", title: "Tasks" },
  { path: "/notes", testId: "notes-empty-state", title: "Notes" },
  { path: "/coach", testId: "coach-empty-state", title: "Coach" },
  { path: "/capture", testId: "capture-empty-state", title: "Capture" },
  { path: "/calendar", testId: "calendar-empty-state", title: "Calendar" },
  { path: "/habits", testId: "habits-empty-state", title: "Habits" },
  { path: "/journal", testId: "journal-empty-state", title: "Journal" },
  { path: "/routines", testId: "routines-empty-state", title: "Routines" },
  { path: "/settings", testId: "settings-empty-state", title: "Settings" },
  { path: "/templates", testId: "templates-empty-state", title: "Templates" },
];

let server: ChildProcess | undefined;

async function waitForExpoWeb(): Promise<void> {
  const deadline = Date.now() + 120_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok || response.status === 404) {
        return;
      }
    } catch {
      // Server is still booting.
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(`Expo web did not start at ${baseUrl}`);
}

async function assertEmptyState(page: Page, route: (typeof routes)[number]) {
  await page.goto(`${baseUrl}${route.path}`);
  await page.waitForLoadState("networkidle");

  const emptyState = page.getByTestId(route.testId);
  await expect(emptyState).toBeVisible();
  await expect(emptyState.getByText(route.title, { exact: true })).toBeVisible();
  await expect(emptyState.getByText("Empty state", { exact: true })).toBeVisible();
}

test.beforeAll(async () => {
  server = spawn("bun", ["run", "web", "--port", String(port), "--localhost"], {
    cwd: mobileDir,
    env: {
      ...process.env,
      CI: "1",
      EXPO_PUBLIC_CONVEX_URL: "https://example.convex.cloud",
      NO_COLOR: "1",
    },
    stdio: "inherit",
  });

  await waitForExpoWeb();
});

test.afterAll(() => {
  server?.kill("SIGTERM");
});

test("empty-state routes render named styled components", async ({ page }) => {
  for (const route of routes) {
    await assertEmptyState(page, route);
  }
});

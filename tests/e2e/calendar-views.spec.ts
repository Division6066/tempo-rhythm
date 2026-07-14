import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { request } from "node:http";
import path from "node:path";
import { expect, test } from "@playwright/test";

const port = 3211;
const fallbackBaseUrl = `http://127.0.0.1:${port}`;
let baseUrl = fallbackBaseUrl;
let calendarUrl = `${baseUrl}/calendar`;
const readyTimeoutMs = 45_000;

let server: ChildProcessWithoutNullStreams | undefined;
let ownsServer = false;

async function canReachCalendar(url: string): Promise<boolean> {
  return await new Promise<boolean>((resolve) => {
    const req = request(`${url}/calendar`, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk: string) => {
        body += chunk;
      });
      res.on("end", () => {
        resolve(res.statusCode === 200 && body.includes("One source for every calendar view"));
      });
    });
    req.on("error", () => resolve(false));
    req.setTimeout(1_000, () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

async function waitForServer(url: string): Promise<void> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < readyTimeoutMs) {
    if (await canReachCalendar(url)) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Next dev server did not become ready at ${url}/calendar`);
}

test.beforeAll(async () => {
  const reusableBaseUrl = process.env.CALENDAR_E2E_BASE_URL ?? "http://127.0.0.1:3212";
  if (await canReachCalendar(reusableBaseUrl)) {
    baseUrl = reusableBaseUrl;
    calendarUrl = `${baseUrl}/calendar`;
    return;
  }

  ownsServer = true;
  server = spawn("bun", ["run", "dev", "--hostname", "127.0.0.1", "--port", String(port)], {
    cwd: path.join(process.cwd(), "apps/web"),
    env: {
      ...process.env,
      TEMPO_E2E_PUBLIC_CALENDAR: "1",
      NEXT_PUBLIC_CONVEX_URL:
        process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://precious-wildcat-890.convex.cloud",
    },
    stdio: "pipe",
  });

  server.stdout.on("data", (chunk) => process.stdout.write(chunk));
  server.stderr.on("data", (chunk) => process.stderr.write(chunk));

  await waitForServer(baseUrl);
});

test.afterAll(() => {
  if (ownsServer && server && !server.killed) {
    server.kill("SIGTERM");
  }
});

test("event created in Day view appears in Week and Month views for that date", async ({
  page,
}) => {
  await page.goto(calendarUrl);
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await page.getByRole("textbox", { name: "Event title" }).fill("Boundary planning call");
  await page.getByLabel("Event date").fill("2026-08-01");
  await page.getByRole("button", { name: "Add event" }).click();

  await expect(page.getByTestId("day-events")).toContainText("Boundary planning call");

  await page.getByRole("button", { name: "Week" }).click();
  await expect(page.getByTestId("week-events")).toContainText("Boundary planning call");

  await page.getByRole("button", { name: "Month" }).click();
  await expect(page.getByTestId("month-events")).toContainText("Boundary planning call");
});

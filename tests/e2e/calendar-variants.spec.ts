import { expect, test } from "@playwright/test";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

test.describe("calendar variants", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/calendar");
    await page.evaluate(() => window.localStorage.removeItem("tempo.calendar.demoEvents.v1"));
    await page.reload();
  });

  test("loads today, day, week, month, and planner variants from one event source", async ({
    page,
  }) => {
    await expect(
      page.getByRole("main").getByRole("heading", { name: "Calendar" }),
    ).toBeVisible();
    await expect(page.getByTestId("calendar-event-source")).toContainText(
      "Shared event source",
    );

    for (const view of ["Today agenda", "Day", "Week", "Month", "Planner"]) {
      await page.getByRole("tab", { name: view, exact: true }).click();
      await expect(page.getByTestId("calendar-active-view")).toContainText(view);
      await expect(page.getByText("Focus Sprint")).toBeVisible();
    }

    await page.getByRole("tab", { name: "Month", exact: true }).click();
    await expect(page.getByTestId("calendar-month-grid")).toBeVisible();
    await expect(page.getByTestId("calendar-month-grid").locator("button")).toHaveCount(42);
  });

  test("turns a task into a calendar block and keeps keyboard reschedules after reload", async ({
    page,
  }) => {
    const taskTitle = `Pay rent ${Date.now()}`;
    const block = page.getByTestId(`calendar-event-${slugify(taskTitle)}`);

    await page.getByLabel("Task title").fill(taskTitle);
    await page.getByLabel("Start time").fill("10:00");
    await page.getByRole("button", { name: "Turn task into block" }).click();

    await expect(block).toContainText(taskTitle);
    await expect(block).toContainText("10:00");

    await block.focus();
    await page.keyboard.press("ArrowDown");
    await expect(block).toContainText("10:30");

    await page.reload();
    await expect(block).toContainText("10:30");
  });

  test("shows proposal gate copy before auto-schedule creates anything", async ({ page }) => {
    await page.getByRole("button", { name: "Preview auto-schedule" }).click();

    await expect(page.getByRole("dialog", { name: "Auto-schedule proposal" })).toBeVisible();
    await expect(page.getByText("Nothing moved yet.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Accept proposal" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reject" })).toBeVisible();
  });
});

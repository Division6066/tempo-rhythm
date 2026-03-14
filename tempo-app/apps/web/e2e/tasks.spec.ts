import { test, expect } from "@playwright/test";

test.describe("Task Management (authenticated)", () => {
  test.skip(true, "Requires authenticated session with Convex Auth");

  test("today view renders with priority sections", async ({ page }) => {
    await page.goto("/today");
    await expect(page.locator("h1")).toContainText("Today");
    await expect(page.locator("[class*='bg-muted']").first()).toBeVisible();
  });

  test("inbox shows quick capture form", async ({ page }) => {
    await page.goto("/inbox");
    await expect(page.getByText("Inbox")).toBeVisible();
    await expect(page.getByPlaceholder("Quick capture...")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add" })).toBeVisible();
  });

  test("inbox quick add creates task", async ({ page }) => {
    await page.goto("/inbox");
    const taskTitle = `Test Task ${Date.now()}`;
    await page.getByPlaceholder("Quick capture...").fill(taskTitle);
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 5000 });
  });

  test("inbox brain dump button opens textarea", async ({ page }) => {
    await page.goto("/inbox");
    await page.getByText("Brain Dump").click();
    await expect(page.getByPlaceholder(/messy thoughts/)).toBeVisible();
    await expect(page.getByText("Extract Tasks")).toBeVisible();
  });

  test("task detail page loads", async ({ page }) => {
    await page.goto("/inbox");
    const firstTask = page.locator("[class*='glass']").first();
    if (await firstTask.isVisible()) {
      await firstTask.click();
      await expect(page).toHaveURL(/\/tasks\//);
      await expect(page.getByText("Status")).toBeVisible();
      await expect(page.getByText("Priority")).toBeVisible();
    }
  });

  test("task detail has AI chunk button", async ({ page }) => {
    await page.goto("/inbox");
    const firstTask = page.locator("[class*='glass']").first();
    if (await firstTask.isVisible()) {
      await firstTask.click();
      await expect(page.getByText("Chunk this task")).toBeVisible();
    }
  });

  test("task detail has recurrence options", async ({ page }) => {
    await page.goto("/inbox");
    const firstTask = page.locator("[class*='glass']").first();
    if (await firstTask.isVisible()) {
      await firstTask.click();
      await expect(page.getByText("Recurrence")).toBeVisible();
    }
  });

  test("quick capture modal opens and closes", async ({ page }) => {
    await page.goto("/");
    await page.locator("button:has(svg)").filter({ hasText: "" }).last().click();
    await expect(page.getByText("Quick Capture")).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByText("Quick Capture")).not.toBeVisible();
  });
});

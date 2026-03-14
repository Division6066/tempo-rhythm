import { test, expect } from "@playwright/test";

test.describe("Calendar (authenticated)", () => {
  test.skip(true, "Requires authenticated session with Convex Auth");

  test("calendar page renders with view modes", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.locator("h1")).toContainText("Calendar");
    await expect(page.getByText("day")).toBeVisible();
    await expect(page.getByText("week")).toBeVisible();
    await expect(page.getByText("month")).toBeVisible();
  });

  test("calendar has today button", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByRole("button", { name: "Today" })).toBeVisible();
  });

  test("calendar view mode switching works", async ({ page }) => {
    await page.goto("/calendar");
    await page.getByText("month").click();
    await expect(page.getByText("Mon")).toBeVisible();
    await expect(page.getByText("Tue")).toBeVisible();

    await page.getByText("day").click();
    await page.waitForTimeout(300);
  });

  test("clicking a day opens event creation form", async ({ page }) => {
    await page.goto("/calendar");
    await page.getByText("month").click();
    const dayCell = page.locator("[class*='min-h-']").first();
    await dayCell.click();
    await expect(page.getByText("New Event")).toBeVisible();
    await expect(page.getByPlaceholder("Event title")).toBeVisible();
  });

  test("event creation form has time inputs", async ({ page }) => {
    await page.goto("/calendar");
    await page.getByText("month").click();
    const dayCell = page.locator("[class*='min-h-']").first();
    await dayCell.click();
    await expect(page.getByText("Start")).toBeVisible();
    await expect(page.getByText("End")).toBeVisible();
  });

  test("event form closes on cancel", async ({ page }) => {
    await page.goto("/calendar");
    await page.getByText("month").click();
    const dayCell = page.locator("[class*='min-h-']").first();
    await dayCell.click();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByText("New Event")).not.toBeVisible();
  });
});

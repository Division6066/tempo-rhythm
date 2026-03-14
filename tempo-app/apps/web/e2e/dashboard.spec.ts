import { test, expect } from "@playwright/test";

test.describe("Dashboard (authenticated)", () => {
  test.skip(true, "Requires authenticated session with Convex Auth");

  test("dashboard shows greeting and progress", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText(/Good (morning|afternoon|evening)/);
    await expect(page.getByText("Today's Progress")).toBeVisible();
  });

  test("dashboard shows quick stats cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Today")).toBeVisible();
    await expect(page.getByText("Inbox")).toBeVisible();
    await expect(page.getByText("Projects")).toBeVisible();
  });

  test("dashboard has AI assistant link", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("AI Assistant")).toBeVisible();
    await expect(page.getByText("Chat, plan, or chunk tasks")).toBeVisible();
  });

  test("dashboard has Up Next section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Up Next")).toBeVisible();
  });

  test("dashboard Plan my day button navigates to plan", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Plan my day" }).click();
    await expect(page).toHaveURL(/\/plan/);
  });

  test("bottom navigation works", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Today").click();
    await expect(page).toHaveURL(/\/today/);

    await page.getByText("Calendar").click();
    await expect(page).toHaveURL(/\/calendar/);

    await page.getByText("Inbox").click();
    await expect(page).toHaveURL(/\/inbox/);

    await page.locator("nav").getByText("Home").click();
    await expect(page).toHaveURL("/");
  });
});

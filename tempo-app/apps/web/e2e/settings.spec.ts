import { test, expect } from "@playwright/test";

test.describe("Settings (authenticated)", () => {
  test.skip(true, "Requires authenticated session with Convex Auth");

  test("settings page renders", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("h1")).toContainText("Settings");
    await expect(page.getByText("ADHD Mode")).toBeVisible();
  });

  test("settings has routine section", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByText("Wake Time")).toBeVisible();
    await expect(page.getByText("Sleep Time")).toBeVisible();
  });

  test("settings has focus sessions section", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByText("Focus Sessions")).toBeVisible();
    await expect(page.getByText("Focus (min)")).toBeVisible();
    await expect(page.getByText("Break")).toBeVisible();
  });

  test("settings has save button", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("button", { name: "Save Settings" })).toBeVisible();
  });

  test("settings has navigation links", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("link", { name: "Projects" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Notes" })).toBeVisible();
    await expect(page.getByText("Templates")).toBeVisible();
    await expect(page.getByText("Filters")).toBeVisible();
    await expect(page.getByText("Calendar")).toBeVisible();
    await expect(page.getByText("AI Chat")).toBeVisible();
    await expect(page.getByRole("link", { name: "Daily Plan" })).toBeVisible();
  });

  test("settings has command bar tip", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByText("Cmd+K")).toBeVisible();
  });
});

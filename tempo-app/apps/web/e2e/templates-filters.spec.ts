import { test, expect } from "@playwright/test";

test.describe("Templates (authenticated)", () => {
  test.skip(true, "Requires authenticated session with Convex Auth");

  test("templates page renders", async ({ page }) => {
    await page.goto("/templates");
    await expect(page.locator("h1")).toContainText("Templates");
    await expect(page.getByText("New Template")).toBeVisible();
  });

  test("templates shows built-in templates after seeding", async ({ page }) => {
    await page.goto("/templates");
    await page.waitForTimeout(2000);
    await expect(page.getByText("Daily Note")).toBeVisible();
    await expect(page.getByText("Meeting Notes")).toBeVisible();
    await expect(page.getByText("Weekly Review")).toBeVisible();
    await expect(page.getByText("Project Brief")).toBeVisible();
  });

  test("new template form opens", async ({ page }) => {
    await page.goto("/templates");
    await page.getByText("New Template").click();
    await expect(page.getByText("Create Template")).toBeVisible();
    await expect(page.getByPlaceholder("Template name")).toBeVisible();
  });
});

test.describe("Filters (authenticated)", () => {
  test.skip(true, "Requires authenticated session with Convex Auth");

  test("filters page renders", async ({ page }) => {
    await page.goto("/filters");
    await expect(page.locator("h1")).toContainText("Filters");
    await expect(page.getByText("New Filter")).toBeVisible();
  });

  test("filter builder opens", async ({ page }) => {
    await page.goto("/filters");
    await page.getByText("New Filter").click();
    await expect(page.getByText("Filter Builder")).toBeVisible();
    await expect(page.getByText("Add Condition")).toBeVisible();
  });

  test("filter builder adds conditions", async ({ page }) => {
    await page.goto("/filters");
    await page.getByText("New Filter").click();
    await page.getByText("Add Condition").click();
    await expect(page.locator("select").first()).toBeVisible();
    await expect(page.getByPlaceholder("Value")).toBeVisible();
    await expect(page.getByPlaceholder("Filter name")).toBeVisible();
  });
});

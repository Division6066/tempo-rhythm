import { test, expect } from "@playwright/test";

test.describe("Projects (authenticated)", () => {
  test.skip(true, "Requires authenticated session with Convex Auth");

  test("projects page renders", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.locator("h1")).toContainText("Projects");
    await expect(page.getByText("New Project")).toBeVisible();
  });

  test("create project dialog opens", async ({ page }) => {
    await page.goto("/projects");
    await page.getByText("New Project").click();
    await expect(page.getByText("Create Project")).toBeVisible();
    await expect(page.getByPlaceholder("Project name")).toBeVisible();
    await expect(page.getByText("Color")).toBeVisible();
  });

  test("create project dialog closes on backdrop click", async ({ page }) => {
    await page.goto("/projects");
    await page.getByText("New Project").click();
    await expect(page.getByText("Create Project")).toBeVisible();
    await page.locator(".fixed.inset-0").click({ position: { x: 10, y: 10 } });
    await expect(page.getByText("Create Project")).not.toBeVisible();
  });

  test("create project with name and color", async ({ page }) => {
    await page.goto("/projects");
    await page.getByText("New Project").click();
    const projectName = `Test Project ${Date.now()}`;
    await page.getByPlaceholder("Project name").fill(projectName);
    await page.locator("button[type='button']").filter({ has: page.locator("[style*='background']") }).first().click();
    await page.getByRole("button", { name: "Create" }).click();
    await expect(page.getByText(projectName)).toBeVisible({ timeout: 5000 });
  });
});

import { test, expect } from "@playwright/test";

test.describe("Public Pages", () => {
  test("published note 404 page renders for invalid slug", async ({ page }) => {
    await page.goto("/published/nonexistent-slug-12345");
    await expect(page.getByText("Not Found")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("This note doesn't exist or has been unpublished")).toBeVisible();
  });

  test("login page is publicly accessible", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Welcome back")).toBeVisible();
    await expect(page).not.toHaveURL(/\/signup/);
  });

  test("signup page is publicly accessible", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByText("Create account")).toBeVisible();
    await expect(page).not.toHaveURL(/\/login/);
  });
});

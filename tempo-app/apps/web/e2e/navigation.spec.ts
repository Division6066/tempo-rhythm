import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test.describe("Bottom navigation bar", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("login page has no bottom navigation", async ({ page }) => {
      await page.goto("/login");
      await expect(page.locator("nav")).not.toBeVisible();
    });
  });

  test.describe("Auth page cross-linking", () => {
    test("login links to signup and back", async ({ page }) => {
      await page.goto("/login");
      await page.getByRole("link", { name: "Sign up" }).click();
      await expect(page).toHaveURL(/\/signup/);
      await page.getByRole("link", { name: "Sign in" }).click();
      await expect(page).toHaveURL(/\/login/);
    });
  });
});

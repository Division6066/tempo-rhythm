import { expect, test } from "@playwright/test";

test.describe("public navigation and auth gates", () => {
  test("clicking the landing sign-in link lands on the sign-in form", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("clicking the app preview preserves the Today destination through sign-in", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Preview the app" }).click();

    await expect(page).toHaveURL(/\/sign-in\?next=%2Ftoday$/);
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });

  test("guarded onboarding preserves its destination through sign-in", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Start your $1 walk" }).click();

    await expect(page).toHaveURL(/\/sign-in\?next=%2Fonboarding$/);
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });

  test("guarded calendar route redirects with an exact next path", async ({ page }) => {
    await page.goto("/calendar");

    await expect(page).toHaveURL(/\/sign-in\?next=%2Fcalendar$/);
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });
});

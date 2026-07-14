import { expect, test } from "@playwright/test";

test.describe("habits and routines", () => {
  test("habit check-in persists through reload", async ({ page }) => {
    await page.goto("/habits");

    await page.getByRole("button", { name: /check in for drink water/i }).click();
    await expect(page.getByText("1 day", { exact: true })).toBeVisible();
    await expect(page.getByText("Checked in today.", { exact: true })).toBeVisible();

    await page.reload();
    await expect(page.getByText("1 day", { exact: true })).toBeVisible();
    await expect(page.getByText("Checked in today.", { exact: true })).toBeVisible();
  });

  test("routine creation can include habits and tasks", async ({ page }) => {
    await page.goto("/routines");

    await page.getByLabel("Routine name").fill("Evening reset");
    await page.getByLabel("Include Drink water").check();
    await page.getByLabel("Include Clear desk").check();
    await page.getByRole("button", { name: /create routine/i }).click();

    await expect(page.getByRole("heading", { name: "Evening reset" })).toBeVisible();
    await expect(page.getByRole("listitem").filter({ hasText: "Drink water" })).toBeVisible();
    await expect(page.getByRole("listitem").filter({ hasText: "Clear desk" })).toBeVisible();
  });

  test("energy suggestion can be accepted or rejected", async ({ page }) => {
    await page.goto("/habits");

    await expect(page.getByText(/low-energy option/i)).toBeVisible();
    await page.getByRole("button", { name: /reject suggestion/i }).click();
    await expect(page.getByText(/suggestion set aside/i)).toBeVisible();

    await page.getByRole("button", { name: /show suggestion/i }).click();
    await page.getByRole("button", { name: /accept suggestion/i }).click();
    await expect(page.getByText(/accepted/i)).toBeVisible();
  });
});

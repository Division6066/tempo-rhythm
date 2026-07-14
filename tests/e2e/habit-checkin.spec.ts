import { expect, test } from "@playwright/test";

test("checking a habit today survives reload", async ({ page }) => {
  await page.goto("/habits");
  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { name: "Habits" })).toBeVisible();

  const checkButton = page.getByRole("button", { name: "Check Morning water today" });
  await expect(checkButton).toHaveText("Check today");
  await checkButton.click();

  await expect(page.getByRole("button", { name: "Morning water is checked today" })).toHaveText(
    "Checked today",
  );

  await page.reload();

  await expect(page.getByRole("button", { name: "Morning water is checked today" })).toHaveText(
    "Checked today",
  );
});

import { expect, test } from "@playwright/test";

test("logs-session: completing a session writes a visible log entry", async ({ page }) => {
  await page.goto("/today");
  await page.evaluate(() => {
    window.localStorage.clear();
  });
  await page.reload();

  await expect(page.getByTestId("session-log-empty")).toBeVisible();

  await page.getByRole("button", { name: "Start focus session" }).click();
  await expect(page.getByTestId("active-session-status")).toContainText("Session running");

  await page.getByRole("button", { name: "Complete focus session" }).click();

  const logList = page.getByTestId("session-log-list");
  await expect(logList).toBeVisible();
  await expect(logList).toContainText("Focus session");
  await expect(logList).toContainText("Completed just now");
});

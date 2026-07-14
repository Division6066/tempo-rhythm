import { expect, test, type Page } from "@playwright/test";

const testEmail = "e2e-calendar@example.test";
const testPassword = "QAtest123!";
const taskTitle = `Calendar block ${Date.now()}`;

async function signUpOrSignIn(page: Page) {
  await page.goto("/sign-up");
  await page.locator("#signup-email").fill(testEmail);
  await page.locator("#signup-password").fill(testPassword);
  await page.getByRole("button", { name: "Accept terms and privacy policy" }).click();
  await page.getByRole("button", { name: /create account/i }).click();

  try {
    await page.waitForURL((url) => !url.pathname.includes("sign-up"), { timeout: 15_000 });
  } catch {
    await page.goto("/sign-in");
    await page.locator("#signin-email").fill(testEmail);
    await page.locator("#signin-password").fill(testPassword);
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await page.waitForURL((url) => !url.pathname.includes("sign-in"), { timeout: 15_000 });
  }
}

test("task can become a calendar block and keyboard reschedule persists", async ({ page }) => {
  await signUpOrSignIn(page);

  await page.goto("/calendar");
  await expect(page.locator("main").getByRole("heading", { level: 1, name: /^Calendar$/ })).toBeVisible();

  await page.getByLabel("Task title").fill(taskTitle);
  await page.getByRole("button", { name: "Add task" }).click();

  const taskRow = page.getByRole("listitem").filter({ hasText: taskTitle });
  await expect(taskRow).toBeVisible();
  await taskRow.getByRole("button", { name: `Schedule ${taskTitle} at 9:00 AM` }).click();

  const eventCard = page.getByTestId("calendar-event").filter({ hasText: taskTitle });
  await expect(eventCard).toContainText("9:00 AM");
  await expect(eventCard).toContainText("Owned by you");

  await eventCard.getByRole("button", { name: `Move ${taskTitle} 30 minutes later` }).focus();
  await page.keyboard.press("Enter");
  await expect(eventCard).toContainText("9:30 AM");

  await page.reload();

  const reloadedEventCard = page.getByTestId("calendar-event").filter({ hasText: taskTitle });
  await expect(reloadedEventCard).toContainText("9:30 AM");
  await expect(reloadedEventCard).toContainText("Owned by you");
});

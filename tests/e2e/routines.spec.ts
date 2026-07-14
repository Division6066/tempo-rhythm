import { expect, type Page, test } from "@playwright/test";

const testEmail = "amitlevin65@protonmail.com";
const testPassword = "TempoRoutinesE2E!2026";

async function waitForRoutinesPath(page: Page) {
  await page.waitForFunction(() => window.location.pathname === "/routines", undefined, {
    timeout: 20_000,
  });
}

async function signIn(page: Page) {
  await page.goto("/sign-in?next=/routines");
  await page.locator("#signin-email").fill(testEmail);
  await page.locator("#signin-password").fill(testPassword);
  await page.getByRole("button", { name: "Sign in" }).click();
  await waitForRoutinesPath(page);
}

async function ensureSignedIn(page: Page) {
  await page.goto("/sign-up?next=/routines");
  await page.locator("#signup-email").fill(testEmail);
  await page.locator("#signup-password").fill(testPassword);
  await page.getByRole("button", { name: "Accept terms and privacy policy" }).click();
  await page.getByRole("button", { name: "Create account" }).click();

  try {
    await waitForRoutinesPath(page);
  } catch {
    await signIn(page);
  }
}

test("creates a routine containing a habit and a task, then completes both from the routine view", async ({
  page,
}) => {
  await ensureSignedIn(page);

  const suffix = Date.now();
  const routineName = `Morning reset ${suffix}`;
  const habitName = `Drink water ${suffix}`;
  const taskTitle = `Pack bag ${suffix}`;

  await page.getByLabel("Routine name").fill(routineName);
  await page.getByLabel("Habit").fill(habitName);
  await page.getByLabel("Task").fill(taskTitle);
  await page.getByRole("button", { name: "Create routine" }).click();

  await page.waitForURL(/\/routines\/[^/]+$/, { timeout: 20_000 });
  await expect(page.getByRole("heading", { name: routineName })).toBeVisible();

  await expect(page.getByRole("heading", { name: habitName })).toBeVisible();
  await expect(page.getByRole("heading", { name: taskTitle })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open habit detail" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open tasks" })).toBeVisible();

  await page.getByRole("button", { name: "Complete habit" }).click();
  await expect(page.getByRole("button", { name: "Habit complete today" })).toBeVisible({
    timeout: 20_000,
  });

  await page.getByRole("button", { name: "Complete task" }).click();
  await expect(page.getByRole("button", { name: "Task complete" })).toBeVisible({
    timeout: 20_000,
  });
});

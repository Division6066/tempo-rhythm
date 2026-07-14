import { expect, test } from "@playwright/test";

const messyDump = [
  "reply to Maya today",
  "pay phone bill tonight",
  "maybe plan Sunday",
  "schedule dentist appointment",
].join(", ");

test.describe("Brain Dump day-one flow", () => {
  test("blocks empty input, supports edit/reject before accept, and persists accepted tasks across reload", async ({
    page,
  }) => {
    const email = process.env.PLAYWRIGHT_TEST_EMAIL ?? "playwright@tempo.test";
    const password = process.env.PLAYWRIGHT_TEST_PASSWORD ?? "TempoE2E123!";

    await page.goto("/sign-up");
    await page.getByLabel("Email").fill(email);
    await page.locator("#signup-password").fill(password);
    await page.getByLabel("Accept terms and privacy policy").click();
    await page.getByRole("button", { name: "Create account" }).click();

    await page.waitForURL(/\/today/, { timeout: 20_000 }).catch(async () => {
      await page.goto("/sign-in");
      await page.getByLabel("Email").fill(email);
      await page.locator("#signin-password").fill(password);
      await page.getByRole("button", { name: "Sign in" }).click();
      await page.waitForURL(/\/today/, { timeout: 20_000 });
    });

    const rawDump = page.getByLabel("Raw dump");
    await expect(rawDump).toBeVisible();

    await expect(page.getByRole("button", { name: "Sort locally" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Turn this into a plan" })).toBeDisabled();

    await rawDump.fill(messyDump);
    await page.getByRole("button", { name: "Sort locally" }).click();

    await expect(page.getByRole("heading", { name: "Draft next moves" })).toBeVisible();
    await expect(page.getByText(/Choose what becomes real tasks/i)).toBeVisible();

    const editedTitle = "Reply to Maya with the project update";
    await page.getByLabel("Edit proposal 1 title").fill(editedTitle);

    const rejectedTitle = page.getByLabel("Edit proposal 2 title");
    const rejectedValue = await rejectedTitle.inputValue();
    await page.getByRole("checkbox", { name: /Select proposal 2/i }).uncheck();

    await page.getByRole("button", { name: /Add \d+ to Today/ }).click();
    await expect(page.getByText(/Added \d+ tasks? to today\./)).toBeVisible();

    const todayList = page.getByRole("region", { name: "Today" });
    await expect(todayList.getByText(editedTitle)).toBeVisible();
    await expect(todayList.getByText(rejectedValue)).toHaveCount(0);

    await page.reload();
    await expect(todayList.getByText(editedTitle)).toBeVisible();
    await expect(todayList.getByText(rejectedValue)).toHaveCount(0);
  });
});

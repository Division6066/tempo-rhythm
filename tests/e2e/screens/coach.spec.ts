import { expect, test } from "@playwright/test";

const storageStatePath = process.env.TEMPO_E2E_STORAGE_STATE;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

function url(path: string): string {
  return new URL(path, baseURL).toString();
}

test.describe("coach screen", () => {
  test.skip(!storageStatePath, "needs TEMPO_E2E_STORAGE_STATE");

  test.use({ storageState: storageStatePath });

  test("send a message and see a reply; thread survives reload", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    const prompt = `Help me pick one thing for this afternoon ${Date.now()}`;

    await page.goto(url("/coach"));
    await expect(page.getByRole("main").getByRole("heading", { name: "Coach" })).toBeVisible();

    const messageInput = page.getByLabel("Message");
    const assistantBubbles = page.locator('[data-role="assistant"]');
    const bubblesBefore = await assistantBubbles.count();

    await messageInput.fill(prompt);
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText(prompt)).toBeVisible();
    // The input is disabled purely by isSending (unlike the Send button, which
    // also disables on empty text), so it's a race-free signal of "in flight".
    await expect(messageInput).toBeDisabled();

    await expect(assistantBubbles).toHaveCount(bubblesBefore + 1, { timeout: 10_000 });
    await expect(page.getByRole("status", { name: "Coach is typing" })).toHaveCount(0);
    await expect(messageInput).toBeEnabled();

    await page.reload();
    await expect(page.getByText(prompt)).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });
});

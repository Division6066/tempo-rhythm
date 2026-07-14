import { expect, test } from "@playwright/test";

test("saves a provider key to Convex and uses it for a mocked provider call", async ({ page }) => {
  const email = "amitlevin65@protonmail.com";
  const password = "TestPass123!";
  const providerKey = `tfk_test_${Date.now()}_saved_key`;
  const providerRequests: Array<{ authorization?: string; body: unknown }> = [];

  await page.route("**/api/byok/mock-provider", async (route) => {
    const request = route.request();
    providerRequests.push({
      authorization: request.headers().authorization,
      body: JSON.parse(request.postData() ?? "{}"),
    });

    await route.fulfill({
      contentType: "application/json",
      json: {
        choices: [{ message: { content: "Mock provider heard the saved key." } }],
      },
      status: 200,
    });
  });

  await page.goto(`/sign-up?next=${encodeURIComponent("/settings/integrations")}`);
  await page.getByLabel("Email").fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Accept terms and privacy policy" }).click();
  await page.getByRole("button", { name: "Create account" }).click();

  if (await page.getByText("That email already has an account. Try signing in instead.").isVisible()) {
    await page.goto(`/sign-in?next=${encodeURIComponent("/settings/integrations")}`);
    await page.getByLabel("Email").fill(email);
    await page.getByRole("textbox", { name: "Password" }).fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
  }

  await expect(page).toHaveURL(/\/settings\/integrations/);
  await expect(page.getByRole("heading", { name: "Provider keys" })).toBeVisible();

  await page.getByLabel("Mistral-compatible API key").fill(providerKey);
  await page.getByRole("button", { name: "Save provider key" }).click();
  await expect(page.getByText("Provider key saved to Convex.")).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Mistral-compatible API key")).toHaveValue(providerKey);

  await page.getByLabel("Test prompt").fill("Please answer with one calm sentence.");
  await page.getByRole("button", { name: "Send mocked provider call" }).click();
  await expect(page.getByText("Mock provider heard the saved key.")).toBeVisible();

  expect(providerRequests).toHaveLength(1);
  expect(providerRequests[0]?.authorization).toBe(`Bearer ${providerKey}`);
  expect(providerRequests[0]?.body).toEqual({
    messages: [{ content: "Please answer with one calm sentence.", role: "user" }],
    model: "mistral-small-latest",
    provider: "mistral",
  });
});

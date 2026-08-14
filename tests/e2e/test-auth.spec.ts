import { expect, test } from "@playwright/test";
import { signInWithE2eTestEmail } from "./auth";

test.skip(
  !process.env.E2E_TEST_AUTH_EMAIL || !process.env.NEXT_PUBLIC_CONVEX_URL,
  "E2E test auth requires E2E_TEST_AUTH_EMAIL and NEXT_PUBLIC_CONVEX_URL.",
);

test("E2E test email completes sign-in", async ({ page }) => {
  await signInWithE2eTestEmail(page);

  await expect(page.getByRole("main").getByRole("heading", { name: "Today" })).toBeVisible();
});

import { expect, test } from "@playwright/test";

test("tracking dashboard logs sessions, updates streak ring, and charts real logged data", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-07-14T09:00:00.000Z"));
  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: "Tracking dashboard" })).toBeVisible();
  await expect(page.getByTestId("tracking-chart")).toHaveAttribute(
    "data-source",
    "session-logs",
  );
  await expect(page.getByTestId("tracking-chart")).toHaveAttribute(
    "data-placeholder-detected",
    "false",
  );

  await page.getByRole("button", { name: "Complete session" }).click();

  await expect(page.getByTestId("session-log")).toContainText("Session completed");
  await expect(page.getByTestId("streak-count")).toHaveText("1");
  await expect(page.getByTestId("enso-ring")).toHaveAttribute("aria-valuenow", "1");
  await expect(page.getByTestId("tracking-chart")).toHaveAttribute(
    "data-session-count",
    "1",
  );
  await expect(page.getByTestId("tracking-chart")).toHaveAttribute(
    "data-chart-points",
    JSON.stringify([{ day: "2026-07-14", sessions: 1, minutes: 25 }]),
  );
});

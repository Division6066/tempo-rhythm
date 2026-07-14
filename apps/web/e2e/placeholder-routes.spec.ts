import { expect, test } from "@playwright/test";

const placeholderRoutes = [
  { path: "/brain-dump", heading: "Brain dump" },
  { path: "/coach", heading: "Coach" },
  { path: "/plan", heading: "Planning" },
  { path: "/tasks", heading: "Tasks" },
  { path: "/notes", heading: "Notes" },
  { path: "/journal", heading: "Journal" },
  { path: "/calendar", heading: "Calendar" },
  { path: "/habits", heading: "Habits" },
  { path: "/routines", heading: "Routines" },
  { path: "/templates", heading: "Templates" },
  { path: "/settings/profile", heading: "Profile" },
  { path: "/onboarding", heading: "Onboarding" },
] as const;

test.describe("placeholder routes", () => {
  for (const route of placeholderRoutes) {
    test(`${route.path} renders the ${route.heading} placeholder heading`, async ({ page }) => {
      await page.goto(route.path);

      await expect(page.getByRole("heading", { level: 1, name: route.heading })).toBeVisible();
    });
  }
});

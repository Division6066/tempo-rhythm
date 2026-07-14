import { expect, type Page, test } from "@playwright/test";

const requiredCategories = [
  "Animal Flow",
  "Fighter-Yoga Mobility",
  "Joint Prep/CARs",
  "Bodyweight S&C",
  "Recovery",
] as const;

async function expectMovementCategories(page: Page) {
  for (const category of requiredCategories) {
    await expect(
      page.getByRole("heading", { exact: true, name: category })
    ).toBeVisible();
  }
}

test.describe("movement routine library", () => {
  test("lists routines by category and opens a routine in the session player", async ({
    page,
  }) => {
    await page.goto("/routines");

    await expect(page.getByTestId("movement-library")).toBeVisible();
    await expectMovementCategories(page);

    await page.getByTestId("routine-card-animal-flow-primer").click();

    await expect(page).toHaveURL(/\/routines\/animal-flow-primer/);
    await expect(page.getByTestId("session-player")).toBeVisible();
    await expect(page.getByText("Session player")).toBeVisible();
    await expect(page.getByText("Animal Flow Primer")).toBeVisible();
  });

  test("renders the same routine library flow in RTL for Hebrew", async ({
    page,
  }) => {
    await page.goto("/routines?language=he");

    const library = page.getByTestId("movement-library");
    await expect(library).toHaveAttribute("dir", "rtl");
    await expectMovementCategories(page);

    await page.getByTestId("routine-card-animal-flow-primer").click();

    await expect(page).toHaveURL(/\/routines\/animal-flow-primer\?language=he/);
    const player = page.getByTestId("session-player");
    await expect(player).toHaveAttribute("dir", "rtl");
    await expect(page.getByText("Animal Flow Primer")).toBeVisible();
  });
});

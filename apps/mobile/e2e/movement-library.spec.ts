import { expect, test } from "@playwright/test";

const expectedCategories = [
  { id: "wake-up", title: "Wake up" },
  { id: "focus", title: "Focus" },
  { id: "reset", title: "Reset" },
  { id: "strength", title: "Strength" },
  { id: "wind-down", title: "Wind down" },
] as const;

test.describe("movement routine library", () => {
  test("category groups render all five movement categories", async ({
    page,
  }) => {
    await page.goto("/routines");

    await expect(page.getByTestId("movement-library")).toBeVisible();
    await expect(page.getByText("Movement routines", { exact: true }))
      .toBeVisible();

    for (const category of expectedCategories) {
      const group = page.getByTestId(`movement-category-${category.id}`);

      await expect(group).toBeVisible();
      await expect(group.getByText(category.title, { exact: true }))
        .toBeVisible();
      await expect(group.getByTestId(/^movement-routine-/)).not.toHaveCount(0);
    }

    await expect(page.getByTestId(/^movement-category-/)).toHaveCount(
      expectedCategories.length
    );
  });
});

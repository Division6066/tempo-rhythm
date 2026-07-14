import { expect, test } from "@playwright/test";

const expectedColumnCounts = {
  backlog: 2,
  now: 2,
  done: 2,
} as const;

test("six fixture tickets render in the correct kanban columns", async ({ page }) => {
  await page.goto("/projects/aw-34/kanban");

  await expect(page.getByRole("heading", { name: "Ticket board" })).toBeVisible();
  await expect(page.getByTestId("ticket-card")).toHaveCount(6);

  for (const [state, count] of Object.entries(expectedColumnCounts)) {
    const column = page.getByTestId(`ticket-column-${state}`);

    await expect(column.getByTestId("ticket-card")).toHaveCount(count);
    await expect(page.getByTestId(`ticket-count-${state}`)).toHaveText(String(count));
  }
});

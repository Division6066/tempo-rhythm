import { expect, test } from "@playwright/test";

test.describe("theme token samples", () => {
  test("kanji romaji pair renders both kanji glyph and romaji text nodes", async ({ page }) => {
    await page.goto("/theme-tokens");

    await expect(page.getByTestId("kanji-romaji-pair")).toBeVisible();
    await expect(page.getByTestId("kanji-romaji-kanji")).toHaveText("道");
    await expect(page.getByTestId("kanji-romaji-romaji")).toHaveText("do");
  });
});

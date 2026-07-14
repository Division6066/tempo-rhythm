import { expect, test } from "@playwright/test";

import {
  edoTheme,
  renderEdoThemeSampleHtml,
} from "../src/theme/edo-browser-sample";

const tokenColorToCss = (hexColor: string): string => {
  const red = Number.parseInt(hexColor.slice(1, 3), 16);
  const green = Number.parseInt(hexColor.slice(3, 5), 16);
  const blue = Number.parseInt(hexColor.slice(5, 7), 16);

  return `rgb(${red}, ${green}, ${blue})`;
};

const isPlaywrightRunner = process.argv.some((argument) =>
  argument.includes("playwright")
);

if (isPlaywrightRunner) {
  test("Edo sample screen renders from tokens and mirrors in RTL", async ({
    page,
  }) => {
    await page.setContent(renderEdoThemeSampleHtml("he"));

    const screen = page.getByTestId("edo-sample-screen");
    await expect(screen).toHaveAttribute("dir", "rtl");

    await expect(page.getByTestId("kanji-romaji-pair")).toContainText("道");
    await expect(page.getByTestId("kanji-romaji-pair")).toContainText("Michi");

    await expect(page.getByTestId("enso-ring")).toBeVisible();

    await expect(screen).toHaveCSS(
      "background-color",
      tokenColorToCss(edoTheme.colors.washi)
    );
    await expect(screen).toHaveCSS(
      "color",
      tokenColorToCss(edoTheme.colors.sumi)
    );
    await expect(screen).toHaveCSS(
      "font-family",
      new RegExp(edoTheme.type.body)
    );
    await expect(screen).toHaveCSS(
      "padding-inline-start",
      `${edoTheme.spacing.lg}px`
    );

    const tokenCard = page.getByTestId("edo-token-card");
    await expect(tokenCard).toHaveCSS(
      "border-color",
      tokenColorToCss(edoTheme.colors.goldLeaf)
    );
    await expect(tokenCard).toHaveCSS(
      "padding-inline-start",
      `${edoTheme.spacing.md}px`
    );

    const rtlAccent = await page
      .getByTestId("edo-direction-accent")
      .boundingBox();
    const rtlCard = await tokenCard.boundingBox();

    expect(rtlAccent).not.toBeNull();
    expect(rtlCard).not.toBeNull();
    expect(rtlAccent!.x).toBeGreaterThan(rtlCard!.x + rtlCard!.width / 2);

    await page.setContent(renderEdoThemeSampleHtml("en"));
    await expect(page.getByTestId("edo-sample-screen")).toHaveAttribute(
      "dir",
      "ltr"
    );

    const ltrAccent = await page
      .getByTestId("edo-direction-accent")
      .boundingBox();
    const ltrCard = await page.getByTestId("edo-token-card").boundingBox();

    expect(ltrAccent).not.toBeNull();
    expect(ltrCard).not.toBeNull();
    expect(ltrAccent!.x).toBeLessThan(ltrCard!.x + ltrCard!.width / 2);
  });
}

import { expect, test } from "@playwright/test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PaywallGate } from "../src/features/paywall";

const h = React.createElement;

function renderPage(body: React.ReactElement) {
  return `<!doctype html><html><body>${renderToStaticMarkup(body)}</body></html>`;
}

test("trial user past image cap sees blurred generated image with upgrade CTA", async ({ page }) => {
  await page.setContent(
    renderPage(
      h(
        "main",
        null,
        h(
          "section",
          { "aria-label": "trial exhausted image" },
          h(
            PaywallGate,
            {
              feature: "image",
              tier: "trial",
              quota: { status: "exhausted", used: 3, limit: 3, unit: "images" },
            },
            h("div", {
              "aria-label": "generated image",
              "data-testid": "trial-image",
              style: {
                width: 220,
                height: 140,
                background:
                  "linear-gradient(135deg, #131312 0%, #d97757 45%, #faf6f0 100%)",
              },
            })
          )
        ),
        h(
          "section",
          { "aria-label": "paid image" },
          h(
            PaywallGate,
            {
              feature: "image",
              tier: "paid",
              quota: { status: "available", used: 0, limit: 3, unit: "images" },
            },
            h("div", {
              "aria-label": "generated image",
              "data-testid": "paid-image",
              style: {
                width: 220,
                height: 140,
                background:
                  "linear-gradient(135deg, #131312 0%, #d97757 45%, #faf6f0 100%)",
              },
            })
          )
        )
      )
    )
  );

  await expect(page.getByRole("link", { name: /upgrade to keep creating/i })).toBeVisible();
  await expect(page.getByText("You used 3 of 3 trial images.")).toBeVisible();
  await expect(page.getByTestId("trial-image")).toHaveCSS("filter", /blur/);
  await expect(page.locator("[data-paywall='image-blur']")).toBeVisible();

  const blurred = await page.getByTestId("trial-image").screenshot();
  const unblurred = await page.getByTestId("paid-image").screenshot();
  expect(Buffer.compare(blurred, unblurred)).not.toBe(0);
});

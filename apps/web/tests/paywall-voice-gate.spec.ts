import { expect, test } from "@playwright/test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PaywallGate } from "../src/features/paywall";

const h = React.createElement;

function renderPage(body: React.ReactElement) {
  return `<!doctype html><html><body>${renderToStaticMarkup(body)}</body></html>`;
}

test("voice-call entry as trial user renders paid-only gate", async ({ page }) => {
  await page.setContent(
    renderPage(
      h(
        PaywallGate,
        {
          feature: "voice",
          tier: "trial",
          quota: { status: "unavailable", unit: "voice" },
        },
        h("button", { type: "button" }, "Start voice call")
      )
    )
  );

  await expect(page.getByText("Voice is paid-only for now.")).toBeVisible();
  await expect(page.locator("[data-paywall='voice-gate']")).toBeVisible();
  await expect(page.getByRole("link", { name: /upgrade for voice/i })).toBeVisible();
});

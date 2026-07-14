import { expect, test } from "@playwright/test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PaywallGate } from "../src/features/paywall";

const h = React.createElement;

function renderPage(body: React.ReactElement) {
  return `<!doctype html><html><body>${renderToStaticMarkup(body)}</body></html>`;
}

test("past message cap disables chat input and renders hard-stop sheet", async ({ page }) => {
  await page.setContent(
    renderPage(
      h(
        PaywallGate,
        {
          feature: "chat",
          tier: "trial",
          quota: { status: "exhausted", used: 20, limit: 20, unit: "messages" },
        },
        h("label", { htmlFor: "chat-input" }, "Message AIRI"),
        h("input", {
          id: "chat-input",
          "data-testid": "chat-input",
          placeholder: "Say what is on your mind",
        }),
        h("button", { type: "button" }, "Send")
      )
    )
  );

  await expect(page.getByTestId("chat-input")).toBeDisabled();
  await expect(page.locator("[data-paywall='hard-stop-sheet']")).toBeVisible();
  await expect(page.getByText("You used all 20 trial messages.")).toBeVisible();
  await expect(page.getByRole("link", { name: /upgrade to keep chatting/i })).toBeVisible();
});

test("paid user has no paywall DOM anywhere", async ({ page }) => {
  await page.setContent(
    renderPage(
      h(
        PaywallGate,
        {
          feature: "chat",
          tier: "paid",
          quota: { status: "exhausted", used: 20, limit: 20, unit: "messages" },
        },
        h("label", { htmlFor: "paid-chat-input" }, "Message AIRI"),
        h("input", { id: "paid-chat-input", "data-testid": "paid-chat-input" }),
        h("button", { type: "button" }, "Send")
      )
    )
  );

  await expect(page.getByTestId("paid-chat-input")).toBeEnabled();
  await expect(page.locator("[data-paywall]")).toHaveCount(0);
});

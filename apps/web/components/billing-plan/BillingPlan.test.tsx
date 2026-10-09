/**
 * Vitest and Testing Library are not dependencies in this repo, and package.json
 * is outside this ticket's scope. bun:test covers the same checks.
 */
import { describe, expect, mock, test } from "bun:test";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { CurrentPlan } from "./PlanCard";

const betaTester: CurrentPlan = {
  plan: "none",
  status: "active",
  label: "Beta tester",
  betaAccess: "tester",
  entitlementTier: "none",
  userType: "free",
  isBeta: true,
};

let planResult: CurrentPlan | null | undefined = betaTester;

mock.module("convex/react", () => ({
  useQuery: () => planResult,
}));

const { BillingPlan } = await import("./BillingPlan");

function renderPlan(): string {
  return renderToStaticMarkup(createElement(BillingPlan) as ReactElement);
}

function controls(html: string): string[] {
  return html.match(/<(button|a)\b[^>]*>[\s\S]*?<\/\1>/gi) ?? [];
}

describe("BillingPlan", () => {
  test("shows the query label, a loading dash, and no checkout control", () => {
    planResult = betaTester;
    const loaded = renderPlan();
    expect(loaded).toContain("Beta tester");
    expect(loaded).toContain("Active");
    expect(loaded).toContain("Tester");
    expect(loaded).toContain("Beta access is free while Tempo is in beta.");
    expect(loaded).toContain("Paid plans arrive after beta.");
    expect(loaded).toContain("—");
    expect(loaded).not.toContain("$");
    expect(loaded).not.toContain("{");

    planResult = undefined;
    const loading = renderPlan();
    expect(loading).toContain("—");
    expect(loading).not.toContain("Beta tester");
    expect(loading).not.toContain("$");

    planResult = null;
    const signedOut = renderPlan();
    expect(signedOut).toContain("Sign in to see your plan.");
    expect(signedOut).not.toContain("Beta tester");

    const interactive = [loaded, loading, signedOut].flatMap(controls).join("\n");
    expect(interactive).not.toMatch(/upgrade|checkout|pay/i);
    expect(loaded).not.toMatch(/<(button|a)\b/i);
    expect(loading).not.toMatch(/<(button|a)\b/i);
    expect(signedOut).not.toMatch(/<(button|a)\b/i);
  });
});

import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ScaffoldScreen } from "./ScaffoldScreen";

function renderScaffold(overrides: Partial<Parameters<typeof ScaffoldScreen>[0]> = {}) {
  return renderToStaticMarkup(
    createElement(ScaffoldScreen, {
      title: "Billing",
      category: "Settings",
      source: "PRD_Phase_1_MVP.md",
      ...overrides,
    })
  );
}

describe("ScaffoldScreen", () => {
  test("renders the route identity and custom summary supplied by scaffolded pages", () => {
    const html = renderScaffold({ summary: "Custom route-specific setup copy." });

    expect(html).toContain("Billing");
    expect(html).toContain("Settings");
    expect(html).toContain("Reference: PRD_Phase_1_MVP.md");
    expect(html).toContain("Custom route-specific setup copy.");
    expect(html).not.toContain("This route has been ported to a concrete layout shell");
  });

  test("falls back to beta-safe summary and closed-beta compliance copy", () => {
    const html = renderScaffold();

    expect(html).toContain(
      "This route has been ported to a concrete layout shell that follows the approved design hierarchy while we complete backend hardening."
    );
    expect(html).toContain("Tempo Flow is in closed beta");
    expect(html).toContain("intentionally non-blocking placeholders");
  });

  test("keeps readiness disclaimers and pending integrations non-mutating", () => {
    const html = renderScaffold();

    expect(html).toContain('aria-label="Readiness disclaimers"');
    expect(html).toContain("Charging, invoicing, and tax handling are not yet connected");
    expect(html).toContain("Users can continue core beta workflows without setup");
    expect(html).toMatch(/<button[^>]*disabled[^>]*>Integration pending<\/button>/);
  });

  test("renders all safe route-state variants for loading, empty, and error states", () => {
    const html = renderScaffold();

    expect(html).toContain('aria-label="Route state variants"');
    expect(html).toContain("Loading state");
    expect(html).toContain("Empty state");
    expect(html).toContain("Error state");
    expect(html).toContain("Retry is safe; no billing or legal actions are submitted");
  });
});

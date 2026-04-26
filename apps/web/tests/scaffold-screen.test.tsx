/**
 * Accessibility regression test for the shared ScaffoldScreen component.
 *
 * Every scaffold-only route renders ScaffoldScreen, so the contract here
 * is the contract for ~25 routes. If this regresses, the route-manifest
 * tests will too — but this file localizes the failure to the right place.
 *
 * Updated for #26 (concrete beta-safe layout shells): the scaffold now
 * renders a `<main>` with header, primary/secondary action sections,
 * readiness disclaimers, and route-state cards. Pinned below.
 */
import { describe, expect, test } from "bun:test";
import { ScaffoldScreen } from "@/components/tempo/ScaffoldScreen";
import { audit, errorIssues, formatIssues, render, visibleText } from "./a11y";

describe("ScaffoldScreen · structure", () => {
  test("renders the title as the only h1", () => {
    const rendered = render(
      <ScaffoldScreen
        title="Coach"
        category="Flow"
        source="screens-1.jsx"
        summary="Conversational AI coach surface."
      />,
    );
    const h1s = rendered.tags.get("h1") ?? [];
    expect(h1s).toHaveLength(1);
    expect(visibleText(h1s[0])).toBe("Coach");
  });

  test("renders the category and 'Beta preview' pills above the heading", () => {
    const rendered = render(
      <ScaffoldScreen title="Coach" category="Flow" source="x.jsx" />,
    );
    const text = visibleText(rendered.html);
    expect(text).toContain("Flow");
    expect(text).toContain("Beta preview");
  });

  test("renders the summary when provided", () => {
    const rendered = render(
      <ScaffoldScreen
        title="Brain dump"
        category="Flow"
        source="screens-1.jsx"
        summary="Rapid capture with auto-sort suggestions."
      />,
    );
    expect(visibleText(rendered.html)).toContain(
      "Rapid capture with auto-sort suggestions.",
    );
  });

  test("falls back to a default summary when none is provided", () => {
    const rendered = render(
      <ScaffoldScreen title="X" category="Flow" source="screens-9.jsx" />,
    );
    expect(visibleText(rendered.html)).toContain(
      "concrete layout shell that follows the approved design hierarchy",
    );
  });

  test("renders the source path as visible text near the heading", () => {
    const rendered = render(
      <ScaffoldScreen title="X" category="Flow" source="screens-9.jsx" />,
    );
    expect(visibleText(rendered.html)).toContain("Reference: screens-9.jsx");
  });

  test("renders the three route-state cards (Loading / Empty / Error)", () => {
    const rendered = render(
      <ScaffoldScreen title="X" category="Flow" source="x.jsx" />,
    );
    const text = visibleText(rendered.html);
    expect(text).toContain("Loading state");
    expect(text).toContain("Empty state");
    expect(text).toContain("Error state");
  });

  test("uses a <main> landmark for the screen body", () => {
    const rendered = render(
      <ScaffoldScreen title="X" category="Flow" source="x.jsx" />,
    );
    const mains = rendered.tags.get("main") ?? [];
    expect(mains.length).toBe(1);
  });

  test("flags Primary/Readiness/Route-state sections via aria-label", () => {
    const rendered = render(
      <ScaffoldScreen title="X" category="Flow" source="x.jsx" />,
    );
    expect(rendered.html).toContain('aria-label="Primary calls to action"');
    expect(rendered.html).toContain('aria-label="Readiness disclaimers"');
    expect(rendered.html).toContain('aria-label="Route state variants"');
  });
});

describe("ScaffoldScreen · accessibility", () => {
  test("passes structural a11y audit", () => {
    const rendered = render(
      <ScaffoldScreen
        title="Coach"
        category="Flow"
        source="screens-1.jsx"
        summary="Test."
      />,
    );
    const errors = errorIssues(audit(rendered));
    expect(errors, formatIssues(errors)).toEqual([]);
  });

  test("does not introduce any positive tabindex", () => {
    const rendered = render(
      <ScaffoldScreen title="X" category="Flow" source="x.jsx" />,
    );
    const issues = audit(rendered);
    expect(issues.some((i) => i.rule === "no-positive-tabindex")).toBe(false);
  });

  test("h1 is unique per scaffold (no duplicate page heading)", () => {
    const rendered = render(
      <ScaffoldScreen title="Tasks" category="Library" source="x.jsx" />,
    );
    const h1s = rendered.tags.get("h1") ?? [];
    expect(h1s.length).toBe(1);
  });
});

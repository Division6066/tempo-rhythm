/**
 * Accessibility regression test for the shared ScaffoldScreen component.
 *
 * Every scaffold-only route renders ScaffoldScreen, so the contract here
 * is the contract for ~25 routes. If this regresses, the route-manifest
 * tests will too — but this file localizes the failure to the right place.
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

  test("renders the category as a pill above the heading", () => {
    const rendered = render(
      <ScaffoldScreen title="Coach" category="Flow" source="x.jsx" />,
    );
    expect(rendered.html).toContain("Flow");
    expect(rendered.html).toContain("scaffold · not ported");
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

  test("renders the source as a code element pointing at design export", () => {
    const rendered = render(
      <ScaffoldScreen title="X" category="Flow" source="screens-9.jsx" />,
    );
    const codes = rendered.tags.get("code") ?? [];
    expect(codes.length).toBeGreaterThan(0);
    expect(codes.some((c) => c.includes("screens-9.jsx"))).toBe(true);
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

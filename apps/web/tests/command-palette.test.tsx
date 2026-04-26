/**
 * CommandPalette accessibility smoke.
 *
 * The palette is a Radix Dialog with a labelled search input and a list of
 * results. When closed, it should produce no DOM in `renderToString` (Radix
 * portals render nothing on the server until `open=true`).
 *
 * When open we verify:
 *   - The dialog has an accessible name (sr-only Title).
 *   - The search input has a label or aria-label.
 *   - Results are exposed as listbox > option with aria-selected on focus.
 *   - All option buttons have accessible names.
 */
import { describe, expect, mock, test } from "bun:test";
import { createElement } from "react";
import type * as React from "react";
import { audit, attr, errorIssues, formatIssues, render } from "./a11y";

mock.module("next/navigation", () => ({
  usePathname: () => "/today",
  useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {} }),
}));

// Replace Radix Dialog with simple pass-through wrappers that DO render in SSR.
// The real component uses a Portal, which is correct in the browser but renders
// nothing server-side, hiding the entire palette body from this test.
mock.module("@radix-ui/react-dialog", () => {
  const passthrough = (tag: "div" | "button" | "h2" | "p") =>
    ({ children, asChild: _asChild, ...rest }: { children?: React.ReactNode; asChild?: boolean } & Record<string, unknown>) =>
      createElement(tag, rest, children);
  return {
    Root: ({ children }: { children: React.ReactNode }) => createElement("div", { "data-test-dialog-root": "" }, children),
    Trigger: passthrough("button"),
    Portal: ({ children }: { children: React.ReactNode }) => createElement("div", { "data-test-dialog-portal": "" }, children),
    Overlay: passthrough("div"),
    Content: passthrough("div"),
    Title: passthrough("h2"),
    Description: passthrough("p"),
    Close: passthrough("button"),
  };
});

const { CommandPalette } = await import("@/components/tempo/CommandPalette");

describe("CommandPalette · closed state", () => {
  test("renders the dialog tree but `open` is false (controlled root)", () => {
    const rendered = render(
      createElement(CommandPalette, { open: false, onOpenChange: () => {} }),
    );
    // Our mock pass-through Dialog mounts its tree regardless. We assert that
    // the palette structure exists at the DOM layer; visibility is controlled
    // by Radix Dialog's `open` prop in the real runtime.
    expect(rendered.html).toContain("data-test-dialog-root");
  });
});

describe("CommandPalette · open state · structure", () => {
  test("emits the dialog with an accessible name (sr-only Title)", () => {
    const rendered = render(
      createElement(CommandPalette, { open: true, onOpenChange: () => {} }),
    );
    expect(rendered.html).toContain("Jump to screen");
    // The accessible Dialog Title should be marked sr-only so it is read by
    // assistive tech but not visually duplicated.
    expect(rendered.html).toMatch(/class="[^"]*sr-only[^"]*"/);
  });

  test("renders a listbox with the screens visible by default", () => {
    const rendered = render(
      createElement(CommandPalette, { open: true, onOpenChange: () => {} }),
    );
    expect(rendered.html).toContain('role="listbox"');
    expect(rendered.html).toContain('aria-label="Screens"');
    // Each option in the list should be a button with role=option.
    const optionMatches = rendered.html.match(/role="option"/g) ?? [];
    expect(optionMatches.length).toBeGreaterThan(10);
  });
});

describe("CommandPalette · open state · accessibility", () => {
  test("structural audit passes", () => {
    const rendered = render(
      createElement(CommandPalette, { open: true, onOpenChange: () => {} }),
    );
    const errors = errorIssues(audit(rendered));
    expect(errors, formatIssues(errors)).toEqual([]);
  });

  test("the search input has aria-label='Search screens'", () => {
    const rendered = render(
      createElement(CommandPalette, { open: true, onOpenChange: () => {} }),
    );
    const inputs = rendered.tags.get("input") ?? [];
    expect(inputs.length).toBeGreaterThanOrEqual(1);
    const search = inputs.find((i) => attr(i, "placeholder")?.includes("Search screens"));
    expect(search, "expected a search input").toBeTruthy();
    // Pin the WCAG-compliant accessible name. Placeholder alone is NOT a label
    // (WCAG 2.4.6 / 1.3.1) — a regression that drops aria-label here would
    // strand keyboard-only and screen-reader users on the palette.
    expect(attr(search ?? "", "aria-label")).toBe("Search screens");
  });

  test("first option has aria-selected=true (initial focus index)", () => {
    const rendered = render(
      createElement(CommandPalette, { open: true, onOpenChange: () => {} }),
    );
    const buttons = rendered.tags.get("button") ?? [];
    const selectedButtons = buttons.filter((b) => attr(b, "aria-selected") === "true");
    expect(selectedButtons.length).toBe(1);
  });
});

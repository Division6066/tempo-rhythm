/**
 * TodayGreeting — small, presentation-only component, but the page hero, so
 * regressions in heading or aria-live destroy the screen reader experience.
 */
import { describe, expect, test } from "bun:test";
import { TodayGreeting } from "@/components/today/TodayGreeting";
import { audit, attr, errorIssues, formatIssues, render, visibleText } from "./a11y";

describe("TodayGreeting · structure", () => {
  test("renders an h1 with the greeting name", () => {
    const rendered = render(<TodayGreeting greetingName="Sam" />);
    const h1s = rendered.tags.get("h1") ?? [];
    expect(h1s.length).toBe(1);
    expect(visibleText(h1s[0])).toContain("Sam");
  });

  test("falls back to 'there' when name is undefined", () => {
    const rendered = render(<TodayGreeting greetingName={undefined} />);
    expect(visibleText(rendered.html)).toContain("there");
  });

  test("falls back to 'there' when name is empty string", () => {
    const rendered = render(<TodayGreeting greetingName="" />);
    expect(visibleText(rendered.html)).toContain("there");
  });

  test("falls back to 'there' when name is only whitespace", () => {
    const rendered = render(<TodayGreeting greetingName="   " />);
    expect(visibleText(rendered.html)).toContain("there");
  });

  test("trims whitespace around the name", () => {
    const rendered = render(<TodayGreeting greetingName="  Sam  " />);
    // The visible text inside the h1 should not have leading/trailing spaces
    // around "Sam".
    const h1 = (rendered.tags.get("h1") ?? [])[0] ?? "";
    expect(visibleText(h1)).toContain("Sam");
    expect(visibleText(h1)).not.toContain("  Sam");
  });
});

describe("TodayGreeting · accessibility", () => {
  test("h1 has aria-live for polite name updates", () => {
    const rendered = render(<TodayGreeting greetingName="Sam" />);
    const h1 = (rendered.tags.get("h1") ?? [])[0];
    expect(h1).toBeTruthy();
    expect(attr(h1 ?? "", "aria-live")).toBe("polite");
  });

  test("structural audit passes", () => {
    const rendered = render(<TodayGreeting greetingName="Sam" />);
    const errors = errorIssues(audit(rendered));
    expect(errors, formatIssues(errors)).toEqual([]);
  });
});

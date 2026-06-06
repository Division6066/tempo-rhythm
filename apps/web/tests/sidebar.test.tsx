/**
 * Sidebar accessibility + nav coverage.
 *
 * The Sidebar is the keyboard-first nav surface; every category we ship
 * should be reachable here without the command palette, and each link must
 * have an accessible name (icon + visible label).
 */
import { describe, expect, mock, test } from "bun:test";
import { createElement } from "react";
import { audit, attr, errorIssues, formatIssues, render, visibleText } from "./a11y";
import { CATEGORIES, screensByCategory } from "@/lib/tempo-nav";

mock.module("next/navigation", () => ({
  usePathname: () => "/today",
}));

const { Sidebar } = await import("@/components/tempo/Sidebar");

describe("Sidebar · structure", () => {
  test("renders an <aside> landmark", () => {
    const rendered = render(createElement(Sidebar));
    expect(rendered.tags.has("aside")).toBe(true);
  });

  test("renders one <nav> region", () => {
    const rendered = render(createElement(Sidebar));
    const navs = rendered.tags.get("nav") ?? [];
    expect(navs.length).toBe(1);
  });

  test("renders a link for every primary category screen", () => {
    const rendered = render(createElement(Sidebar));
    const text = visibleText(rendered.html);
    for (const cat of CATEGORIES) {
      const screens = screensByCategory(cat);
      for (const screen of screens) {
        expect(
          text.includes(screen.title),
          `Sidebar should include "${screen.title}" (slug ${screen.slug})`,
        ).toBe(true);
      }
    }
  });

  test("active route gets an active style class", () => {
    const rendered = render(createElement(Sidebar));
    // /today is active, so its anchor should carry the active style.
    const links = rendered.tags.get("a") ?? [];
    const todayLink = links.find((l) => attr(l, "href") === "/today");
    expect(todayLink, "expected an /today link").toBeTruthy();
    expect(todayLink ?? "").toContain("text-foreground");
  });
});

describe("Sidebar · accessibility", () => {
  test("structural a11y audit passes", () => {
    const rendered = render(createElement(Sidebar));
    const errors = errorIssues(audit(rendered));
    expect(errors, formatIssues(errors)).toEqual([]);
  });

  test("every link has an accessible name (visible text)", () => {
    const rendered = render(createElement(Sidebar));
    const links = rendered.tags.get("a") ?? [];
    for (const link of links) {
      const name = visibleText(link) || attr(link, "aria-label") || attr(link, "title");
      expect(name, `link missing accessible name: ${link.slice(0, 100)}`).toBeTruthy();
    }
  });

  test("every link points at a tempo route (no dangling href)", () => {
    const rendered = render(createElement(Sidebar));
    const links = rendered.tags.get("a") ?? [];
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      const href = attr(link, "href");
      expect(href).toBeTruthy();
      expect(href?.startsWith("/")).toBe(true);
    }
  });
});

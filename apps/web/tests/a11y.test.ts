/**
 * Self-tests for the a11y helper. If these regress, every other a11y test
 * could mis-report; treat this as the trusted base.
 *
 * biome-ignore-all lint/a11y/useButtonType: tests intentionally render buttons
 *   without `type` to verify the audit catches them.
 * biome-ignore-all lint/a11y/noPositiveTabindex: tests intentionally use
 *   positive tabindex to verify the audit warns.
 * biome-ignore-all lint/a11y/useAltText: tests intentionally omit alt to
 *   verify the audit catches it.
 */
import { describe, expect, test } from "bun:test";
import { audit, attr, errorIssues, render, visibleText } from "./a11y";
import { createElement as h } from "react";

describe("a11y helper · attr", () => {
  test("reads a quoted attribute", () => {
    expect(attr('<button id="x" aria-label="hi">', "aria-label")).toBe("hi");
  });
  test("returns null when missing", () => {
    expect(attr("<button>x</button>", "aria-label")).toBeNull();
  });
  test("returns empty for valueless attribute", () => {
    expect(attr("<button disabled>x</button>", "disabled")).toBe("");
  });
  test("does not match attributes inside the body of a tag", () => {
    expect(attr('<div><span id="inner"></span></div>', "id")).toBeNull();
  });
  test("does not match a name that is a prefix of another attribute", () => {
    // `label` must not pull a value from `aria-label`.
    expect(attr('<button aria-label="Close">x</button>', "label")).toBeNull();
    // `for` must not pull from `forced` or `format`.
    expect(attr('<input forced format="x">', "for")).toBeNull();
  });
  test("matches a self-closing tag terminator", () => {
    expect(attr('<input id="x"/>', "id")).toBe("x");
  });
});

describe("a11y helper · visibleText", () => {
  test("strips HTML and decodes common entities", () => {
    expect(visibleText("<span>Hi &amp; <b>hello</b></span>")).toBe("Hi & hello");
  });
  test("collapses whitespace", () => {
    expect(visibleText("<p>  a   b\n\tc </p>")).toBe("a b c");
  });
});

describe("a11y helper · audit · button", () => {
  test("flags a button with no accessible name", () => {
    const issues = audit(render(h("button", {}, h("span", { "aria-hidden": "true" }))));
    expect(errorIssues(issues).some((i) => i.rule === "button-has-name")).toBe(true);
  });
  test("passes a button with visible text", () => {
    const issues = audit(render(h("button", {}, "Save")));
    expect(errorIssues(issues)).toHaveLength(0);
  });
  test("passes a button with aria-label", () => {
    const issues = audit(render(h("button", { "aria-label": "Close" })));
    expect(errorIssues(issues)).toHaveLength(0);
  });
});

describe("a11y helper · audit · input", () => {
  test("flags an input with no label", () => {
    const issues = audit(render(h("input", { type: "text", placeholder: "Email" })));
    expect(errorIssues(issues).some((i) => i.rule === "input-has-name")).toBe(true);
  });
  test("passes an input with htmlFor label", () => {
    const issues = audit(
      render(
        h(
          "div",
          {},
          h("label", { htmlFor: "x" }, "Email"),
          h("input", { id: "x", type: "text" }),
        ),
      ),
    );
    expect(errorIssues(issues)).toHaveLength(0);
  });
  test("passes an input wrapped in a label", () => {
    const issues = audit(
      render(h("label", {}, "Email", h("input", { type: "text" }))),
    );
    expect(errorIssues(issues)).toHaveLength(0);
  });
  test("ignores hidden / submit / button inputs", () => {
    expect(
      errorIssues(audit(render(h("input", { type: "hidden", name: "csrf" })))),
    ).toHaveLength(0);
    expect(
      errorIssues(audit(render(h("input", { type: "submit", value: "Save" })))),
    ).toHaveLength(0);
  });
});

describe("a11y helper · audit · link", () => {
  test("flags a link with no accessible name", () => {
    const issues = audit(render(h("a", { href: "/x" })));
    expect(errorIssues(issues).some((i) => i.rule === "link-has-name")).toBe(true);
  });
  test("passes a link with visible text", () => {
    const issues = audit(render(h("a", { href: "/x" }, "Home")));
    expect(errorIssues(issues)).toHaveLength(0);
  });
});

describe("a11y helper · audit · img", () => {
  test("flags an img with no alt", () => {
    const issues = audit(render(h("img", { src: "/x.png" })));
    expect(errorIssues(issues).some((i) => i.rule === "img-alt")).toBe(true);
  });
  test("passes a decorative img with empty alt", () => {
    const issues = audit(render(h("img", { src: "/x.png", alt: "" })));
    expect(errorIssues(issues)).toHaveLength(0);
  });
  test("passes an aria-hidden img with no alt", () => {
    const issues = audit(render(h("img", { src: "/x.png", "aria-hidden": "true" })));
    expect(errorIssues(issues)).toHaveLength(0);
  });
});

describe("a11y helper · audit · tabindex", () => {
  test("warns on positive tabindex", () => {
    const issues = audit(render(h("button", { tabIndex: 5 }, "Hi")));
    expect(issues.some((i) => i.rule === "no-positive-tabindex")).toBe(true);
  });
  test("does not warn on tabindex=0 or -1", () => {
    expect(
      audit(render(h("div", { tabIndex: 0 }, "x"))).some(
        (i) => i.rule === "no-positive-tabindex",
      ),
    ).toBe(false);
    expect(
      audit(render(h("div", { tabIndex: -1 }, "x"))).some(
        (i) => i.rule === "no-positive-tabindex",
      ),
    ).toBe(false);
  });
});

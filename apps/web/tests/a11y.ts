/**
 * Lightweight static accessibility helpers for bun:test.
 *
 * These run against `react-dom/server` HTML output, so they can verify
 * structural accessibility (labels, roles, alt text, button content,
 * form-input pairing) without spinning up a DOM/browser. They will not
 * catch dynamic-only issues (e.g. focus management after a click).
 *
 * For interactive checks (focus order, keyboard, contrast under animation)
 * use the Playwright config under `apps/web/tests/e2e` if/when a dev or
 * preview server is available. The static checks here are the floor:
 * if the static HTML is broken for a screen reader, no amount of runtime
 * polish will recover.
 */
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";

export type RenderedHtml = {
  html: string;
  /** Tag occurrences (lowercased name -> outerHTML chunks). */
  tags: Map<string, string[]>;
};

/** Render a React element and pre-index attribute/tag patterns we audit a lot. */
export function render(element: ReactElement): RenderedHtml {
  const html = renderToString(element);
  return { html, tags: indexTags(html) };
}

/**
 * Cheap tag extractor — good enough for the structural a11y checks below.
 * Self-closing tags (br, img, input, hr) are matched as empty bodies.
 * Not a full HTML parser; intentionally string-based to avoid pulling in
 * a DOM implementation just for unit tests.
 */
function indexTags(html: string): Map<string, string[]> {
  const tags = new Map<string, string[]>();
  // Match self-closing or paired tags. Allow nested same-named tags by being
  // non-greedy and tracking depth manually.
  const openTagRegex = /<([a-zA-Z][a-zA-Z0-9-]*)(\s[^>]*)?(\/?)>/g;
  let match: RegExpExecArray | null;
  match = openTagRegex.exec(html);
  while (match !== null) {
    const tagName = match[1].toLowerCase();
    const isSelfClosing = match[3] === "/" || isVoidElement(tagName);
    if (isSelfClosing) {
      const start = match.index;
      const end = match.index + match[0].length;
      const slice = html.slice(start, end);
      pushTag(tags, tagName, slice);
      match = openTagRegex.exec(html);
      continue;
    }
    // Paired tag: walk forward looking for the matching closing tag with a
    // depth counter to ignore identically-named children.
    const closeRegex = new RegExp(
      `</${tagName}>|<${tagName}(?=[\\s/>])`,
      "gi",
    );
    closeRegex.lastIndex = match.index + match[0].length;
    let depth = 1;
    let endIndex = -1;
    let inner: RegExpExecArray | null;
    inner = closeRegex.exec(html);
    while (inner !== null) {
      if (inner[0].startsWith("</")) {
        depth -= 1;
        if (depth === 0) {
          endIndex = inner.index + inner[0].length;
          break;
        }
      } else {
        depth += 1;
      }
      inner = closeRegex.exec(html);
    }
    if (endIndex === -1) {
      // Malformed (or stream truncated) — record open tag only.
      pushTag(tags, tagName, match[0]);
      match = openTagRegex.exec(html);
      continue;
    }
    pushTag(tags, tagName, html.slice(match.index, endIndex));
    // Do NOT advance past `endIndex`: nested tags also need to be indexed,
    // so let the openTagRegex naturally pick up the next open inside this slice.
    match = openTagRegex.exec(html);
  }
  return tags;
}

function pushTag(tags: Map<string, string[]>, name: string, slice: string) {
  const list = tags.get(name);
  if (list) {
    list.push(slice);
  } else {
    tags.set(name, [slice]);
  }
}

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function isVoidElement(tag: string): boolean {
  return VOID_ELEMENTS.has(tag);
}

/** Get attribute value by name (case-insensitive). Returns "" for value-less attrs and null when absent. */
export function attr(slice: string, name: string): string | null {
  // Match the attribute on the OPEN tag only (first chunk before `>`).
  const openEnd = slice.indexOf(">");
  if (openEnd === -1) return null;
  const open = slice.slice(0, openEnd);
  const re = new RegExp(`\\s${name}(?:=("([^"]*)"|'([^']*)'|([^\\s>]+)))?`, "i");
  const m = re.exec(open);
  if (!m) return null;
  return m[2] ?? m[3] ?? m[4] ?? "";
}

/** Strip all HTML tags, decode the few entities we emit, return visible text. */
export function visibleText(slice: string): string {
  const noTags = slice.replace(/<[^>]+>/g, "");
  return noTags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Audit summary: each entry is one accessibility violation.
 * `severity: "error"` are blocking; `severity: "warn"` are advisory.
 */
export type A11yIssue = {
  rule: string;
  severity: "error" | "warn";
  message: string;
  node: string;
};

/**
 * Audit a chunk of HTML for a focused set of structural rules:
 *   - every `<button>` has accessible content (text, aria-label, or aria-labelledby).
 *   - every `<a>` has accessible content (text, aria-label, aria-labelledby, or title).
 *   - every `<input>` has an associated label, aria-label, aria-labelledby, or
 *     placeholder + title. Hidden, button, submit, reset, image variants are exempt.
 *   - every `<img>` has alt (may be empty if presentational).
 *   - every interactive element with role="button" has accessible content.
 *   - no positive `tabindex` (>0) which breaks tab order.
 */
export function audit(rendered: RenderedHtml): A11yIssue[] {
  const issues: A11yIssue[] = [];

  for (const button of rendered.tags.get("button") ?? []) {
    const label = accessibleName(button);
    if (!label) {
      issues.push({
        rule: "button-has-name",
        severity: "error",
        message: "<button> must have visible text, aria-label, or aria-labelledby",
        node: button,
      });
    }
    const tabindex = attr(button, "tabindex");
    if (tabindex && Number.parseInt(tabindex, 10) > 0) {
      issues.push({
        rule: "no-positive-tabindex",
        severity: "warn",
        message: "Avoid positive tabindex (breaks natural tab order)",
        node: button,
      });
    }
    const disabled = attr(button, "disabled");
    const ariaDisabled = attr(button, "aria-disabled");
    if (ariaDisabled === "" && disabled === null) {
      // aria-disabled with empty value is valid as "true" in HTML5 boolean parsing,
      // but on its own without `disabled` it leaves the button focusable yet inert.
      // That is fine; do not flag.
    }
  }

  for (const link of rendered.tags.get("a") ?? []) {
    const href = attr(link, "href");
    if (href === null) continue; // anchors used purely as named targets are OK.
    const label = accessibleName(link) || attr(link, "title");
    if (!label) {
      issues.push({
        rule: "link-has-name",
        severity: "error",
        message: "<a> must have visible text, aria-label, aria-labelledby, or title",
        node: link,
      });
    }
  }

  for (const input of rendered.tags.get("input") ?? []) {
    const type = (attr(input, "type") ?? "text").toLowerCase();
    if (
      type === "hidden" ||
      type === "submit" ||
      type === "reset" ||
      type === "button" ||
      type === "image"
    ) {
      continue;
    }
    const id = attr(input, "id");
    const ariaLabel = attr(input, "aria-label");
    const ariaLabelledBy = attr(input, "aria-labelledby");
    const placeholder = attr(input, "placeholder");
    const hasMatchingLabel = id ? hasLabelFor(rendered, id) : false;
    const hasWrappingLabel = isInsideLabel(rendered, input);
    const hasName = Boolean(
      ariaLabel || ariaLabelledBy || hasMatchingLabel || hasWrappingLabel,
    );
    if (!hasName) {
      issues.push({
        rule: "input-has-name",
        severity: "error",
        message:
          "<input> needs an associated <label htmlFor>, aria-label, aria-labelledby, or to be wrapped in <label>",
        node: input,
      });
    }
    if (!hasName && placeholder) {
      // Strictly placeholder is not a label, but flag separately so the
      // failure message is easier to act on.
      issues.push({
        rule: "input-placeholder-not-label",
        severity: "warn",
        message: "Placeholder is not an accessible name; add aria-label or <label>",
        node: input,
      });
    }
  }

  for (const textarea of rendered.tags.get("textarea") ?? []) {
    const id = attr(textarea, "id");
    const ariaLabel = attr(textarea, "aria-label");
    const ariaLabelledBy = attr(textarea, "aria-labelledby");
    const hasMatchingLabel = id ? hasLabelFor(rendered, id) : false;
    const hasWrappingLabel = isInsideLabel(rendered, textarea);
    if (!ariaLabel && !ariaLabelledBy && !hasMatchingLabel && !hasWrappingLabel) {
      issues.push({
        rule: "textarea-has-name",
        severity: "error",
        message:
          "<textarea> needs an associated <label htmlFor>, aria-label, aria-labelledby, or to be wrapped in <label>",
        node: textarea,
      });
    }
  }

  for (const img of rendered.tags.get("img") ?? []) {
    const alt = attr(img, "alt");
    const ariaHidden = attr(img, "aria-hidden");
    const role = attr(img, "role");
    if (alt === null && ariaHidden !== "true" && role !== "presentation") {
      issues.push({
        rule: "img-alt",
        severity: "error",
        message: "<img> must have alt (use alt=\"\" for decorative)",
        node: img,
      });
    }
  }

  // Positive tabindex anywhere is a smell.
  for (const [tagName, slices] of rendered.tags) {
    if (tagName === "button" || tagName === "a") continue; // already checked above
    for (const slice of slices) {
      const tabindex = attr(slice, "tabindex");
      if (tabindex && Number.parseInt(tabindex, 10) > 0) {
        issues.push({
          rule: "no-positive-tabindex",
          severity: "warn",
          message: "Avoid positive tabindex (breaks natural tab order)",
          node: slice,
        });
      }
    }
  }

  return issues;
}

/** Visible text from inside a tag, or aria-label/labelledby on the open tag. */
function accessibleName(slice: string): string {
  const ariaLabel = attr(slice, "aria-label");
  if (ariaLabel) return ariaLabel.trim();
  const ariaLabelledBy = attr(slice, "aria-labelledby");
  if (ariaLabelledBy) return ariaLabelledBy.trim();
  return visibleText(slice);
}

function hasLabelFor(rendered: RenderedHtml, id: string): boolean {
  for (const label of rendered.tags.get("label") ?? []) {
    const htmlFor = attr(label, "for");
    if (htmlFor === id) return true;
  }
  return false;
}

function isInsideLabel(rendered: RenderedHtml, control: string): boolean {
  // Cheap: if any <label> outerHTML contains the control's outer HTML, it wraps it.
  for (const label of rendered.tags.get("label") ?? []) {
    if (label.includes(control)) return true;
  }
  return false;
}

/** Pretty issue list for assertion failure output. */
export function formatIssues(issues: A11yIssue[]): string {
  return issues
    .map((i) => `[${i.severity}] ${i.rule}: ${i.message}\n  in: ${truncate(i.node, 200)}`)
    .join("\n");
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

/** Convenience: only `error` severity issues — these block tests. */
export function errorIssues(issues: A11yIssue[]): A11yIssue[] {
  return issues.filter((i) => i.severity === "error");
}

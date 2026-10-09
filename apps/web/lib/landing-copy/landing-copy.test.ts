import { describe, expect, test } from "bun:test";
import { getLandingCopy } from ".";

function shape(value: unknown): unknown {
  if (typeof value === "string") return "string";
  if (Array.isArray(value)) return value.map(shape);
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, child]) => [key, shape(child)]),
  );
}

function strings(value: unknown, path = "copy"): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  if (Array.isArray(value)) {
    return value.flatMap((child, index) => strings(child, `${path}[${index}]`));
  }
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    strings(child, `${path}.${key}`),
  );
}

describe("landing copy dictionaries", () => {
  test("Hebrew has the same deep shape as English", () => {
    expect(shape(getLandingCopy("he"))).toEqual(shape(getLandingCopy("en")));
  });

  test("neither dictionary contains empty strings", () => {
    for (const language of ["en", "he"] as const) {
      for (const [path, value] of strings(getLandingCopy(language))) {
        expect(value.trim(), `${language}:${path}`).not.toBe("");
      }
    }
  });

  test("Hebrew strings contain Hebrew copy", () => {
    for (const [path, value] of strings(getLandingCopy("he"))) {
      expect(value, path).toMatch(/[\u0590-\u05ff]/u);
    }
  });
});

import { describe, expect, test } from "bun:test";
import {
  buildBetaAllowlist,
  canClaimBetaSeat,
  countActiveBetaTesters,
  DEFAULT_BETA_MAX_TESTERS,
  isEmailAllowlisted,
  normalizeEmail,
  parseAllowlistCsv,
  parseBetaMaxTesters,
} from "./beta_access";

describe("normalizeEmail", () => {
  test("trims and lowercases", () => {
    expect(normalizeEmail("  User@Example.COM  ")).toBe("user@example.com");
  });

  test("returns empty string for nullish input", () => {
    expect(normalizeEmail(null)).toBe("");
    expect(normalizeEmail(undefined)).toBe("");
  });
});

describe("parseAllowlistCsv", () => {
  test("parses comma-separated emails", () => {
    expect(parseAllowlistCsv("a@x.com, B@Y.com , ,c@z.com")).toEqual([
      "a@x.com",
      "b@y.com",
      "c@z.com",
    ]);
  });
});

describe("buildBetaAllowlist", () => {
  test("always includes founder email", () => {
    const list = buildBetaAllowlist("", "Founder@Tempo.dev");
    expect(isEmailAllowlisted("founder@tempo.dev", list)).toBe(true);
  });

  test("merges env entries with founder", () => {
    const list = buildBetaAllowlist("friend@x.com", "founder@tempo.dev");
    expect(isEmailAllowlisted("friend@x.com", list)).toBe(true);
    expect(isEmailAllowlisted("founder@tempo.dev", list)).toBe(true);
    expect(isEmailAllowlisted("stranger@x.com", list)).toBe(false);
  });
});

describe("parseBetaMaxTesters", () => {
  test("uses valid positive integer", () => {
    expect(parseBetaMaxTesters("50")).toBe(50);
  });

  test("falls back on zero, negative, or non-numeric", () => {
    expect(parseBetaMaxTesters("0")).toBe(DEFAULT_BETA_MAX_TESTERS);
    expect(parseBetaMaxTesters("-5")).toBe(DEFAULT_BETA_MAX_TESTERS);
    expect(parseBetaMaxTesters("not-a-number")).toBe(DEFAULT_BETA_MAX_TESTERS);
    expect(parseBetaMaxTesters(null)).toBe(DEFAULT_BETA_MAX_TESTERS);
  });
});

describe("countActiveBetaTesters", () => {
  test("counts only non-deleted testers", () => {
    const count = countActiveBetaTesters([
      { betaAccess: "tester" },
      { betaAccess: "tester", deletedAt: 1 },
      { betaAccess: "founder" },
      { betaAccess: "tester" },
    ]);
    expect(count).toBe(2);
  });
});

describe("canClaimBetaSeat", () => {
  test("founder always bypasses seat cap", () => {
    expect(canClaimBetaSeat(true, 999, 30)).toBe(true);
  });

  test("non-founder blocked at cap", () => {
    expect(canClaimBetaSeat(false, 30, 30)).toBe(false);
    expect(canClaimBetaSeat(false, 29, 30)).toBe(true);
  });
});

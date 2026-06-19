import { describe, expect, test } from "bun:test";
import {
  buildAllowlistedEmails,
  countActiveBetaTesters,
  DEFAULT_BETA_MAX_TESTERS,
  DEFAULT_FOUNDER_EMAIL,
  isBetaSeatAvailable,
  isFounderEmail,
  normalizeEmail,
  parseBetaMaxTesters,
  resolveFounderEmail,
} from "./authBeta";

describe("normalizeEmail", () => {
  test("trims and lowercases", () => {
    expect(normalizeEmail("  User@Example.COM  ")).toBe("user@example.com");
  });

  test("returns empty string for nullish input", () => {
    expect(normalizeEmail(null)).toBe("");
    expect(normalizeEmail(undefined)).toBe("");
  });
});

describe("parseBetaMaxTesters", () => {
  test("parses a valid positive integer", () => {
    expect(parseBetaMaxTesters("42")).toBe(42);
  });

  test("falls back to default for zero, negative, or non-numeric values", () => {
    expect(parseBetaMaxTesters("0")).toBe(DEFAULT_BETA_MAX_TESTERS);
    expect(parseBetaMaxTesters("-5")).toBe(DEFAULT_BETA_MAX_TESTERS);
    expect(parseBetaMaxTesters("not-a-number")).toBe(DEFAULT_BETA_MAX_TESTERS);
    expect(parseBetaMaxTesters(null)).toBe(DEFAULT_BETA_MAX_TESTERS);
  });
});

describe("resolveFounderEmail", () => {
  test("uses env override when provided", () => {
    expect(resolveFounderEmail("Founder@Tempo.app")).toBe("founder@tempo.app");
  });

  test("falls back to repo default", () => {
    expect(resolveFounderEmail(null)).toBe(DEFAULT_FOUNDER_EMAIL);
  });
});

describe("buildAllowlistedEmails", () => {
  test("always includes founder even when env list is empty", () => {
    const founder = "founder@tempo.app";
    const allowlist = buildAllowlistedEmails("", founder);
    expect(allowlist.has(founder)).toBe(true);
    expect(allowlist.size).toBe(1);
  });

  test("parses comma-separated env emails and normalizes them", () => {
    const founder = "founder@tempo.app";
    const allowlist = buildAllowlistedEmails(
      " Alpha@Example.com , beta@example.com ,, ",
      founder,
    );
    expect(allowlist.has("alpha@example.com")).toBe(true);
    expect(allowlist.has("beta@example.com")).toBe(true);
    expect(allowlist.has(founder)).toBe(true);
  });
});

describe("countActiveBetaTesters", () => {
  test("ignores soft-deleted users", () => {
    const count = countActiveBetaTesters([
      { deletedAt: undefined },
      { deletedAt: 1 },
      {},
    ]);
    expect(count).toBe(2);
  });
});

describe("isBetaSeatAvailable", () => {
  test("allows signup when under cap", () => {
    expect(isBetaSeatAvailable(29, 30)).toBe(true);
  });

  test("blocks signup when at cap", () => {
    expect(isBetaSeatAvailable(30, 30)).toBe(false);
  });

  test("blocks signup when over cap", () => {
    expect(isBetaSeatAvailable(31, 30)).toBe(false);
  });
});

describe("isFounderEmail", () => {
  test("matches case-insensitively", () => {
    expect(isFounderEmail("Founder@Tempo.app", "founder@tempo.app")).toBe(true);
    expect(isFounderEmail("other@example.com", "founder@tempo.app")).toBe(false);
  });
});

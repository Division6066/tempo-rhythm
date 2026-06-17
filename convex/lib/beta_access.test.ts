import { describe, expect, test } from "bun:test";
import {
  buildAllowlistedEmails,
  canClaimBetaTesterSeat,
  countActiveBetaTesters,
  isEmailAllowlisted,
  normalizeEmail,
  parseBetaMaxTesters,
  resolveFounderEmail,
} from "./beta_access";

describe("normalizeEmail", () => {
  test("lowercases and trims", () => {
    expect(normalizeEmail("  Test@Example.COM  ")).toBe("test@example.com");
  });

  test("returns empty string for null/undefined", () => {
    expect(normalizeEmail(null)).toBe("");
    expect(normalizeEmail(undefined)).toBe("");
  });
});

describe("parseBetaMaxTesters", () => {
  test("defaults to 30 when env is missing", () => {
    expect(parseBetaMaxTesters(undefined)).toBe(30);
  });

  test("parses valid positive integer", () => {
    expect(parseBetaMaxTesters("50")).toBe(50);
  });

  test("falls back to 30 for invalid values", () => {
    expect(parseBetaMaxTesters("not-a-number")).toBe(30);
    expect(parseBetaMaxTesters("0")).toBe(30);
    expect(parseBetaMaxTesters("-5")).toBe(30);
  });
});

describe("buildAllowlistedEmails", () => {
  test("always includes founder email", () => {
    const set = buildAllowlistedEmails("", "founder@example.com");
    expect(isEmailAllowlisted("founder@example.com", set)).toBe(true);
  });

  test("parses comma-separated allowlist", () => {
    const set = buildAllowlistedEmails("a@test.com, B@test.com ", "founder@example.com");
    expect(isEmailAllowlisted("a@test.com", set)).toBe(true);
    expect(isEmailAllowlisted("b@test.com", set)).toBe(true);
    expect(isEmailAllowlisted("stranger@test.com", set)).toBe(false);
  });
});

describe("resolveFounderEmail", () => {
  test("uses env override when provided", () => {
    expect(resolveFounderEmail("custom@founder.com")).toBe("custom@founder.com");
  });

  test("falls back to default founder email", () => {
    expect(resolveFounderEmail(undefined)).toBe("amitlevin65@protonmail.com");
  });
});

describe("countActiveBetaTesters", () => {
  test("counts only active testers", () => {
    const count = countActiveBetaTesters([
      { betaAccess: "tester" },
      { betaAccess: "tester", deletedAt: 1 },
      { betaAccess: "founder" },
      { betaAccess: "tester" },
    ]);
    expect(count).toBe(2);
  });
});

describe("canClaimBetaTesterSeat", () => {
  test("founder always bypasses cap", () => {
    expect(canClaimBetaTesterSeat(30, 30, true)).toBe(true);
    expect(canClaimBetaTesterSeat(100, 30, true)).toBe(true);
  });

  test("non-founder blocked when at cap", () => {
    expect(canClaimBetaTesterSeat(30, 30, false)).toBe(false);
    expect(canClaimBetaTesterSeat(31, 30, false)).toBe(false);
  });

  test("non-founder allowed when under cap", () => {
    expect(canClaimBetaTesterSeat(29, 30, false)).toBe(true);
    expect(canClaimBetaTesterSeat(0, 30, false)).toBe(true);
  });
});

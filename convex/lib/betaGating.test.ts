import { describe, expect, test } from "bun:test";
import {
  buildAllowlist,
  checkBetaSignupEligibility,
  countActiveTesters,
  DEFAULT_BETA_MAX_TESTERS,
  normalizeEmail,
  parseBetaMaxTesters,
} from "./betaGating";

describe("normalizeEmail", () => {
  test("trims and lowercases", () => {
    expect(normalizeEmail("  Foo@Bar.COM ")).toBe("foo@bar.com");
  });

  test("handles null/undefined as empty string", () => {
    expect(normalizeEmail(null)).toBe("");
    expect(normalizeEmail(undefined)).toBe("");
  });
});

describe("parseBetaMaxTesters", () => {
  test("returns parsed positive integer", () => {
    expect(parseBetaMaxTesters("42")).toBe(42);
    expect(parseBetaMaxTesters(15)).toBe(15);
  });

  test("falls back for invalid or non-positive values", () => {
    expect(parseBetaMaxTesters("not-a-number")).toBe(DEFAULT_BETA_MAX_TESTERS);
    expect(parseBetaMaxTesters("0")).toBe(DEFAULT_BETA_MAX_TESTERS);
    expect(parseBetaMaxTesters("-5")).toBe(DEFAULT_BETA_MAX_TESTERS);
    expect(parseBetaMaxTesters(undefined)).toBe(DEFAULT_BETA_MAX_TESTERS);
  });
});

describe("buildAllowlist", () => {
  test("includes founder email and normalized env entries", () => {
    const allowlist = buildAllowlist(" Alice@Example.com , bob@test.io ", "Founder@Tempo.dev");
    expect(allowlist.has("founder@tempo.dev")).toBe(true);
    expect(allowlist.has("alice@example.com")).toBe(true);
    expect(allowlist.has("bob@test.io")).toBe(true);
  });

  test("ignores blank comma-separated entries", () => {
    const allowlist = buildAllowlist(" ,  , ", "founder@test.io");
    expect(allowlist.size).toBe(1);
    expect(allowlist.has("founder@test.io")).toBe(true);
  });
});

describe("countActiveTesters", () => {
  test("counts only non-deleted testers", () => {
    const count = countActiveTesters([
      { betaAccess: "tester" },
      { betaAccess: "tester", deletedAt: 1 },
      { betaAccess: "founder" },
      { betaAccess: "tester" },
      {},
    ]);
    expect(count).toBe(2);
  });
});

describe("checkBetaSignupEligibility", () => {
  const founder = "founder@tempo.dev";
  const allowlist = new Set([founder, "invited@example.com"]);

  test("rejects non-allowlisted email", () => {
    const result = checkBetaSignupEligibility({
      email: "stranger@example.com",
      allowlist,
      activeTesterCount: 0,
      maxTesters: 30,
      isFounder: false,
    });
    expect(result).toEqual({ allowed: false, reason: "not_allowlisted" });
  });

  test("allows allowlisted email when seats remain", () => {
    const result = checkBetaSignupEligibility({
      email: "invited@example.com",
      allowlist,
      activeTesterCount: 29,
      maxTesters: 30,
      isFounder: false,
    });
    expect(result).toEqual({ allowed: true });
  });

  test("blocks non-founder when seat cap is reached", () => {
    const result = checkBetaSignupEligibility({
      email: "invited@example.com",
      allowlist,
      activeTesterCount: 30,
      maxTesters: 30,
      isFounder: false,
    });
    expect(result).toEqual({ allowed: false, reason: "seats_full" });
  });

  test("founder bypasses seat cap", () => {
    const result = checkBetaSignupEligibility({
      email: founder,
      allowlist,
      activeTesterCount: 30,
      maxTesters: 30,
      isFounder: true,
    });
    expect(result).toEqual({ allowed: true });
  });

  test("normalizes email before allowlist lookup", () => {
    const result = checkBetaSignupEligibility({
      email: "  Invited@Example.COM ",
      allowlist,
      activeTesterCount: 0,
      maxTesters: 30,
      isFounder: false,
    });
    expect(result).toEqual({ allowed: true });
  });
});

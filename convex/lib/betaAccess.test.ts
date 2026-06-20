import { describe, expect, test } from "bun:test";
import {
  countActiveBetaTesters,
  DEFAULT_BETA_MAX_TESTERS,
  DEFAULT_FOUNDER_EMAIL,
  evaluateBetaSignup,
  getAllowlistedEmails,
  getBetaMaxTesters,
  getFounderEmail,
  normalizeEmail,
} from "./betaAccess";

describe("normalizeEmail", () => {
  test("lowercases and trims", () => {
    expect(normalizeEmail("  Test@Example.COM  ")).toBe("test@example.com");
  });

  test("returns empty string for nullish input", () => {
    expect(normalizeEmail(null)).toBe("");
    expect(normalizeEmail(undefined)).toBe("");
  });
});

describe("getFounderEmail", () => {
  test("defaults to the canonical founder address", () => {
    expect(getFounderEmail()).toBe(DEFAULT_FOUNDER_EMAIL);
  });

  test("normalizes env override", () => {
    expect(getFounderEmail("  Founder@Tempo.dev ")).toBe("founder@tempo.dev");
  });
});

describe("getAllowlistedEmails", () => {
  test("always includes founder even when env list is empty", () => {
    const allowlist = getAllowlistedEmails("", DEFAULT_FOUNDER_EMAIL);
    expect(allowlist.has(DEFAULT_FOUNDER_EMAIL)).toBe(true);
  });

  test("parses comma-separated env list and normalizes entries", () => {
    const allowlist = getAllowlistedEmails(
      " alice@test.com , BOB@test.com ",
      "founder@test.com",
    );
    expect(allowlist.has("alice@test.com")).toBe(true);
    expect(allowlist.has("bob@test.com")).toBe(true);
    expect(allowlist.has("founder@test.com")).toBe(true);
  });
});

describe("getBetaMaxTesters", () => {
  test("defaults to 30", () => {
    expect(getBetaMaxTesters()).toBe(DEFAULT_BETA_MAX_TESTERS);
  });

  test("parses positive integer env values", () => {
    expect(getBetaMaxTesters("42")).toBe(42);
  });

  test("falls back when env is invalid or non-positive", () => {
    expect(getBetaMaxTesters("0")).toBe(DEFAULT_BETA_MAX_TESTERS);
    expect(getBetaMaxTesters("-5")).toBe(DEFAULT_BETA_MAX_TESTERS);
    expect(getBetaMaxTesters("not-a-number")).toBe(DEFAULT_BETA_MAX_TESTERS);
  });
});

describe("countActiveBetaTesters", () => {
  test("counts only active tester rows", () => {
    const count = countActiveBetaTesters([
      { betaAccess: "tester" },
      { betaAccess: "tester", deletedAt: 1 },
      { betaAccess: "founder" },
      { betaAccess: "tester" },
    ]);
    expect(count).toBe(2);
  });
});

describe("evaluateBetaSignup", () => {
  const allowlist = getAllowlistedEmails("invitee@test.com", DEFAULT_FOUNDER_EMAIL);

  test("rejects emails not on the allowlist", () => {
    const decision = evaluateBetaSignup({
      email: "stranger@test.com",
      allowlistedEmails: allowlist,
      isFounder: false,
      activeTesterCount: 0,
      maxTesters: 30,
    });
    expect(decision).toEqual({ allowed: false, reason: "not_allowlisted" });
  });

  test("allows founder even when beta seats are full", () => {
    const decision = evaluateBetaSignup({
      email: DEFAULT_FOUNDER_EMAIL,
      allowlistedEmails: allowlist,
      isFounder: true,
      activeTesterCount: 30,
      maxTesters: 30,
    });
    expect(decision).toEqual({ allowed: true });
  });

  test("blocks new testers when seat cap is reached", () => {
    const decision = evaluateBetaSignup({
      email: "invitee@test.com",
      allowlistedEmails: allowlist,
      isFounder: false,
      activeTesterCount: 30,
      maxTesters: 30,
    });
    expect(decision).toEqual({ allowed: false, reason: "seats_full" });
  });

  test("allows invitee when seats remain", () => {
    const decision = evaluateBetaSignup({
      email: "invitee@test.com",
      allowlistedEmails: allowlist,
      isFounder: false,
      activeTesterCount: 29,
      maxTesters: 30,
    });
    expect(decision).toEqual({ allowed: true });
  });
});

import { describe, expect, test } from "bun:test";
import {
  areBetaSeatsFull,
  countActiveBetaTesters,
  DEFAULT_BETA_MAX_TESTERS,
  DEFAULT_FOUNDER_EMAIL,
  isAllowlisted,
  isFounderEmail,
  normalizeEmail,
  resolveBetaAccessConfig,
} from "./betaAccess";

describe("normalizeEmail", () => {
  test("lowercases and trims", () => {
    expect(normalizeEmail("  User@Example.COM  ")).toBe("user@example.com");
  });

  test("returns empty string for nullish input", () => {
    expect(normalizeEmail(null)).toBe("");
    expect(normalizeEmail(undefined)).toBe("");
  });
});

describe("resolveBetaAccessConfig", () => {
  test("defaults founder email and max testers when env is empty", () => {
    const config = resolveBetaAccessConfig({});
    expect(config.founderEmail).toBe(DEFAULT_FOUNDER_EMAIL);
    expect(config.maxTesters).toBe(DEFAULT_BETA_MAX_TESTERS);
    expect(config.allowlistedEmails.has(DEFAULT_FOUNDER_EMAIL)).toBe(true);
  });

  test("parses comma-separated allowlist and always includes founder", () => {
    const config = resolveBetaAccessConfig({
      BETA_FOUNDER_EMAIL: "founder@tempo.test",
      BETA_ALLOWLIST_EMAILS: " Alpha@Example.com , beta@example.com ,",
    });
    expect(config.founderEmail).toBe("founder@tempo.test");
    expect(config.allowlistedEmails.has("founder@tempo.test")).toBe(true);
    expect(config.allowlistedEmails.has("alpha@example.com")).toBe(true);
    expect(config.allowlistedEmails.has("beta@example.com")).toBe(true);
  });

  test("falls back to default max testers for invalid env values", () => {
    expect(resolveBetaAccessConfig({ BETA_MAX_TESTERS: "0" }).maxTesters).toBe(
      DEFAULT_BETA_MAX_TESTERS,
    );
    expect(resolveBetaAccessConfig({ BETA_MAX_TESTERS: "not-a-number" }).maxTesters).toBe(
      DEFAULT_BETA_MAX_TESTERS,
    );
    expect(resolveBetaAccessConfig({ BETA_MAX_TESTERS: "-5" }).maxTesters).toBe(
      DEFAULT_BETA_MAX_TESTERS,
    );
  });

  test("accepts positive integer max testers", () => {
    expect(resolveBetaAccessConfig({ BETA_MAX_TESTERS: "12" }).maxTesters).toBe(12);
  });
});

describe("isFounderEmail", () => {
  test("matches case-insensitively", () => {
    expect(isFounderEmail("Founder@Tempo.Test", "founder@tempo.test")).toBe(true);
    expect(isFounderEmail("other@example.com", "founder@tempo.test")).toBe(false);
  });
});

describe("isAllowlisted", () => {
  test("checks normalized email against allowlist set", () => {
    const allowlist = new Set(["alpha@example.com"]);
    expect(isAllowlisted(" Alpha@Example.com ", allowlist)).toBe(true);
    expect(isAllowlisted("gamma@example.com", allowlist)).toBe(false);
  });
});

describe("countActiveBetaTesters", () => {
  test("counts only active testers (excludes founders and soft-deleted)", () => {
    const count = countActiveBetaTesters([
      { betaAccess: "tester" },
      { betaAccess: "tester", deletedAt: Date.now() },
      { betaAccess: "founder" },
      { betaAccess: undefined },
      { betaAccess: "tester" },
    ]);
    expect(count).toBe(2);
  });
});

describe("areBetaSeatsFull", () => {
  test("is full at the cap and above", () => {
    expect(areBetaSeatsFull(30, 30)).toBe(true);
    expect(areBetaSeatsFull(31, 30)).toBe(true);
    expect(areBetaSeatsFull(29, 30)).toBe(false);
  });
});

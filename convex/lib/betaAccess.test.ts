import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
  buildAllowlistedEmails,
  DEFAULT_BETA_MAX_TESTERS,
  DEFAULT_FOUNDER_EMAIL,
  normalizeEmail,
  parseBetaMaxTesters,
  resolveFounderEmail,
} from "./betaAccess";

describe("normalizeEmail", () => {
  test("trims and lowercases", () => {
    expect(normalizeEmail("  Test@Example.COM  ")).toBe("test@example.com");
  });

  test("returns empty string for nullish input", () => {
    expect(normalizeEmail(null)).toBe("");
    expect(normalizeEmail(undefined)).toBe("");
  });
});

describe("resolveFounderEmail", () => {
  test("uses env override when provided", () => {
    expect(resolveFounderEmail("Founder@Tempo.app")).toBe("founder@tempo.app");
  });

  test("falls back to default founder email", () => {
    expect(resolveFounderEmail(undefined)).toBe(DEFAULT_FOUNDER_EMAIL);
  });
});

describe("parseBetaMaxTesters", () => {
  test("parses positive integer from env string", () => {
    expect(parseBetaMaxTesters("42")).toBe(42);
  });

  test("rejects zero, negative, and non-numeric values", () => {
    expect(parseBetaMaxTesters("0")).toBe(DEFAULT_BETA_MAX_TESTERS);
    expect(parseBetaMaxTesters("-5")).toBe(DEFAULT_BETA_MAX_TESTERS);
    expect(parseBetaMaxTesters("not-a-number")).toBe(DEFAULT_BETA_MAX_TESTERS);
  });

  test("uses custom fallback when env is missing", () => {
    expect(parseBetaMaxTesters(undefined, 10)).toBe(10);
  });
});

describe("buildAllowlistedEmails", () => {
  test("always includes founder even when allowlist env is empty", () => {
    const founder = "founder@tempo.app";
    const set = buildAllowlistedEmails(undefined, founder);
    expect(set.has(founder)).toBe(true);
    expect(set.size).toBe(1);
  });

  test("parses comma-separated allowlist and normalizes entries", () => {
    const founder = "founder@tempo.app";
    const set = buildAllowlistedEmails(" Beta@One.com , , BETA@TWO.com ", founder);
    expect(set.has("founder@tempo.app")).toBe(true);
    expect(set.has("beta@one.com")).toBe(true);
    expect(set.has("beta@two.com")).toBe(true);
    expect(set.size).toBe(3);
  });
});

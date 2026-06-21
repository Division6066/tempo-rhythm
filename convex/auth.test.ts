import { describe, expect, test } from "bun:test";
import { normalizeEmail, getFounderEmail, getAllowlistedEmails, getBetaMaxTesters, DEFAULT_FOUNDER_EMAIL } from "./authLogic";

describe("auth logic", () => {
  describe("normalizeEmail", () => {
    test("handles undefined and null", () => {
      expect(normalizeEmail(undefined)).toBe("");
      expect(normalizeEmail(null as any)).toBe("");
    });

    test("trims and lowercases", () => {
      expect(normalizeEmail("  Test@Example.com  ")).toBe("test@example.com");
      expect(normalizeEmail("user+1@DOMAIN.COM")).toBe("user+1@domain.com");
    });
  });

  describe("getFounderEmail", () => {
    test("returns default when env is empty", () => {
      expect(getFounderEmail(undefined)).toBe(DEFAULT_FOUNDER_EMAIL);
    });

    test("normalizes env value", () => {
      expect(getFounderEmail(" Founder@App.com ")).toBe("founder@app.com");
    });
  });

  describe("getAllowlistedEmails", () => {
    test("parses csv and normalizes", () => {
      const result = getAllowlistedEmails("Test1@app.com,  test2@App.com ", undefined);
      expect(result.has("test1@app.com")).toBe(true);
      expect(result.has("test2@app.com")).toBe(true);
    });

    test("always includes founder", () => {
      const result = getAllowlistedEmails("", "founder@test.com");
      expect(result.has("founder@test.com")).toBe(true);
    });
  });

  describe("getBetaMaxTesters", () => {
    test("parses valid number", () => {
      expect(getBetaMaxTesters("50")).toBe(50);
    });

    test("falls back on invalid", () => {
      expect(getBetaMaxTesters("invalid")).toBe(30);
      expect(getBetaMaxTesters("-5")).toBe(30);
      expect(getBetaMaxTesters("0")).toBe(30);
    });
  });
});

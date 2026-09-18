import { describe, expect, test } from "bun:test";
import { normalizeProviderKeyInput } from "./providerKeys";

describe("normalizeProviderKeyInput", () => {
  test("trims a saved provider key before storage", () => {
    expect(normalizeProviderKeyInput("  tfk_test_saved_key  ")).toBe("tfk_test_saved_key");
  });

  test("rejects short provider keys", () => {
    expect(() => normalizeProviderKeyInput(" short ")).toThrow(/at least 8 characters/i);
  });
});

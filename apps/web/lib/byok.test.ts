import { describe, expect, test } from "bun:test";
import { buildByokProviderRequest, maskProviderKey } from "./byok";

describe("BYOK provider helpers", () => {
  test("masks provider keys without exposing the secret", () => {
    expect(maskProviderKey("tfk_live_1234567890abcdef")).toBe("tfk_...cdef");
    expect(maskProviderKey("short")).toBe("Saved");
  });

  test("builds a provider request with the saved key in the auth header", () => {
    const request = buildByokProviderRequest({
      apiKey: "tfk_test_saved_key_123",
      message: "Can you hear me?",
      provider: "mistral",
    });

    expect(request.url).toBe("/api/byok/mock-provider");
    expect(request.init.method).toBe("POST");
    expect(request.init.headers).toEqual({
      Authorization: "Bearer tfk_test_saved_key_123",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(request.init.body))).toEqual({
      messages: [{ content: "Can you hear me?", role: "user" }],
      model: "mistral-small-latest",
      provider: "mistral",
    });
  });
});

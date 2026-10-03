import { describe, expect, test } from "bun:test";
import { getConvexUrl, readPublicConvexUrl } from "../../apps/mobile/utils/convexConfig";

describe("readPublicConvexUrl", () => {
  test("returns null when the env var is missing", () => {
    expect(readPublicConvexUrl({})).toBeNull();
  });

  test("returns null for blank values so Expo web export can keep going", () => {
    expect(readPublicConvexUrl({ EXPO_PUBLIC_CONVEX_URL: "" })).toBeNull();
    expect(readPublicConvexUrl({ EXPO_PUBLIC_CONVEX_URL: "   " })).toBeNull();
  });

  test("returns a trimmed URL when one is set", () => {
    expect(
      readPublicConvexUrl({
        EXPO_PUBLIC_CONVEX_URL: " https://example.convex.cloud ",
      }),
    ).toBe("https://example.convex.cloud");
  });
});

describe("getConvexUrl", () => {
  test("still throws when callers need a required URL", () => {
    expect(() => getConvexUrl({})).toThrow(/EXPO_PUBLIC_CONVEX_URL/);
  });

  test("returns the URL when present", () => {
    expect(
      getConvexUrl({ EXPO_PUBLIC_CONVEX_URL: "https://example.convex.cloud" }),
    ).toBe("https://example.convex.cloud");
  });
});

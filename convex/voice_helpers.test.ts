import { describe, expect, test } from "bun:test";
import {
  buildCallbackUrl,
  clampSessionDurationMs,
  isValidLocalDay,
  streamingCapMinutes,
  timingSafeEqualStrings,
  usedStreamingMs,
} from "./lib/voice_helpers";

describe("streamingCapMinutes (HARD_RULES §9)", () => {
  test("basic 30 / pro 90 / max 180", () => {
    expect(streamingCapMinutes("basic")).toBe(30);
    expect(streamingCapMinutes("pro")).toBe(90);
    expect(streamingCapMinutes("max")).toBe(180);
  });
  test("god is unlimited (null)", () => {
    expect(streamingCapMinutes("god")).toBeNull();
  });
  test("none and undefined get zero live-voice minutes", () => {
    expect(streamingCapMinutes("none")).toBe(0);
    expect(streamingCapMinutes(undefined)).toBe(0);
  });
});

describe("clampSessionDurationMs", () => {
  test("clamps negatives and NaN to 0", () => {
    expect(clampSessionDurationMs(-5)).toBe(0);
    expect(clampSessionDurationMs(Number.NaN)).toBe(0);
  });
  test("clamps to the 2 h ceiling", () => {
    expect(clampSessionDurationMs(9 * 60 * 60 * 1000)).toBe(2 * 60 * 60 * 1000);
  });
  test("passes sane values through", () => {
    expect(clampSessionDurationMs(90_000)).toBe(90_000);
  });
});

describe("isValidLocalDay", () => {
  test("accepts YYYY-MM-DD", () => {
    expect(isValidLocalDay("2026-08-13")).toBe(true);
  });
  test("rejects other shapes", () => {
    expect(isValidLocalDay("2026-8-13")).toBe(false);
    expect(isValidLocalDay("13/08/2026")).toBe(false);
    expect(isValidLocalDay("")).toBe(false);
    expect(isValidLocalDay("2026-08-13T00:00:00Z")).toBe(false);
  });
});

describe("timingSafeEqualStrings", () => {
  test("equal strings match", () => {
    expect(timingSafeEqualStrings("secret-value", "secret-value")).toBe(true);
  });
  test("different strings do not match", () => {
    expect(timingSafeEqualStrings("secret-value", "secret-valuf")).toBe(false);
  });
  test("different lengths do not match", () => {
    expect(timingSafeEqualStrings("short", "short-but-longer")).toBe(false);
  });
  test("empty vs non-empty does not match", () => {
    expect(timingSafeEqualStrings("", "x")).toBe(false);
    expect(timingSafeEqualStrings("x", "")).toBe(false);
  });
  test("empty vs empty matches", () => {
    expect(timingSafeEqualStrings("", "")).toBe(true);
  });
});

describe("usedStreamingMs", () => {
  const now = 1_000_000_000;
  test("sums closed sessions via durationMs", () => {
    expect(
      usedStreamingMs(
        [
          { startedAt: 0, endedAt: 60_000, durationMs: 60_000 },
          { startedAt: 0, endedAt: 30_000, durationMs: 30_000 },
        ],
        now,
      ),
    ).toBe(90_000);
  });
  test("falls back to endedAt - startedAt when durationMs is absent", () => {
    expect(usedStreamingMs([{ startedAt: 100, endedAt: 40_100 }], now)).toBe(
      40_000,
    );
  });
  test("counts open sessions as running until now", () => {
    expect(usedStreamingMs([{ startedAt: now - 120_000 }], now)).toBe(120_000);
  });
  test("clamps absurd session lengths", () => {
    expect(usedStreamingMs([{ startedAt: 0 }], 24 * 60 * 60 * 1000)).toBe(
      2 * 60 * 60 * 1000,
    );
  });
});

describe("buildCallbackUrl", () => {
  test("builds the callback with encoded secret and noteId", () => {
    const url = buildCallbackUrl({
      siteUrl: "https://ceaseless-dog-617.convex.site/",
      secret: "s3cr3t+/=value",
      noteId: "abc123",
    });
    const parsed = new URL(url);
    expect(parsed.origin).toBe("https://ceaseless-dog-617.convex.site");
    expect(parsed.pathname).toBe("/api/deepgram-callback");
    expect(parsed.searchParams.get("secret")).toBe("s3cr3t+/=value");
    expect(parsed.searchParams.get("noteId")).toBe("abc123");
  });
  test("strips trailing slashes from the site url", () => {
    const url = buildCallbackUrl({
      siteUrl: "https://x.convex.site///",
      secret: "s",
      noteId: "n",
    });
    expect(url.startsWith("https://x.convex.site/api/deepgram-callback?")).toBe(
      true,
    );
  });
});

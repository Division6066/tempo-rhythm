import { describe, expect, test } from "bun:test";
import { MIME_TYPE_FALLBACK_CHAIN, pickSupportedMimeType } from "./recorder";

describe("MIME_TYPE_FALLBACK_CHAIN", () => {
  test("matches the decided fallback order (webm+opus → webm → mp4 → ogg+opus)", () => {
    expect([...MIME_TYPE_FALLBACK_CHAIN]).toEqual([
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg;codecs=opus",
    ]);
  });
});

describe("pickSupportedMimeType", () => {
  test("Chromium-like browser → webm+opus", () => {
    expect(
      pickSupportedMimeType((t) => t.startsWith("audio/webm")),
    ).toBe("audio/webm;codecs=opus");
  });

  test("Safari-like browser (MP4/AAC only) → audio/mp4", () => {
    expect(pickSupportedMimeType((t) => t === "audio/mp4")).toBe("audio/mp4");
  });

  test("ogg-only browser → ogg+opus", () => {
    expect(pickSupportedMimeType((t) => t.startsWith("audio/ogg"))).toBe(
      "audio/ogg;codecs=opus",
    );
  });

  test("nothing supported → undefined", () => {
    expect(pickSupportedMimeType(() => false)).toBeUndefined();
  });

  test("a throwing isTypeSupported is treated as unsupported", () => {
    expect(
      pickSupportedMimeType((t) => {
        if (t.includes("webm")) throw new Error("boom");
        return t === "audio/mp4";
      }),
    ).toBe("audio/mp4");
  });
});

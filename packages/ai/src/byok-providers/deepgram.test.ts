import { describe, expect, test } from "bun:test";
import { parseDeepgramCallbackPayload } from "./deepgram";

/** Shape per developers.deepgram.com/reference/pre-recorded (callback body). */
function validPayload() {
  return {
    metadata: {
      request_id: "req-123",
      duration: 12.34,
    },
    results: {
      channels: [
        {
          alternatives: [
            { transcript: "buy milk and call mom", confidence: 0.98 },
          ],
        },
      ],
    },
  };
}

describe("parseDeepgramCallbackPayload", () => {
  test("extracts requestId, transcript, and duration", () => {
    expect(parseDeepgramCallbackPayload(validPayload())).toEqual({
      requestId: "req-123",
      transcript: "buy milk and call mom",
      durationSeconds: 12.34,
    });
  });

  test("duration is optional", () => {
    const payload = validPayload();
    // biome-ignore lint/suspicious/noExplicitAny: test fixture mutation
    delete (payload.metadata as any).duration;
    expect(parseDeepgramCallbackPayload(payload)?.durationSeconds).toBeUndefined();
  });

  test("empty transcript is still a valid completed result", () => {
    const payload = validPayload();
    const alternative = payload.results.channels[0]?.alternatives[0];
    if (!alternative) throw new Error("fixture shape changed");
    alternative.transcript = "";
    expect(parseDeepgramCallbackPayload(payload)?.transcript).toBe("");
  });

  test("rejects non-objects", () => {
    expect(parseDeepgramCallbackPayload(null)).toBeNull();
    expect(parseDeepgramCallbackPayload("text")).toBeNull();
    expect(parseDeepgramCallbackPayload(42)).toBeNull();
  });

  test("rejects payloads without request_id", () => {
    const payload = validPayload();
    // biome-ignore lint/suspicious/noExplicitAny: test fixture mutation
    delete (payload.metadata as any).request_id;
    expect(parseDeepgramCallbackPayload(payload)).toBeNull();
  });

  test("rejects payloads without a transcript", () => {
    expect(
      parseDeepgramCallbackPayload({
        metadata: { request_id: "req-123" },
        results: { channels: [] },
      }),
    ).toBeNull();
  });
});

import { afterEach, describe, expect, test } from "bun:test";
import { ENV_DUMMY_SENTINEL } from "./require_env";
import {
  buildDeepgramListenRequest,
  deepgramGate,
  isConvexStorageUrl,
  postDeepgramListen,
} from "./deepgram_stt";

const TRACKED = ["AI_STT_API_KEY", "DEEPGRAM_API_KEY", "DEEPGRAM_SPIKE_CONFIRMED"] as const;

afterEach(() => {
  for (const name of TRACKED) {
    delete process.env[name];
  }
});

const SAMPLE_URL = "https://ceaseless-dog-617.convex.cloud/api/storage/abc123";

describe("isConvexStorageUrl", () => {
  test("accepts https Convex storage hosts", () => {
    expect(isConvexStorageUrl(SAMPLE_URL)).toBe(true);
    expect(isConvexStorageUrl("https://precious-wildcat-890.convex.site/api/storage/x")).toBe(
      true,
    );
  });

  test("rejects non-https and non-Convex hosts", () => {
    expect(isConvexStorageUrl("http://ceaseless-dog-617.convex.cloud/api/storage/x")).toBe(false);
    expect(isConvexStorageUrl("https://evil.example/steal")).toBe(false);
    expect(isConvexStorageUrl("not-a-url")).toBe(false);
  });
});

describe("deepgramGate", () => {
  test("is not ready when the key is dummy or unset", () => {
    expect(deepgramGate().ready).toBe(false);
    process.env.DEEPGRAM_API_KEY = ENV_DUMMY_SENTINEL;
    expect(deepgramGate().ready).toBe(false);
  });

  test("is ready when a real STT key is present", () => {
    process.env.AI_STT_API_KEY = "dg-test";
    const gate = deepgramGate();
    expect(gate.ready).toBe(true);
    if (gate.ready) {
      expect(gate.apiKey).toBe("dg-test");
    }
  });
});

describe("buildDeepgramListenRequest", () => {
  test("builds a JSON url-source listen request", () => {
    process.env.DEEPGRAM_API_KEY = "dg-test";
    const req = buildDeepgramListenRequest(SAMPLE_URL);
    expect(req.url).toContain("/v1/listen");
    expect(req.url).toContain("model=nova-2");
    expect(req.headers.Authorization).toBe("Token dg-test");
    expect(JSON.parse(req.body)).toEqual({ url: SAMPLE_URL });
  });

  test("refuses a non-Convex URL", () => {
    process.env.DEEPGRAM_API_KEY = "dg-test";
    expect(() => buildDeepgramListenRequest("https://example.com/a.wav")).toThrow(
      /Convex storage URL/,
    );
  });
});

describe("postDeepgramListen gate", () => {
  test("refuses to POST until the key is explicitly confirmed", async () => {
    process.env.DEEPGRAM_API_KEY = "dg-test";
    await expect(
      postDeepgramListen({ signedAudioUrl: SAMPLE_URL, confirmed: false }),
    ).rejects.toThrow(/gated/);
    await expect(
      postDeepgramListen({ signedAudioUrl: SAMPLE_URL, confirmed: true }),
    ).rejects.toThrow(/DEEPGRAM_SPIKE_CONFIRMED/);
  });
});

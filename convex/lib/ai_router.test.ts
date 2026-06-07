import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  AiAuthError,
  AiContextTooLargeError,
  AiRateLimitedError,
  AiUpstreamError,
} from "./ai_errors";
import { callLLM, TIER_MODEL } from "./ai_router";

const originalFetch = globalThis.fetch;
const originalApiKey = process.env.MISTRAL_API_KEY;

function mockCompletionResponse(content = "hello", model = "mistral-small-latest") {
  return new Response(
    JSON.stringify({
      choices: [{ message: { content } }],
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

describe("callLLM", () => {
  beforeEach(() => {
    process.env.MISTRAL_API_KEY = "test-key";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) {
      delete process.env.MISTRAL_API_KEY;
    } else {
      process.env.MISTRAL_API_KEY = originalApiKey;
    }
  });

  test("throws AiAuthError when MISTRAL_API_KEY is missing", async () => {
    delete process.env.MISTRAL_API_KEY;
    await expect(
      callLLM({
        tier: "fast",
        messages: [{ role: "user", content: "hi" }],
      }),
    ).rejects.toBeInstanceOf(AiAuthError);
  });

  test("returns parsed content on success", async () => {
    globalThis.fetch = (() => Promise.resolve(mockCompletionResponse("plan json"))) as typeof fetch;

    const result = await callLLM({
      tier: "fast",
      messages: [{ role: "user", content: "prioritize this" }],
    });

    expect(result.content).toBe("plan json");
    expect(result.model).toBe(TIER_MODEL.fast);
    expect(result.tier).toBe("fast");
    expect(result.escalated).toBe(false);
    expect(result.usage.totalTokens).toBe(15);
  });

  test("throws AiAuthError on HTTP 401 without retry", async () => {
    let calls = 0;
    globalThis.fetch = (() => {
      calls += 1;
      return Promise.resolve(new Response("invalid key", { status: 401 }));
    }) as typeof fetch;

    await expect(
      callLLM({
        tier: "fast",
        messages: [{ role: "user", content: "hi" }],
      }),
    ).rejects.toBeInstanceOf(AiAuthError);
    expect(calls).toBe(1);
  });

  test("retries once on HTTP 429 then surfaces AiRateLimitedError", async () => {
    let calls = 0;
    globalThis.fetch = (() => {
      calls += 1;
      return Promise.resolve(
        new Response("slow down", {
          status: 429,
          headers: { "Retry-After": "1" },
        }),
      );
    }) as typeof fetch;

    await expect(
      callLLM({
        tier: "fast",
        messages: [{ role: "user", content: "hi" }],
      }),
    ).rejects.toBeInstanceOf(AiRateLimitedError);
    expect(calls).toBe(2);
  });

  test("escalates from fast to balanced on context-too-large 400", async () => {
    const models: string[] = [];
    globalThis.fetch = ((_, init) => {
      const body = JSON.parse(String(init?.body)) as { model: string };
      models.push(body.model);
      if (body.model === TIER_MODEL.fast) {
        return Promise.resolve(
          new Response(JSON.stringify({ error: "context_length_exceeded" }), { status: 400 }),
        );
      }
      return Promise.resolve(mockCompletionResponse("escalated plan", body.model));
    }) as typeof fetch;

    const result = await callLLM({
      tier: "fast",
      messages: [{ role: "user", content: "very long dump" }],
    });

    expect(models).toEqual([TIER_MODEL.fast, TIER_MODEL.balanced]);
    expect(result.tier).toBe("balanced");
    expect(result.requestedTier).toBe("fast");
    expect(result.escalated).toBe(true);
    expect(result.content).toBe("escalated plan");
  });

  test("throws AiContextTooLargeError when deep tier is still too large", async () => {
    globalThis.fetch = (() =>
      Promise.resolve(
        new Response(JSON.stringify({ error: "maximum context length" }), { status: 400 }),
      )) as typeof fetch;

    await expect(
      callLLM({
        tier: "deep",
        messages: [{ role: "user", content: "huge" }],
      }),
    ).rejects.toBeInstanceOf(AiContextTooLargeError);
  });

  test("throws AiUpstreamError on unexpected HTTP status after retry", async () => {
    let calls = 0;
    globalThis.fetch = (() => {
      calls += 1;
      return Promise.resolve(new Response("server exploded", { status: 500 }));
    }) as typeof fetch;

    await expect(
      callLLM({
        tier: "fast",
        messages: [{ role: "user", content: "hi" }],
      }),
    ).rejects.toBeInstanceOf(AiUpstreamError);
    expect(calls).toBe(2);
  });
});

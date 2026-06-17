import { afterEach, describe, expect, mock, test } from "bun:test";
import {
  AiAuthError,
  AiContextTooLargeError,
  AiRateLimitedError,
  AiUpstreamError,
} from "./ai_errors";
import { callLLM } from "./ai_router";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  delete process.env.MISTRAL_API_KEY;
});

function mockFetchResponse(
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
): typeof fetch {
  return mock(() =>
    Promise.resolve(
      new Response(typeof body === "string" ? body : JSON.stringify(body), {
        status,
        headers,
      }),
    ),
  ) as typeof fetch;
}

describe("callLLM", () => {
  test("throws AiAuthError when MISTRAL_API_KEY is missing", async () => {
    await expect(
      callLLM({ tier: "fast", messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toBeInstanceOf(AiAuthError);
  });

  test("throws AiAuthError on HTTP 401", async () => {
    process.env.MISTRAL_API_KEY = "test-key";
    globalThis.fetch = mockFetchResponse(401, "invalid key");

    await expect(
      callLLM({ tier: "fast", messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toBeInstanceOf(AiAuthError);
  });

  test("throws AiRateLimitedError on HTTP 429", async () => {
    process.env.MISTRAL_API_KEY = "test-key";
    globalThis.fetch = mockFetchResponse(429, "slow down", { "Retry-After": "2" });

    await expect(
      callLLM({ tier: "fast", messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toBeInstanceOf(AiRateLimitedError);
  });

  test("escalates tier on context-too-large 400 and succeeds on next tier", async () => {
    process.env.MISTRAL_API_KEY = "test-key";
    let callCount = 0;
    globalThis.fetch = mock(() => {
      callCount += 1;
      if (callCount === 1) {
        return Promise.resolve(
          new Response("context_length_exceeded", { status: 400 }),
        );
      }
      return Promise.resolve(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: "ok" } }],
            usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
          }),
          { status: 200 },
        ),
      );
    }) as typeof fetch;

    const result = await callLLM({
      tier: "fast",
      messages: [{ role: "user", content: "hi" }],
    });

    expect(result.content).toBe("ok");
    expect(result.escalated).toBe(true);
    expect(result.tier).toBe("balanced");
  });

  test("throws AiContextTooLargeError when escalation chain is exhausted", async () => {
    process.env.MISTRAL_API_KEY = "test-key";
    globalThis.fetch = mockFetchResponse(400, "maximum context length exceeded");

    await expect(
      callLLM({ tier: "deep", messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toBeInstanceOf(AiContextTooLargeError);
  });

  test("retries once on upstream error then succeeds", async () => {
    process.env.MISTRAL_API_KEY = "test-key";
    let callCount = 0;
    globalThis.fetch = mock(() => {
      callCount += 1;
      if (callCount === 1) {
        return Promise.resolve(new Response("server error", { status: 503 }));
      }
      return Promise.resolve(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: "recovered" } }],
            usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
          }),
          { status: 200 },
        ),
      );
    }) as typeof fetch;

    const result = await callLLM({
      tier: "fast",
      messages: [{ role: "user", content: "hi" }],
    });

    expect(result.content).toBe("recovered");
    expect(callCount).toBe(2);
  });

  test("throws AiUpstreamError after two consecutive upstream failures", async () => {
    process.env.MISTRAL_API_KEY = "test-key";
    globalThis.fetch = mockFetchResponse(503, "unavailable");

    await expect(
      callLLM({ tier: "fast", messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toBeInstanceOf(AiUpstreamError);
  });
});

import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
  AiAuthError,
  AiContextTooLargeError,
  AiRateLimitedError,
  AiUpstreamError,
} from "./ai_errors";
import { callLLM, TIER_MODEL } from "./ai_router";

const originalFetch = globalThis.fetch;
const originalApiKey = process.env.MISTRAL_API_KEY;

function jsonResponse(status: number, body: unknown, headers?: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
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
      callLLM({ tier: "fast", messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toBeInstanceOf(AiAuthError);
  });

  test("returns parsed result on HTTP 200", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        jsonResponse(200, {
          choices: [{ message: { content: "planned" } }],
          usage: { prompt_tokens: 3, completion_tokens: 5, total_tokens: 8 },
        }),
      ),
    ) as typeof fetch;

    const result = await callLLM({
      tier: "balanced",
      messages: [{ role: "user", content: "brain dump" }],
    });

    expect(result.content).toBe("planned");
    expect(result.model).toBe(TIER_MODEL.balanced);
    expect(result.escalated).toBe(false);
    expect(result.usage.totalTokens).toBe(8);
  });

  test("throws AiAuthError on HTTP 401 without retrying", async () => {
    let calls = 0;
    globalThis.fetch = mock(() => {
      calls += 1;
      return Promise.resolve(jsonResponse(401, { error: "bad key" }));
    }) as typeof fetch;

    await expect(
      callLLM({ tier: "fast", messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toBeInstanceOf(AiAuthError);
    expect(calls).toBe(1);
  });

  test("retries once on HTTP 429 then succeeds", async () => {
    let calls = 0;
    globalThis.fetch = mock(() => {
      calls += 1;
      if (calls === 1) {
        return Promise.resolve(
          jsonResponse(429, { error: "rate limited" }, { "Retry-After": "1" }),
        );
      }
      return Promise.resolve(
        jsonResponse(200, {
          choices: [{ message: { content: "ok" } }],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
        }),
      );
    }) as typeof fetch;

    const result = await callLLM({
      tier: "fast",
      messages: [{ role: "user", content: "hi" }],
    });

    expect(result.content).toBe("ok");
    expect(calls).toBe(2);
  }, 10_000);

  test("throws AiRateLimitedError after two consecutive 429 responses", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(jsonResponse(429, { error: "rate limited" })),
    ) as typeof fetch;

    await expect(
      callLLM({ tier: "fast", messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toBeInstanceOf(AiRateLimitedError);
  }, 10_000);

  test("escalates from fast to balanced when context is too large", async () => {
    let calls = 0;
    globalThis.fetch = mock((_url, init) => {
      calls += 1;
      const body = JSON.parse(String(init?.body)) as { model: string };
      if (body.model === TIER_MODEL.fast) {
        return Promise.resolve(
          jsonResponse(400, { message: "context_length_exceeded for request" }),
        );
      }
      return Promise.resolve(
        jsonResponse(200, {
          choices: [{ message: { content: "escalated" } }],
          usage: { prompt_tokens: 2, completion_tokens: 2, total_tokens: 4 },
        }),
      );
    }) as typeof fetch;

    const result = await callLLM({
      tier: "fast",
      messages: [{ role: "user", content: "very long dump" }],
    });

    expect(result.tier).toBe("balanced");
    expect(result.escalated).toBe(true);
    expect(result.content).toBe("escalated");
    expect(calls).toBe(2);
  });

  test("throws AiContextTooLargeError when deep tier exhausts the chain", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        jsonResponse(400, { message: "maximum context length exceeded" }),
      ),
    ) as typeof fetch;

    await expect(
      callLLM({ tier: "deep", messages: [{ role: "user", content: "huge" }] }),
    ).rejects.toBeInstanceOf(AiContextTooLargeError);
  });

  test("throws AiUpstreamError on unexpected HTTP status after retry", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(jsonResponse(503, { error: "unavailable" })),
    ) as typeof fetch;

    await expect(
      callLLM({ tier: "fast", messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toBeInstanceOf(AiUpstreamError);
  }, 10_000);
});

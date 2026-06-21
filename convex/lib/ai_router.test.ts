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

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

function errorResponse(status: number, body: string, headers?: HeadersInit): Response {
  return new Response(body, { status, headers });
}

function successBody(content = "ok") {
  return {
    choices: [{ message: { content } }],
    usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
  };
}

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

describe("callLLM", () => {
  test("throws AiAuthError when MISTRAL_API_KEY is missing", async () => {
    delete process.env.MISTRAL_API_KEY;
    await expect(
      callLLM({ tier: "fast", messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toBeInstanceOf(AiAuthError);
  });

  test("returns parsed content on success", async () => {
    globalThis.fetch = mock(() => Promise.resolve(jsonResponse(successBody('{"plan":true}'))));

    const result = await callLLM({
      tier: "fast",
      messages: [{ role: "user", content: "hi" }],
      responseFormat: "json_object",
    });

    expect(result.content).toBe('{"plan":true}');
    expect(result.tier).toBe("fast");
    expect(result.model).toBe(TIER_MODEL.fast);
    expect(result.escalated).toBe(false);
    expect(result.usage.totalTokens).toBe(15);
  });

  test("throws AiAuthError on HTTP 401 without retrying", async () => {
    const fetchMock = mock(() => Promise.resolve(errorResponse(401, "bad key")));
    globalThis.fetch = fetchMock;

    await expect(
      callLLM({ tier: "fast", messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toBeInstanceOf(AiAuthError);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("retries once on HTTP 429 then succeeds", async () => {
    const fetchMock = mock(() =>
      Promise.resolve(errorResponse(429, "slow down", { "Retry-After": "1" })),
    )
      .mockImplementationOnce(() =>
        Promise.resolve(errorResponse(429, "slow down", { "Retry-After": "1" })),
      )
      .mockImplementationOnce(() => Promise.resolve(jsonResponse(successBody("done"))));

    globalThis.fetch = fetchMock;

    const result = await callLLM({
      tier: "balanced",
      messages: [{ role: "user", content: "hi" }],
    });

    expect(result.content).toBe("done");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("throws AiRateLimitedError after two 429 responses", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(errorResponse(429, "slow down")),
    );

    await expect(
      callLLM({ tier: "fast", messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toBeInstanceOf(AiRateLimitedError);
  });

  test("escalates to balanced tier when fast tier hits context limit", async () => {
    const fetchMock = mock((url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { model: string };
      if (body.model === TIER_MODEL.fast) {
        return Promise.resolve(
          errorResponse(400, JSON.stringify({ error: "context_length_exceeded" })),
        );
      }
      return Promise.resolve(jsonResponse(successBody("escalated")));
    });
    globalThis.fetch = fetchMock;

    const result = await callLLM({
      tier: "fast",
      messages: [{ role: "user", content: "big" }],
    });

    expect(result.content).toBe("escalated");
    expect(result.tier).toBe("balanced");
    expect(result.escalated).toBe(true);
  });

  test("throws AiContextTooLargeError when deep tier still exceeds context", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        errorResponse(400, "maximum context length exceeded for this model"),
      ),
    );

    await expect(
      callLLM({ tier: "deep", messages: [{ role: "user", content: "huge" }] }),
    ).rejects.toBeInstanceOf(AiContextTooLargeError);
  });

  test("throws AiUpstreamError on non-retryable HTTP errors", async () => {
    globalThis.fetch = mock(() => Promise.resolve(errorResponse(503, "unavailable")));

    await expect(
      callLLM({ tier: "fast", messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toBeInstanceOf(AiUpstreamError);
  });
});

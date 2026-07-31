import { afterEach, describe, expect, test } from "bun:test";
import {
  AiAuthError,
  AiContextTooLargeError,
  AiRateLimitedError,
  AiUpstreamError,
} from "./ai_errors";
import { callLLM, isContextTooLarge } from "./ai_router";

const originalFetch = globalThis.fetch;
const originalApiKey = process.env.MISTRAL_API_KEY;

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalApiKey === undefined) {
    delete process.env.MISTRAL_API_KEY;
  } else {
    process.env.MISTRAL_API_KEY = originalApiKey;
  }
});

describe("isContextTooLarge", () => {
  test("detects known Mistral overflow phrases", () => {
    expect(isContextTooLarge('{"error":"context_length_exceeded"}')).toBe(true);
    expect(isContextTooLarge("Prompt is too long for this model")).toBe(true);
    expect(isContextTooLarge("maximum context length exceeded")).toBe(true);
  });

  test("returns false for unrelated errors", () => {
    expect(isContextTooLarge("invalid_api_key")).toBe(false);
    expect(isContextTooLarge("")).toBe(false);
  });
});

describe("callLLM", () => {
  test("throws AiAuthError when MISTRAL_API_KEY is missing", async () => {
    delete process.env.MISTRAL_API_KEY;
    await expect(
      callLLM({ tier: "fast", messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toBeInstanceOf(AiAuthError);
  });

  test("throws AiAuthError on HTTP 401 without retrying", async () => {
    process.env.MISTRAL_API_KEY = "test-key";
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      return new Response("unauthorized", { status: 401 });
    };

    await expect(
      callLLM({ tier: "fast", messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toBeInstanceOf(AiAuthError);
    expect(calls).toBe(1);
  });

  test("parses successful response", async () => {
    process.env.MISTRAL_API_KEY = "test-key";
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "Hello" } }],
          usage: { prompt_tokens: 3, completion_tokens: 2, total_tokens: 5 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );

    const result = await callLLM({
      tier: "fast",
      messages: [{ role: "user", content: "hi" }],
    });
    expect(result.content).toBe("Hello");
    expect(result.tier).toBe("fast");
    expect(result.escalated).toBe(false);
    expect(result.usage.totalTokens).toBe(5);
  });

  test("retries once on HTTP 429 then surfaces AiRateLimitedError", async () => {
    process.env.MISTRAL_API_KEY = "test-key";
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      return new Response("rate limited", {
        status: 429,
        headers: { "Retry-After": "1" },
      });
    };

    await expect(
      callLLM({ tier: "fast", messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toBeInstanceOf(AiRateLimitedError);
    expect(calls).toBe(2);
  });

  test("escalates from fast to balanced on context overflow", async () => {
    process.env.MISTRAL_API_KEY = "test-key";
    const models: string[] = [];
    globalThis.fetch = async (_input, init) => {
      const body = JSON.parse(String(init?.body)) as { model: string };
      models.push(body.model);
      if (body.model === "mistral-small-latest") {
        return new Response('{"error":"context_length_exceeded"}', { status: 400 });
      }
      return new Response(
        JSON.stringify({
          choices: [{ message: { content: "Escalated plan" } }],
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const result = await callLLM({
      tier: "fast",
      messages: [{ role: "user", content: "big prompt" }],
    });
    expect(models).toEqual(["mistral-small-latest", "mistral-medium-latest"]);
    expect(result.tier).toBe("balanced");
    expect(result.escalated).toBe(true);
    expect(result.content).toBe("Escalated plan");
  });

  test("throws AiContextTooLargeError when deep tier still overflows", async () => {
    process.env.MISTRAL_API_KEY = "test-key";
    globalThis.fetch = async () =>
      new Response('{"error":"context_length_exceeded"}', { status: 400 });

    await expect(
      callLLM({ tier: "deep", messages: [{ role: "user", content: "huge" }] }),
    ).rejects.toBeInstanceOf(AiContextTooLargeError);
  });

  test("throws AiUpstreamError on non-retryable HTTP errors", async () => {
    process.env.MISTRAL_API_KEY = "test-key";
    globalThis.fetch = async () => new Response("server error", { status: 500 });

    await expect(
      callLLM({ tier: "fast", messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toBeInstanceOf(AiUpstreamError);
  });
});

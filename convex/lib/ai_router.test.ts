import { afterEach, describe, expect, test } from "bun:test";
import { AiAuthError } from "./ai_errors";
import { callLLM } from "./ai_router";

const originalFetch = globalThis.fetch;
const originalApiKey = process.env.MISTRAL_API_KEY;

const messages = [{ role: "user" as const, content: "Please prioritize this." }];

function restoreGlobals() {
  globalThis.fetch = originalFetch;
  if (originalApiKey === undefined) {
    delete process.env.MISTRAL_API_KEY;
  } else {
    process.env.MISTRAL_API_KEY = originalApiKey;
  }
}

function successResponse(content = "ok") {
  return new Response(
    JSON.stringify({
      choices: [{ message: { content } }],
      usage: { prompt_tokens: 3, completion_tokens: 5, total_tokens: 8 },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}

function textResponse(status: number, body: string, headers?: HeadersInit) {
  return new Response(body, { status, headers });
}

async function expectRejectsWith<T extends Error>(
  promise: Promise<unknown>,
  errorClass: new (...args: never[]) => T,
) {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(errorClass);
    return error as T;
  }
  throw new Error("Expected promise to reject");
}

describe("callLLM", () => {
  afterEach(() => {
    restoreGlobals();
  });

  test("requires MISTRAL_API_KEY before calling fetch", async () => {
    delete process.env.MISTRAL_API_KEY;
    let fetchCalled = false;
    globalThis.fetch = (async () => {
      fetchCalled = true;
      return successResponse();
    }) as typeof fetch;

    await expectRejectsWith(callLLM({ tier: "fast", messages }), AiAuthError);
    expect(fetchCalled).toBe(false);
  });

  test("sends the selected tier model with safe_prompt disabled and JSON response format when requested", async () => {
    process.env.MISTRAL_API_KEY = "test-key";
    let requestBody: Record<string, unknown> | undefined;
    globalThis.fetch = (async (_url, init) => {
      requestBody = JSON.parse(String(init?.body));
      return successResponse("structured");
    }) as typeof fetch;

    const result = await callLLM({
      tier: "balanced",
      messages,
      maxTokens: 77,
      temperature: 0.1,
      responseFormat: "json_object",
    });

    expect(result).toMatchObject({
      tier: "balanced",
      requestedTier: "balanced",
      model: "mistral-medium-latest",
      content: "structured",
      escalated: false,
      usage: { promptTokens: 3, completionTokens: 5, totalTokens: 8 },
    });
    expect(requestBody).toMatchObject({
      model: "mistral-medium-latest",
      messages,
      max_tokens: 77,
      temperature: 0.1,
      safe_prompt: false,
      response_format: { type: "json_object" },
    });
  });

  test("retries one rate-limited response before returning a successful result", async () => {
    process.env.MISTRAL_API_KEY = "test-key";
    const attemptedModels: string[] = [];
    globalThis.fetch = (async (_url, init) => {
      const body = JSON.parse(String(init?.body)) as { model: string };
      attemptedModels.push(body.model);
      if (attemptedModels.length === 1) {
        return textResponse(429, "slow down", { "Retry-After": "1" });
      }
      return successResponse("retry-ok");
    }) as typeof fetch;

    const result = await callLLM({ tier: "fast", messages });

    expect(result.content).toBe("retry-ok");
    expect(attemptedModels).toEqual(["mistral-small-latest", "mistral-small-latest"]);
  });

  test("escalates context-too-large responses through the tier chain", async () => {
    process.env.MISTRAL_API_KEY = "test-key";
    const attemptedModels: string[] = [];
    globalThis.fetch = (async (_url, init) => {
      const body = JSON.parse(String(init?.body)) as { model: string };
      attemptedModels.push(body.model);
      if (body.model === "mistral-small-latest") {
        return textResponse(400, "context_length_exceeded");
      }
      return successResponse("balanced-ok");
    }) as typeof fetch;

    const result = await callLLM({ tier: "fast", messages });

    expect(attemptedModels).toEqual(["mistral-small-latest", "mistral-medium-latest"]);
    expect(result).toMatchObject({
      tier: "balanced",
      requestedTier: "fast",
      model: "mistral-medium-latest",
      content: "balanced-ok",
      escalated: true,
    });
  });

  test("does not retry Mistral authentication failures", async () => {
    process.env.MISTRAL_API_KEY = "bad-key";
    let attempts = 0;
    globalThis.fetch = (async () => {
      attempts += 1;
      return textResponse(401, "bad credentials");
    }) as typeof fetch;

    await expectRejectsWith(callLLM({ tier: "fast", messages }), AiAuthError);
    expect(attempts).toBe(1);
  });
});

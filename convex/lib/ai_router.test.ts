import { afterEach, describe, expect, test } from "bun:test";
import { AiAuthError } from "./ai_errors";
import { callLLM } from "./ai_router";

const TRACKED = ["AI_CHAT_API_KEY", "AI_CHAT_BASE_URL", "AI_CHAT_MODEL", "MISTRAL_API_KEY"] as const;

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const name of TRACKED) {
    delete process.env[name];
  }
});

describe("callLLM", () => {
  test("throws AiAuthError when every chat key is absent", async () => {
    await expect(
      callLLM({
        tier: "fast",
        messages: [{ role: "user", content: "hi" }],
      }),
    ).rejects.toBeInstanceOf(AiAuthError);
  });

  test("POSTs to the resolved OpenAI-compatible chat URL", async () => {
    process.env.AI_CHAT_API_KEY = "chat-key";
    process.env.AI_CHAT_BASE_URL = "https://api.inkling.example/v1";
    process.env.AI_CHAT_MODEL = "inkling-chat";

    let capturedUrl = "";
    let capturedAuth = "";
    let capturedBody: { model?: string; safe_prompt?: boolean } = {};

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      capturedUrl = String(input);
      capturedAuth = new Headers(init?.headers).get("Authorization") ?? "";
      capturedBody = JSON.parse(String(init?.body ?? "{}")) as typeof capturedBody;
      return new Response(
        JSON.stringify({
          choices: [{ message: { content: "pong" } }],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }) as typeof fetch;

    const result = await callLLM({
      tier: "fast",
      messages: [{ role: "user", content: "ping" }],
    });

    expect(capturedUrl).toBe("https://api.inkling.example/v1/chat/completions");
    expect(capturedAuth).toBe("Bearer chat-key");
    expect(capturedBody.model).toBe("inkling-chat");
    expect(capturedBody.safe_prompt).toBeUndefined();
    expect(result.content).toBe("pong");
    expect(result.model).toBe("inkling-chat");
  });
});

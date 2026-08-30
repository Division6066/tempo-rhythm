import { afterEach, describe, expect, test } from "bun:test";
import { ENV_DUMMY_SENTINEL } from "./require_env";
import { chatCompletionsUrl, resolveAiEnv } from "./ai_env";

const TRACKED = [
  "AI_PROVIDER",
  "AI_MODEL",
  "AI_API_KEY",
  "AI_CHAT_API_KEY",
  "AI_CHAT_BASE_URL",
  "AI_CHAT_MODEL",
  "AI_STT_API_KEY",
  "AI_STT_BASE_URL",
  "AI_STT_MODEL",
  "AI_TTS_API_KEY",
  "AI_TTS_MODEL",
  "AI_EMBEDDINGS_API_KEY",
  "AI_EMBEDDINGS_MODEL",
  "MISTRAL_API_KEY",
  "DEEPGRAM_API_KEY",
] as const;

afterEach(() => {
  for (const name of TRACKED) {
    delete process.env[name];
  }
});

describe("resolveAiEnv chat", () => {
  test("defaults to Mistral URL and tier model when only a legacy key is set", () => {
    process.env.MISTRAL_API_KEY = "mistral-legacy";
    const env = resolveAiEnv("chat", "balanced");
    expect(env.apiKey).toBe("mistral-legacy");
    expect(env.baseUrl).toBe("https://api.mistral.ai/v1");
    expect(env.model).toBe("mistral-medium-latest");
    expect(env.provider).toBe("mistral");
  });

  test("slot-specific chat vars beat legacy keys", () => {
    process.env.MISTRAL_API_KEY = "legacy";
    process.env.AI_CHAT_API_KEY = "chat-key";
    process.env.AI_CHAT_BASE_URL = "https://api.inkling.example/v1";
    process.env.AI_CHAT_MODEL = "inkling-chat";
    process.env.AI_PROVIDER = "inkling";
    const env = resolveAiEnv("chat", "fast");
    expect(env.apiKey).toBe("chat-key");
    expect(env.baseUrl).toBe("https://api.inkling.example/v1");
    expect(env.model).toBe("inkling-chat");
    expect(env.provider).toBe("inkling");
  });

  test("AI_PROVIDER + AI_MODEL configure Inkling with no new variable", () => {
    process.env.AI_API_KEY = "generic";
    process.env.AI_PROVIDER = "inkling";
    process.env.AI_MODEL = "inkling-default";
    const env = resolveAiEnv("chat", "deep");
    expect(env.provider).toBe("inkling");
    expect(env.model).toBe("inkling-default");
    expect(env.apiKey).toBe("generic");
  });

  test("dummy sentinel on the preferred key falls through to legacy", () => {
    process.env.AI_CHAT_API_KEY = ENV_DUMMY_SENTINEL;
    process.env.MISTRAL_API_KEY = "real-legacy";
    expect(resolveAiEnv("chat").apiKey).toBe("real-legacy");
  });
});

describe("resolveAiEnv stt / tts / embeddings", () => {
  test("STT prefers AI_STT_* then DEEPGRAM_API_KEY", () => {
    process.env.DEEPGRAM_API_KEY = "dg";
    expect(resolveAiEnv("stt").apiKey).toBe("dg");
    process.env.AI_STT_API_KEY = "stt-slot";
    expect(resolveAiEnv("stt").apiKey).toBe("stt-slot");
    expect(resolveAiEnv("stt").model).toBe("nova-2");
  });

  test("dummy DEEPGRAM_API_KEY is treated as absent", () => {
    process.env.DEEPGRAM_API_KEY = ENV_DUMMY_SENTINEL;
    expect(resolveAiEnv("stt").apiKey).toBeUndefined();
  });

  test("TTS and embeddings use their slot keys with generic fallback", () => {
    process.env.AI_API_KEY = "shared";
    expect(resolveAiEnv("tts").apiKey).toBe("shared");
    expect(resolveAiEnv("embeddings").apiKey).toBe("shared");
    process.env.AI_TTS_API_KEY = "tts-only";
    process.env.AI_EMBEDDINGS_API_KEY = "emb-only";
    expect(resolveAiEnv("tts").apiKey).toBe("tts-only");
    expect(resolveAiEnv("embeddings").apiKey).toBe("emb-only");
  });
});

describe("chatCompletionsUrl", () => {
  test("joins without a double slash", () => {
    expect(chatCompletionsUrl("https://api.mistral.ai/v1/")).toBe(
      "https://api.mistral.ai/v1/chat/completions",
    );
  });
});

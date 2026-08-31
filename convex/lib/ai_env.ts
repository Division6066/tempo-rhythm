import { readEnv, readEnvFirst } from "./require_env";

export type AiSlot = "chat" | "stt" | "tts" | "embeddings";
export type AiEnvTier = "fast" | "balanced" | "deep";

const TIER_FALLBACK_MODEL: Record<AiEnvTier, string> = {
  fast: "mistral-small-latest",
  balanced: "mistral-medium-latest",
  deep: "mistral-large-latest",
};

export type ResolvedAiEnv = {
  slot: AiSlot;
  /** Provider hint only — Inkling is `AI_PROVIDER=inkling` + `AI_MODEL`, no new var. */
  provider: string;
  apiKey: string | undefined;
  baseUrl: string;
  model: string;
};

const DEFAULT_CHAT_BASE_URL = "https://api.mistral.ai/v1";
const DEFAULT_STT_BASE_URL = "https://api.deepgram.com";
const DEFAULT_TTS_BASE_URL = "https://api.mistral.ai/v1";
const DEFAULT_EMBEDDINGS_BASE_URL = "https://api.mistral.ai/v1";
const DEFAULT_STT_MODEL = "nova-2";
const DEFAULT_TTS_MODEL = "mistral-small-latest";
const DEFAULT_EMBEDDINGS_MODEL = "mistral-embed";

function providerHint(): string {
  return readEnv("AI_PROVIDER") ?? "mistral";
}

/**
 * Resolve per-slot credentials.
 *
 * Slot-specific vars win. Legacy fallbacks:
 *   chat        → AI_CHAT_* → MISTRAL_API_KEY → AI_API_KEY
 *   stt         → AI_STT_* → DEEPGRAM_API_KEY → AI_API_KEY
 *   tts         → AI_TTS_* → AI_API_KEY
 *   embeddings  → AI_EMBEDDINGS_* → MISTRAL_API_KEY → AI_API_KEY
 *
 * `AI_PROVIDER` + `AI_MODEL` stay generic so Thinking Machines Inkling
 * (or any OpenAI-compatible host) needs no new variable.
 */
export function resolveAiEnv(slot: AiSlot, tier: AiEnvTier = "fast"): ResolvedAiEnv {
  const provider = providerHint();
  const genericModel = readEnv("AI_MODEL");

  switch (slot) {
    case "chat":
      return {
        slot,
        provider,
        apiKey: readEnvFirst(["AI_CHAT_API_KEY", "MISTRAL_API_KEY", "AI_API_KEY"]),
        baseUrl: readEnv("AI_CHAT_BASE_URL") ?? DEFAULT_CHAT_BASE_URL,
        model: readEnv("AI_CHAT_MODEL") ?? genericModel ?? TIER_FALLBACK_MODEL[tier],
      };
    case "stt":
      return {
        slot,
        provider,
        apiKey: readEnvFirst(["AI_STT_API_KEY", "DEEPGRAM_API_KEY", "AI_API_KEY"]),
        baseUrl: readEnv("AI_STT_BASE_URL") ?? DEFAULT_STT_BASE_URL,
        model: readEnv("AI_STT_MODEL") ?? genericModel ?? DEFAULT_STT_MODEL,
      };
    case "tts":
      return {
        slot,
        provider,
        apiKey: readEnvFirst(["AI_TTS_API_KEY", "AI_API_KEY"]),
        baseUrl: readEnv("AI_TTS_BASE_URL") ?? DEFAULT_TTS_BASE_URL,
        model: readEnv("AI_TTS_MODEL") ?? genericModel ?? DEFAULT_TTS_MODEL,
      };
    case "embeddings":
      return {
        slot,
        provider,
        apiKey: readEnvFirst(["AI_EMBEDDINGS_API_KEY", "MISTRAL_API_KEY", "AI_API_KEY"]),
        baseUrl: readEnv("AI_EMBEDDINGS_BASE_URL") ?? DEFAULT_EMBEDDINGS_BASE_URL,
        model: readEnv("AI_EMBEDDINGS_MODEL") ?? genericModel ?? DEFAULT_EMBEDDINGS_MODEL,
      };
    default: {
      const _exhaustive: never = slot;
      throw new Error(`Unknown AI slot: ${String(_exhaustive)}`);
    }
  }
}

export function chatCompletionsUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
}

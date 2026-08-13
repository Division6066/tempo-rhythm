/**
 * Provider registry + credential/config resolution.
 *
 * Env var scheme (per-modality triplets, provider-agnostic so a future
 * `AI_CHAT_PROVIDER=inkling` works without code changes):
 *
 *   AI_CHAT_PROVIDER / AI_CHAT_MODEL / AI_CHAT_API_KEY
 *   AI_STT_PROVIDER  / AI_STT_MODEL  / AI_STT_API_KEY
 *   AI_TTS_PROVIDER  / AI_TTS_MODEL  / AI_TTS_API_KEY
 *   AI_EMBEDDINGS_PROVIDER / AI_EMBEDDINGS_MODEL / AI_EMBEDDINGS_API_KEY
 *
 * Resolution order for a key, first hit wins:
 *   1. the caller-supplied BYOK key (per-user, already decrypted)
 *   2. AI_<MODALITY>_API_KEY
 *   3. legacy AI_API_KEY (chat only — deprecated, still honored; a single
 *      console.warn names the variable, never its value)
 *   4. the provider-native env var (MISTRAL_API_KEY, DEEPGRAM_API_KEY)
 *
 * Legacy `AI_PROVIDER` / `AI_MODEL` / `AI_API_KEY` remain working for chat
 * until both deployments carry the new names for a full release cycle.
 */

import { AiEnvError } from "../errors";
import { optionalEnv } from "../env";
import type { Modality, ProviderDescriptor, ProviderId, ResolvedKey } from "../types";
import { deepgramProvider } from "./deepgram";
import { mistralProvider } from "./mistral";

const PROVIDERS: Record<ProviderId, ProviderDescriptor> = {
  deepgram: deepgramProvider,
  mistral: mistralProvider,
};

const DEFAULT_PROVIDER_FOR: Record<Modality, ProviderId> = {
  chat: "mistral",
  stt: "deepgram",
  tts: "deepgram",
  embeddings: "mistral",
};

const DEFAULT_MODEL_FOR: Partial<Record<Modality, string>> = {
  stt: "nova-3",
  tts: "aura-2",
};

function modalityEnvPrefix(modality: Modality): string {
  return `AI_${modality.toUpperCase()}`;
}

export function getProvider(id: ProviderId): ProviderDescriptor {
  return PROVIDERS[id];
}

export function isKnownProviderId(value: string): value is ProviderId {
  return value in PROVIDERS;
}

/**
 * Which provider serves this modality, honoring AI_<MODALITY>_PROVIDER and,
 * for chat, the legacy AI_PROVIDER. Unknown provider names throw AiEnvError
 * naming the variable (a typo'd provider must not silently fall back).
 */
export function resolveProviderForModality(
  modality: Modality,
): ProviderDescriptor {
  const varName = `${modalityEnvPrefix(modality)}_PROVIDER`;
  const configured =
    optionalEnv(varName) ??
    (modality === "chat" ? optionalEnv("AI_PROVIDER") : undefined);
  if (configured === undefined) {
    return PROVIDERS[DEFAULT_PROVIDER_FOR[modality]];
  }
  const normalized = configured.toLowerCase();
  if (!isKnownProviderId(normalized)) {
    throw new AiEnvError(
      `Environment variable ${varName} names an unknown provider. Known providers: ${Object.keys(PROVIDERS).join(", ")}.`,
      varName,
    );
  }
  return PROVIDERS[normalized];
}

/** Model for this modality: AI_<MODALITY>_MODEL → legacy AI_MODEL (chat) → default. */
export function resolveModelForModality(modality: Modality): string | undefined {
  return (
    optionalEnv(`${modalityEnvPrefix(modality)}_MODEL`) ??
    (modality === "chat" ? optionalEnv("AI_MODEL") : undefined) ??
    DEFAULT_MODEL_FOR[modality]
  );
}

let warnedLegacyChatKey = false;

/**
 * Resolve the API key for a modality. `byokKey`, when provided, always wins
 * (the user's own key, already decrypted by the caller). Throws AiEnvError
 * naming every variable that was consulted when nothing is configured.
 */
export function resolveApiKey(
  modality: Modality,
  opts: { byokKey?: string } = {},
): ResolvedKey {
  const provider = resolveProviderForModality(modality);

  if (opts.byokKey !== undefined && opts.byokKey !== "") {
    return { provider: provider.id, apiKey: opts.byokKey, source: "byok" };
  }

  const modalityVar = `${modalityEnvPrefix(modality)}_API_KEY`;
  const fromModality = optionalEnv(modalityVar);
  if (fromModality !== undefined) {
    return { provider: provider.id, apiKey: fromModality, source: "env" };
  }

  if (modality === "chat") {
    const legacy = optionalEnv("AI_API_KEY");
    if (legacy !== undefined) {
      if (!warnedLegacyChatKey) {
        warnedLegacyChatKey = true;
        console.warn(
          "[ai] AI_API_KEY is deprecated; set AI_CHAT_API_KEY instead. The old name keeps working for now.",
        );
      }
      return { provider: provider.id, apiKey: legacy, source: "env" };
    }
  }

  const fromNative = optionalEnv(provider.nativeKeyEnvVar);
  if (fromNative !== undefined) {
    return { provider: provider.id, apiKey: fromNative, source: "env" };
  }

  const consulted = [
    modalityVar,
    ...(modality === "chat" ? ["AI_API_KEY"] : []),
    provider.nativeKeyEnvVar,
  ];
  throw new AiEnvError(
    `No API key configured for ${modality} (provider ${provider.id}). Checked, in order: ${consulted.join(", ")}. Set one in the Convex dashboard → Settings → Environment Variables, or add a personal key in Settings → AI providers.`,
    modalityVar,
  );
}

/** Test-only: reset the one-shot deprecation warning latch. */
export function resetLegacyWarningForTests(): void {
  warnedLegacyChatKey = false;
}

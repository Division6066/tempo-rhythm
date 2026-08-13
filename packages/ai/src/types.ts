/** Shared provider types for the BYOK layer. */

/** Providers the BYOK layer knows how to talk to. */
export type ProviderId = "deepgram" | "mistral";

/** AI modalities the config layer can route independently. */
export type Modality = "chat" | "stt" | "tts" | "embeddings";

/** How a resolved credential was sourced. */
export type KeySource = "byok" | "env";

/** A resolved credential for one provider. The value never gets logged. */
export type ResolvedKey = {
  provider: ProviderId;
  apiKey: string;
  source: KeySource;
};

/** Static description of a provider the registry can hand out. */
export type ProviderDescriptor = {
  id: ProviderId;
  /** Modalities this provider can serve. */
  modalities: readonly Modality[];
  /**
   * Provider-native env var used as the final fallback when no BYOK key and
   * no AI_<MODALITY>_API_KEY is present (e.g. MISTRAL_API_KEY).
   */
  nativeKeyEnvVar: string;
  /**
   * Validate a pasted key against the cheapest documented endpoint.
   * Returns normally when the key is accepted; throws ProviderAuthError /
   * ProviderUpstreamError otherwise. Never logs the key.
   */
  validateKey: (apiKey: string) => Promise<void>;
};

/** Result of a batch (pre-recorded) transcription submission. */
export type SttSubmitResult = {
  /** Deepgram request_id — persist it to correlate the async callback. */
  requestId: string;
};

/** A finalized transcript extracted from a provider callback payload. */
export type SttCallbackResult = {
  requestId: string;
  transcript: string;
  /** Audio duration in seconds when the provider reports it. */
  durationSeconds?: number;
};

/** A short-lived token grant for client-held streaming sockets. */
export type StreamingTokenGrant = {
  accessToken: string;
  expiresIn: number;
};

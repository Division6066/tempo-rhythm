/**
 * Deepgram provider — STT (batch + streaming token grants) and, later, TTS.
 *
 * Deliberately plain `fetch`, no `@deepgram/sdk`, because this code runs
 * inside Convex actions and Convex is not on the SDK's documented runtime
 * list (Node 18+, Vercel, Cloudflare Workers, Deno, Bun, React Native).
 * Batch is one POST with one header; the SDK buys nothing server-side.
 * The SDK is used ONLY in browser/mobile clients for the streaming socket.
 *
 * Doc citations (verified 13 Aug 2026):
 * - Pre-recorded `{"url": ...}` body form:
 *   developers.deepgram.com/reference/pre-recorded
 * - `callback` query param, with "Deepgram will retry the callback up to 10
 *   times with a 30 second delay between attempts" on non-2xx:
 *   developers.deepgram.com/docs/callback
 * - Token grant `/v1/auth/grant` returning `{access_token, expires_in}`
 *   (default TTL 30 s, max 3600): developers.deepgram.com/reference/auth/tokens/grant
 * - Key validation: `GET /v1/auth/token` ("Get token details" — returns
 *   metadata about the key used for the request):
 *   developers.deepgram.com/reference/get-token-details
 */

import {
  ProviderAuthError,
  ProviderRateLimitError,
  ProviderUpstreamError,
  safeUpstreamDetail,
} from "../errors";
import type {
  ProviderDescriptor,
  SttCallbackResult,
  SttSubmitResult,
  StreamingTokenGrant,
} from "../types";

const DEEPGRAM_BASE = "https://api.deepgram.com";
export const DEEPGRAM_DEFAULT_STT_MODEL = "nova-3";

async function throwForStatus(response: Response): Promise<never> {
  if (response.status === 401 || response.status === 403) {
    throw new ProviderAuthError("deepgram");
  }
  if (response.status === 429) {
    const retryAfterHeader = response.headers.get("Retry-After");
    const retryAfterMs = retryAfterHeader
      ? Number.parseFloat(retryAfterHeader) * 1000
      : undefined;
    throw new ProviderRateLimitError("deepgram", retryAfterMs);
  }
  const body = await response.text().catch(() => "");
  throw new ProviderUpstreamError(
    "deepgram",
    response.status,
    safeUpstreamDetail(body),
  );
}

/**
 * Cheapest documented key check: GET /v1/auth/token with the pasted key.
 * Resolves on 2xx; throws ProviderAuthError on 401/403.
 */
export async function validateDeepgramKey(apiKey: string): Promise<void> {
  const response = await fetch(`${DEEPGRAM_BASE}/v1/auth/token`, {
    method: "GET",
    headers: { Authorization: `Token ${apiKey}` },
  });
  if (!response.ok) {
    await throwForStatus(response);
  }
}

/**
 * Submit a batch (pre-recorded) transcription by URL.
 *
 * Deepgram fetches the audio itself from `audioUrl` (the Convex signed
 * storage URL) and POSTs the finished transcript to `callbackUrl`. The
 * immediate response carries only a `request_id`, which the caller must
 * persist to correlate the callback.
 *
 * Containerized audio (WebM / MP4 / M4A / Ogg): send NO `encoding` and NO
 * `sample_rate` — Deepgram: "If containerized audio packets are sent, this
 * feature should not be used."
 */
export async function submitBatchTranscription(opts: {
  apiKey: string;
  audioUrl: string;
  callbackUrl: string;
  model?: string;
}): Promise<SttSubmitResult> {
  const params = new URLSearchParams({
    model: opts.model ?? DEEPGRAM_DEFAULT_STT_MODEL,
    smart_format: "true",
    punctuate: "true",
    callback: opts.callbackUrl,
  });
  const response = await fetch(`${DEEPGRAM_BASE}/v1/listen?${params}`, {
    method: "POST",
    headers: {
      Authorization: `Token ${opts.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: opts.audioUrl }),
  });
  if (!response.ok) {
    await throwForStatus(response);
  }
  const json = (await response.json()) as { request_id?: string };
  if (typeof json.request_id !== "string" || json.request_id === "") {
    throw new ProviderUpstreamError(
      "deepgram",
      response.status,
      "async submission response had no request_id",
    );
  }
  return { requestId: json.request_id };
}

/**
 * Mint a short-lived JWT for a client-held streaming WebSocket.
 * POST /v1/auth/grant → {access_token, expires_in}. Max TTL 3600 s.
 */
export async function grantStreamingToken(opts: {
  apiKey: string;
  ttlSeconds?: number;
}): Promise<StreamingTokenGrant> {
  const response = await fetch(`${DEEPGRAM_BASE}/v1/auth/grant`, {
    method: "POST",
    headers: {
      Authorization: `Token ${opts.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ttl_seconds: opts.ttlSeconds ?? 300 }),
  });
  if (!response.ok) {
    await throwForStatus(response);
  }
  const json = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (typeof json.access_token !== "string" || json.access_token === "") {
    throw new ProviderUpstreamError(
      "deepgram",
      response.status,
      "token grant response had no access_token",
    );
  }
  return {
    accessToken: json.access_token,
    expiresIn: typeof json.expires_in === "number" ? json.expires_in : 30,
  };
}

/**
 * Parse the JSON Deepgram POSTs to the callback URL when an async batch
 * transcription completes. Returns null when the payload is not a completed
 * transcription result (defensive: callbacks are an external input).
 */
export function parseDeepgramCallbackPayload(
  payload: unknown,
): SttCallbackResult | null {
  if (typeof payload !== "object" || payload === null) return null;
  const root = payload as Record<string, unknown>;

  const metadata = root.metadata as Record<string, unknown> | undefined;
  const requestId = metadata?.request_id;
  if (typeof requestId !== "string" || requestId === "") return null;

  const results = root.results as Record<string, unknown> | undefined;
  const channels = results?.channels as
    | Array<Record<string, unknown>>
    | undefined;
  const alternatives = channels?.[0]?.alternatives as
    | Array<Record<string, unknown>>
    | undefined;
  const transcript = alternatives?.[0]?.transcript;
  if (typeof transcript !== "string") return null;

  const duration = metadata?.duration;
  return {
    requestId,
    transcript,
    durationSeconds: typeof duration === "number" ? duration : undefined,
  };
}

export const deepgramProvider: ProviderDescriptor = {
  id: "deepgram",
  modalities: ["stt", "tts"],
  nativeKeyEnvVar: "DEEPGRAM_API_KEY",
  validateKey: validateDeepgramKey,
};

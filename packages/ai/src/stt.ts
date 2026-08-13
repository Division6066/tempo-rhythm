/**
 * Modality-level STT interface.
 *
 * Two shapes, matching the decided architecture:
 * - batch: submit a storage URL, receive the transcript later via an async
 *   provider callback (audio never passes through Convex compute).
 * - streaming: mint a short-lived token; the CLIENT holds the WebSocket.
 */

import {
  grantStreamingToken,
  parseDeepgramCallbackPayload,
  submitBatchTranscription,
} from "./byok-providers/deepgram";
import { resolveApiKey, resolveModelForModality } from "./byok-providers/index";
import type { SttCallbackResult, SttSubmitResult, StreamingTokenGrant } from "./types";

/**
 * Submit audio (by public signed URL) for async batch transcription.
 * The provider fetches the audio itself and POSTs the result to
 * `callbackUrl`. Persist the returned requestId to correlate the callback.
 */
export async function submitTranscription(opts: {
  audioUrl: string;
  callbackUrl: string;
  byokKey?: string;
}): Promise<SttSubmitResult> {
  const { apiKey } = resolveApiKey("stt", { byokKey: opts.byokKey });
  return submitBatchTranscription({
    apiKey,
    audioUrl: opts.audioUrl,
    callbackUrl: opts.callbackUrl,
    model: resolveModelForModality("stt"),
  });
}

/**
 * Mint a short-lived streaming token for a client-held socket. TTL default
 * 300 s (Deepgram default is 30 s, max 3600 s).
 */
export async function mintStreamingToken(opts: {
  ttlSeconds?: number;
  byokKey?: string;
} = {}): Promise<StreamingTokenGrant> {
  const { apiKey } = resolveApiKey("stt", { byokKey: opts.byokKey });
  return grantStreamingToken({ apiKey, ttlSeconds: opts.ttlSeconds ?? 300 });
}

/** Parse an async transcription callback body into a typed result. */
export function parseTranscriptionCallback(
  payload: unknown,
): SttCallbackResult | null {
  return parseDeepgramCallbackPayload(payload);
}

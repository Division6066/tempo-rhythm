/**
 * Modality-level TTS interface.
 *
 * Typed surface only for now: T-2017 scopes BYOK expansion to TTS, but no
 * feature consumes synthesis yet. The registry already routes the `tts`
 * modality (default deepgram / aura-2), so wiring a consumer later is a
 * provider call, not a config redesign.
 */

import { resolveApiKey, resolveModelForModality } from "./byok-providers/index";
import type { ResolvedKey } from "./types";

export type TtsRequest = {
  text: string;
  /** Provider voice/model override; defaults to AI_TTS_MODEL or aura-2. */
  model?: string;
};

/** Resolve which credential and model a TTS call would use (no synthesis yet). */
export function resolveTtsConfig(opts: { byokKey?: string } = {}): {
  key: ResolvedKey;
  model: string | undefined;
} {
  return {
    key: resolveApiKey("tts", { byokKey: opts.byokKey }),
    model: resolveModelForModality("tts"),
  };
}

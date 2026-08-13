/**
 * Modality-level embeddings interface.
 *
 * Typed surface only for now: nothing in the app computes embeddings yet
 * (the RAG ingestion pipeline is still on the backlog). The registry
 * already routes the `embeddings` modality so the eventual consumer only
 * has to implement the provider call.
 */

import { resolveApiKey, resolveModelForModality } from "./byok-providers/index";
import type { ResolvedKey } from "./types";

export type EmbeddingsRequest = {
  input: string[];
  model?: string;
};

/** Resolve which credential and model an embeddings call would use. */
export function resolveEmbeddingsConfig(opts: { byokKey?: string } = {}): {
  key: ResolvedKey;
  model: string | undefined;
} {
  return {
    key: resolveApiKey("embeddings", { byokKey: opts.byokKey }),
    model: resolveModelForModality("embeddings"),
  };
}

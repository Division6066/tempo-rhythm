/**
 * Mistral provider descriptor.
 *
 * Chat completions themselves stay in `convex/lib/ai_router.ts` (HARD_RULES
 * §6.1: the router migrates to packages/ai only "when a second consumer
 * appears outside convex/"). This module owns what the BYOK layer needs:
 * key validation and env-var identity.
 *
 * Doc citation: Mistral API reference, "List Models — GET /v1/models"
 * (docs.mistral.ai/api — Models section). The endpoint requires a valid
 * `Authorization: Bearer <key>` header and is the cheapest authenticated
 * call, making it the key-validation probe.
 */

import {
  ProviderAuthError,
  ProviderRateLimitError,
  ProviderUpstreamError,
  safeUpstreamDetail,
} from "../errors";
import type { ProviderDescriptor } from "../types";

const MISTRAL_BASE = "https://api.mistral.ai";

/** Validate a pasted Mistral key against GET /v1/models. */
export async function validateMistralKey(apiKey: string): Promise<void> {
  const response = await fetch(`${MISTRAL_BASE}/v1/models`, {
    method: "GET",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (response.ok) return;
  if (response.status === 401 || response.status === 403) {
    throw new ProviderAuthError("mistral");
  }
  if (response.status === 429) {
    throw new ProviderRateLimitError("mistral");
  }
  const body = await response.text().catch(() => "");
  throw new ProviderUpstreamError(
    "mistral",
    response.status,
    safeUpstreamDetail(body),
  );
}

export const mistralProvider: ProviderDescriptor = {
  id: "mistral",
  modalities: ["chat", "embeddings"],
  nativeKeyEnvVar: "MISTRAL_API_KEY",
  validateKey: validateMistralKey,
};

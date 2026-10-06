import { resolveAiEnv } from "./ai_env";
import { readEnv } from "./require_env";

/**
 * Deepgram listen request builder for the option-C half-spike.
 *
 * Live POST is gated: DEEPGRAM_API_KEY / AI_STT_API_KEY must be a real value
 * (not `__DUMMY_PASTE_ME__`) and Amit must confirm the key. This module does
 * not call the network by itself.
 */

export const DEEPGRAM_LISTEN_PATH = "/v1/listen";

export type DeepgramListenRequest = {
  url: string;
  headers: { Authorization: string; "Content-Type": "application/json" };
  body: string;
};

export type DeepgramGate =
  | { ready: true; apiKey: string; baseUrl: string; model: string }
  | { ready: false; reason: string };

export function deepgramGate(): DeepgramGate {
  const env = resolveAiEnv("stt");
  if (!env.apiKey) {
    return {
      ready: false,
      reason: "AI_STT_API_KEY / DEEPGRAM_API_KEY is unset or the dummy sentinel",
    };
  }
  return {
    ready: true,
    apiKey: env.apiKey,
    baseUrl: env.baseUrl,
    model: env.model,
  };
}

/** Convex storage signed URLs live on *.convex.cloud or *.convex.site. */
export function isConvexStorageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    return host.endsWith(".convex.cloud") || host.endsWith(".convex.site");
  } catch {
    return false;
  }
}

export function buildDeepgramListenRequest(
  signedAudioUrl: string,
  options?: { apiKey?: string; baseUrl?: string; model?: string },
): DeepgramListenRequest {
  if (!isConvexStorageUrl(signedAudioUrl)) {
    throw new Error("signed audio URL is not a Convex storage URL");
  }
  const gate = deepgramGate();
  const apiKey = options?.apiKey ?? (gate.ready ? gate.apiKey : undefined);
  if (!apiKey) {
    throw new Error("Deepgram key is not configured");
  }
  const baseUrl = (options?.baseUrl ?? (gate.ready ? gate.baseUrl : "https://api.deepgram.com")).replace(
    /\/+$/,
    "",
  );
  const model = options?.model ?? (gate.ready ? gate.model : "nova-2");
  const listenUrl = new URL(`${baseUrl}${DEEPGRAM_LISTEN_PATH}`);
  listenUrl.searchParams.set("model", model);
  listenUrl.searchParams.set("smart_format", "true");

  return {
    url: listenUrl.toString(),
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: signedAudioUrl }),
  };
}

/**
 * Perform the Deepgram POST. Callers must pass `confirmed: true` after Amit
 * explicitly verifies DEEPGRAM_API_KEY. Refuses otherwise.
 */
export async function postDeepgramListen(args: {
  signedAudioUrl: string;
  confirmed: boolean;
}): Promise<{ transcript: string; requestUrlHost: string }> {
  if (!args.confirmed) {
    throw new Error("Deepgram POST is gated until DEEPGRAM_API_KEY is confirmed");
  }
  if (readEnv("DEEPGRAM_SPIKE_CONFIRMED") !== "true") {
    throw new Error("Deepgram POST is gated until DEEPGRAM_SPIKE_CONFIRMED=true");
  }
  const request = buildDeepgramListenRequest(args.signedAudioUrl);
  const response = await fetch(request.url, {
    method: "POST",
    headers: request.headers,
    body: request.body,
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Deepgram listen failed: HTTP ${response.status} ${text.slice(0, 200)}`);
  }
  const json = (await response.json()) as {
    results?: { channels?: Array<{ alternatives?: Array<{ transcript?: string }> }> };
  };
  const transcript = json.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";
  return {
    transcript,
    requestUrlHost: new URL(request.url).host,
  };
}

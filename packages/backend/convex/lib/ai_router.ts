import {
  AiAuthError,
  AiContextTooLargeError,
  AiRateLimitedError,
  AiUpstreamError,
} from "./ai_errors";

export type AiTier = "fast" | "balanced" | "deep";
export type AiMessage = { role: "system" | "user" | "assistant"; content: string };
export type AiResult = {
  tier: AiTier;
  requestedTier: AiTier;
  model: string;
  content: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
  escalated: boolean;
};
export type AiCallOptions = {
  tier: AiTier;
  messages: AiMessage[];
  maxTokens?: number;
  temperature?: number;
  responseFormat?: "text" | "json_object";
};

export const TIER_MODEL: Record<AiTier, string> = {
  fast: "mistral-small-latest",
  balanced: "mistral-medium-latest",
  deep: "mistral-large-latest",
};

const ESCALATION_CHAIN: Record<AiTier, AiTier[]> = {
  fast: ["fast", "balanced", "deep"],
  balanced: ["balanced", "deep"],
  deep: ["deep"],
};

const CONTEXT_TOO_LARGE_PHRASES = [
  "context_length_exceeded",
  "too long",
  "maximum context length",
];

function isContextTooLarge(body: string): boolean {
  const lower = body.toLowerCase();
  return CONTEXT_TOO_LARGE_PHRASES.some((p) => lower.includes(p));
}

async function attemptCall(
  tier: AiTier,
  opts: AiCallOptions,
  apiKey: string,
): Promise<AiResult & { requestedTier: AiTier }> {
  const model = TIER_MODEL[tier];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  let response: Response;
  try {
    const body: Record<string, unknown> = {
      model,
      messages: opts.messages,
      max_tokens: opts.maxTokens ?? 1024,
      temperature: opts.temperature ?? 0.3,
      safe_prompt: false,
    };
    if (opts.responseFormat === "json_object") {
      body.response_format = { type: "json_object" };
    }

    response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    const isAbort =
      err instanceof Error && (err.name === "AbortError" || err.message.includes("aborted"));
    throw new AiUpstreamError(
      isAbort ? "Request timed out after 30s" : String(err),
      0,
      String(err),
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    if (response.status === 401) {
      throw new AiAuthError(`Mistral auth failed: ${text.slice(0, 200)}`);
    }
    if (response.status === 429) {
      const retryAfterHeader = response.headers.get("Retry-After");
      const retryAfterMs = retryAfterHeader ? parseFloat(retryAfterHeader) * 1000 : undefined;
      throw new AiRateLimitedError(`Rate limited by Mistral`, retryAfterMs);
    }
    if (response.status === 400 && isContextTooLarge(text)) {
      throw new AiContextTooLargeError(`Context too large for model ${model}`);
    }
    throw new AiUpstreamError(
      `Mistral returned HTTP ${response.status}`,
      response.status,
      text.slice(0, 200),
    );
  }

  const json = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
    usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  };

  return {
    tier,
    requestedTier: opts.tier,
    model,
    content: json.choices[0]?.message?.content ?? "",
    usage: {
      promptTokens: json.usage.prompt_tokens,
      completionTokens: json.usage.completion_tokens,
      totalTokens: json.usage.total_tokens,
    },
    escalated: tier !== opts.tier,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callLLM(opts: AiCallOptions): Promise<AiResult> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new AiAuthError("MISTRAL_API_KEY not set in Convex env");
  }

  const chain = ESCALATION_CHAIN[opts.tier];

  for (let chainIdx = 0; chainIdx < chain.length; chainIdx++) {
    const tier = chain[chainIdx];
    let lastErr: unknown;

    // Each tier gets one retry on rate-limit or upstream error.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await attemptCall(tier, opts, apiKey);
      } catch (err) {
        if (err instanceof AiAuthError) {
          throw err; // no retry
        }
        if (err instanceof AiContextTooLargeError) {
          // Escalate to next tier rather than retrying same tier.
          lastErr = err;
          break;
        }
        if (err instanceof AiRateLimitedError || err instanceof AiUpstreamError) {
          if (attempt === 0) {
            await sleep(500);
            continue;
          }
          throw err; // second failure — surface to caller
        }
        throw err;
      }
    }

    // Only reach here on AiContextTooLargeError — try next tier in chain.
    if (chainIdx === chain.length - 1) {
      throw lastErr; // chain exhausted
    }
  }

  // Unreachable, but satisfies TypeScript.
  throw new AiUpstreamError("Unexpected exit from callLLM", 0, "");
}

import OpenAI from "openai";

const baseURL =
  process.env.OLLAMA_API_URL
    ? `${process.env.OLLAMA_API_URL}/v1`
    : process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;

const apiKey =
  process.env.OLLAMA_API_KEY ||
  process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

if (!baseURL) {
  throw new Error(
    "No AI provider configured. Set OLLAMA_API_URL or AI_INTEGRATIONS_OPENAI_BASE_URL.",
  );
}

if (!apiKey) {
  throw new Error(
    "No AI API key configured. Set OLLAMA_API_KEY or AI_INTEGRATIONS_OPENAI_API_KEY.",
  );
}

export const AI_MODEL = process.env.OLLAMA_MODEL || "ministral-3";
export const AI_MODEL_BACKUP = process.env.OLLAMA_MODEL_BACKUP || "magistral";

export const COUNCIL_MODELS = (
  process.env.OLLAMA_COUNCIL_MODELS ||
  "gpt-oss,deepseek-v3.1,qwen3.5,minimax-m2.5,kimi-k2.5,glm-5"
).split(",").map((m) => m.trim());

export const openai = new OpenAI({
  apiKey,
  baseURL,
});

const MODEL_HEALTH: Record<string, { failures: number; lastFailure: number; avgLatencyMs: number; callCount: number }> = {};

function getModelHealth(model: string) {
  if (!MODEL_HEALTH[model]) {
    MODEL_HEALTH[model] = { failures: 0, lastFailure: 0, avgLatencyMs: 0, callCount: 0 };
  }
  return MODEL_HEALTH[model];
}

function recordSuccess(model: string, latencyMs: number) {
  const health = getModelHealth(model);
  health.callCount++;
  health.avgLatencyMs = (health.avgLatencyMs * (health.callCount - 1) + latencyMs) / health.callCount;
}

function recordFailure(model: string) {
  const health = getModelHealth(model);
  health.failures++;
  health.lastFailure = Date.now();
}

function isModelHealthy(model: string): boolean {
  const health = getModelHealth(model);
  if (health.failures === 0) return true;
  const cooldownMs = Math.min(health.failures * 30000, 300000);
  return Date.now() - health.lastFailure > cooldownMs;
}

export function getModelHealthStats(): Record<string, { failures: number; avgLatencyMs: number; callCount: number; healthy: boolean }> {
  const stats: Record<string, { failures: number; avgLatencyMs: number; callCount: number; healthy: boolean }> = {};
  for (const model of [AI_MODEL, AI_MODEL_BACKUP, ...COUNCIL_MODELS]) {
    const health = getModelHealth(model);
    stats[model] = {
      failures: health.failures,
      avgLatencyMs: Math.round(health.avgLatencyMs),
      callCount: health.callCount,
      healthy: isModelHealthy(model),
    };
  }
  return stats;
}

export interface AiCallResult {
  content: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  latencyMs: number;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout: ${label} exceeded ${ms}ms`)), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

export async function callWithFallback(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options?: { json?: boolean; timeoutMs?: number }
): Promise<string> {
  const models = [AI_MODEL, AI_MODEL_BACKUP];
  const timeout = options?.timeoutMs || 60000;

  for (const model of models) {
    if (!isModelHealthy(model)) {
      console.warn(`Skipping unhealthy model: ${model}`);
      continue;
    }

    try {
      const start = Date.now();
      const completion = await withTimeout(
        openai.chat.completions.create({
          model,
          messages,
          ...(options?.json ? { response_format: { type: "json_object" as const } } : {}),
        }),
        timeout,
        model,
      );
      const latency = Date.now() - start;
      const content = completion.choices[0]?.message?.content;
      if (content) {
        recordSuccess(model, latency);
        return content;
      }
    } catch (err) {
      recordFailure(model);
      console.warn(`Model ${model} failed, trying next:`, err instanceof Error ? err.message : err);
    }
  }

  throw new Error("All models failed");
}

export async function callWithFallbackDetailed(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options?: { json?: boolean; timeoutMs?: number }
): Promise<AiCallResult> {
  const models = [AI_MODEL, AI_MODEL_BACKUP];
  const timeout = options?.timeoutMs || 60000;

  for (const model of models) {
    if (!isModelHealthy(model)) continue;

    try {
      const start = Date.now();
      const completion = await withTimeout(
        openai.chat.completions.create({
          model,
          messages,
          ...(options?.json ? { response_format: { type: "json_object" as const } } : {}),
        }),
        timeout,
        model,
      );
      const latency = Date.now() - start;
      const content = completion.choices[0]?.message?.content;
      if (content) {
        recordSuccess(model, latency);
        return {
          content,
          model,
          inputTokens: completion.usage?.prompt_tokens,
          outputTokens: completion.usage?.completion_tokens,
          totalTokens: completion.usage?.total_tokens,
          latencyMs: latency,
        };
      }
    } catch (err) {
      recordFailure(model);
      console.warn(`Model ${model} failed:`, err instanceof Error ? err.message : err);
    }
  }

  throw new Error("All models failed");
}

export async function callCouncil(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options?: { maxModels?: number; timeoutMs?: number }
): Promise<Array<{ model: string; response: string; latencyMs: number; tokens?: number }>> {
  const timeout = options?.timeoutMs || 45000;
  const healthyModels = COUNCIL_MODELS.filter(isModelHealthy);
  const modelsToUse = healthyModels.slice(0, options?.maxModels || healthyModels.length);

  if (modelsToUse.length === 0) {
    console.warn("No healthy council models available, using all");
    modelsToUse.push(...COUNCIL_MODELS.slice(0, options?.maxModels || 3));
  }

  const results = await Promise.allSettled(
    modelsToUse.map(async (model) => {
      const start = Date.now();
      const completion = await withTimeout(
        openai.chat.completions.create({ model, messages }),
        timeout,
        `council:${model}`,
      );
      const latency = Date.now() - start;
      const response = completion.choices[0]?.message?.content || "";
      if (response) recordSuccess(model, latency);
      return {
        model,
        response,
        latencyMs: latency,
        tokens: completion.usage?.total_tokens,
      };
    })
  );

  const fulfilled = results
    .filter((r): r is PromiseFulfilledResult<{ model: string; response: string; latencyMs: number; tokens?: number }> =>
      r.status === "fulfilled" && r.value.response.length > 0
    )
    .map((r) => r.value);

  const failed = results.filter(r => r.status === "rejected");
  for (const f of failed) {
    const reason = (f as PromiseRejectedResult).reason;
    console.warn("Council model failed:", reason?.message || reason);
  }

  return fulfilled;
}

function scoreCouncilResponse(response: string): number {
  let score = 0;
  if (response.length > 100) score += 1;
  if (response.length > 500) score += 1;
  if (response.includes('"') || response.includes('{')) score += 1;
  const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length >= 3) score += 1;
  if (sentences.length >= 5) score += 1;
  return score;
}

export interface CouncilResult {
  responses: Array<{ model: string; response: string; latencyMs: number; tokens?: number; score: number }>;
  synthesis: string;
  synthesisModel: string;
  totalLatencyMs: number;
  totalTokens: number;
}

export async function synthesizeCouncil(
  prompt: string,
  systemPrompt: string,
  options?: { maxModels?: number; timeoutMs?: number }
): Promise<CouncilResult> {
  const councilStart = Date.now();

  const councilMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt },
  ];

  const responses = await callCouncil(councilMessages, options);

  if (responses.length === 0) {
    const result = await callWithFallbackDetailed(councilMessages);
    return {
      responses: [{ model: result.model, response: result.content, latencyMs: result.latencyMs, tokens: result.totalTokens, score: 5 }],
      synthesis: result.content,
      synthesisModel: result.model,
      totalLatencyMs: Date.now() - councilStart,
      totalTokens: result.totalTokens || 0,
    };
  }

  const scored = responses.map(r => ({
    ...r,
    score: scoreCouncilResponse(r.response),
  }));

  if (scored.length === 1) {
    return {
      responses: scored,
      synthesis: scored[0].response,
      synthesisModel: scored[0].model,
      totalLatencyMs: Date.now() - councilStart,
      totalTokens: scored.reduce((sum, r) => sum + (r.tokens || 0), 0),
    };
  }

  scored.sort((a, b) => b.score - a.score);

  const synthesisPrompt = scored
    .map((r, i) => `--- Response ${i + 1} (score: ${r.score}/5) ---\n${r.response}`)
    .join("\n\n");

  const synthesisResult = await callWithFallbackDetailed([
    {
      role: "system",
      content: `${systemPrompt}\n\nSynthesize multiple AI responses into one best answer. Prioritize higher-scored responses. Pick the strongest insights from each, resolve contradictions, and produce a single clear response. Do NOT mention the individual models or that you are synthesizing.`,
    },
    {
      role: "user",
      content: `Original question: ${prompt}\n\nResponses to synthesize:\n\n${synthesisPrompt}`,
    },
  ]);

  const totalTokens = scored.reduce((sum, r) => sum + (r.tokens || 0), 0) + (synthesisResult.totalTokens || 0);

  return {
    responses: scored,
    synthesis: synthesisResult.content,
    synthesisModel: synthesisResult.model,
    totalLatencyMs: Date.now() - councilStart,
    totalTokens,
  };
}

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

export async function callWithFallback(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options?: { json?: boolean }
): Promise<string> {
  const models = [AI_MODEL, AI_MODEL_BACKUP];

  for (const model of models) {
    try {
      const completion = await openai.chat.completions.create({
        model,
        messages,
        ...(options?.json ? { response_format: { type: "json_object" as const } } : {}),
      });
      const content = completion.choices[0]?.message?.content;
      if (content) return content;
    } catch (err) {
      console.warn(`Model ${model} failed, trying next:`, err instanceof Error ? err.message : err);
    }
  }

  throw new Error("All models failed");
}

export async function callCouncil(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options?: { maxModels?: number }
): Promise<Array<{ model: string; response: string }>> {
  const modelsToUse = COUNCIL_MODELS.slice(0, options?.maxModels || COUNCIL_MODELS.length);

  const results = await Promise.allSettled(
    modelsToUse.map(async (model) => {
      const completion = await openai.chat.completions.create({
        model,
        messages,
      });
      return {
        model,
        response: completion.choices[0]?.message?.content || "",
      };
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<{ model: string; response: string }> =>
      r.status === "fulfilled" && r.value.response.length > 0
    )
    .map((r) => r.value);
}

export async function synthesizeCouncil(
  prompt: string,
  systemPrompt: string,
  options?: { maxModels?: number }
): Promise<{ responses: Array<{ model: string; response: string }>; synthesis: string }> {
  const councilMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt },
  ];

  const responses = await callCouncil(councilMessages, options);

  if (responses.length === 0) {
    const fallback = await callWithFallback(councilMessages);
    return {
      responses: [{ model: AI_MODEL, response: fallback }],
      synthesis: fallback,
    };
  }

  if (responses.length === 1) {
    return { responses, synthesis: responses[0].response };
  }

  const synthesisPrompt = responses
    .map((r, i) => `--- Response ${i + 1} (${r.model}) ---\n${r.response}`)
    .join("\n\n");

  const synthesis = await callWithFallback([
    {
      role: "system",
      content: `${systemPrompt}\n\nYou are synthesizing multiple AI responses into one best answer. Pick the strongest insights from each, resolve contradictions, and produce a single clear response. Do NOT mention the individual models or that you are synthesizing.`,
    },
    {
      role: "user",
      content: `Original question: ${prompt}\n\nResponses to synthesize:\n\n${synthesisPrompt}`,
    },
  ]);

  return { responses, synthesis };
}

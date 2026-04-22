"use node";

/**
 * OpenRouter router for Tempo Flow.
 *
 * HARD_RULES §6.1 forbids direct provider SDKs (openai, @anthropic-ai/sdk,
 * @google/generative-ai). Every LLM call goes through OpenRouter over native
 * fetch. Keep the surface tiny so we can swap implementations later without
 * touching callers.
 */

export type AiTask = "routine_write" | "coach_response" | "extract" | "plan";

export type AiMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type CallAIArgs = {
  task: AiTask;
  prompt: string;
  history?: AiMessage[];
  temperature?: number;
};

export type CallAIResult = {
  text: string;
  model: string;
};

/**
 * Task → model mapping. Per HARD_RULES §6.1 we default to fast Gemma for
 * routine writes + extraction, and mid-tier Mistral for conversational + plan
 * surfaces.
 */
const MODEL_FOR_TASK: Record<AiTask, string> = {
  routine_write: "google/gemma-2-9b-it",
  extract: "google/gemma-2-9b-it",
  coach_response: "mistralai/mistral-small-3.1-24b-instruct",
  plan: "mistralai/mistral-small-3.1-24b-instruct",
};

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Call OpenRouter with the appropriate model for the task.
 * Throws a friendly Error on non-2xx so callers can surface it verbatim.
 */
export async function callAI({
  task,
  prompt,
  history,
  temperature = 0.6,
}: CallAIArgs): Promise<CallAIResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("AI unavailable: OPENROUTER_API_KEY missing");
  }

  const model = MODEL_FOR_TASK[task];
  const messages: AiMessage[] = [
    ...(history ?? []),
    { role: "user", content: prompt },
  ];

  let res: Response;
  try {
    res = await fetch(OPENROUTER_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "Tempo Flow",
      },
      body: JSON.stringify({ model, messages, temperature }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "network error";
    throw new Error(`AI unavailable: ${message}`);
  }

  if (!res.ok) {
    throw new Error(`AI unavailable: ${res.status}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content ?? "";
  return { text, model };
}

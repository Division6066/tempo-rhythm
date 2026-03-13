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

export const AI_MODEL = process.env.OLLAMA_MODEL || "llama3.1";

export const openai = new OpenAI({
  apiKey,
  baseURL,
});

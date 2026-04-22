"use node";

/**
 * Coach actions — live AI replies via OpenRouter.
 *
 * Lives in its own `"use node"` file because Convex forbids mixing mutations
 * (in coach.ts) with node-only actions. The web app calls
 * `api.coachActions.respond` per the /coach screen.
 *
 * HARD_RULES §6:
 * - All LLM calls through OpenRouter via native fetch (convex/lib/ai.ts).
 * - Messages are ephemeral — we do not persist coach transcripts here.
 * - The system prompt mirrors Tempo's anti-shame, concrete-next-step brand
 *   voice (see docs/brain/brand/voice.md + do-and-dont.md).
 */

import { v } from "convex/values";
import { action } from "./_generated/server";
import { callAI, type AiMessage } from "./lib/ai";

const SYSTEM_PROMPT = `You are Tempo's coach — warm, calm, and concrete.

Voice:
- Anti-shame. Never imply failure, laziness, or "falling behind".
- Short replies (2–4 sentences) unless the user explicitly asks for depth.
- Concrete next step. Always offer one small, do-able move — not a lecture.
- Respect overwhelm. If the user sounds overloaded, slow down and narrow the ask.
- Never silently change anything in the user's system; suggest, don't assume.

When the user lists many things, do NOT recap them. Pick one small step and name it.
When the user asks a yes/no question, answer in one sentence and offer one follow-up.
`;

const ROLE_VALIDATOR = v.union(
  v.literal("user"),
  v.literal("assistant"),
  v.literal("system"),
);

export const respond = action({
  args: {
    message: v.string(),
    history: v.optional(
      v.array(
        v.object({
          role: ROLE_VALIDATOR,
          content: v.string(),
        }),
      ),
    ),
  },
  handler: async (_ctx, { message, history }) => {
    const text = message.trim();
    if (!text) {
      throw new Error("Message is empty");
    }

    const fullHistory: AiMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history ?? []),
    ];

    const { text: reply, model } = await callAI({
      task: "coach_response",
      prompt: text,
      history: fullHistory,
    });

    return { reply, model };
  },
});

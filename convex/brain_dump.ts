import { v } from "convex/values";
import { action } from "./_generated/server";
import { AiAuthError, AiContextTooLargeError, AiRateLimitedError, AiUpstreamError } from "./lib/ai_errors";
import { callLLM } from "./lib/ai_router";
import { validateBrainDumpInput } from "./lib/brainDumpInput";
import {
  type BrainDumpPlan,
  parsePlanFromModelContent,
} from "./lib/brainDumpParse";

export type { BrainDumpPlan, BrainDumpPriority } from "./lib/brainDumpParse";
export { parsePlanFromModelContent } from "./lib/brainDumpParse";

const SYSTEM_PROMPT = `You are a calm planning assistant for an ADHD-friendly app. The user pastes a messy brain dump (tasks, worries, reminders mixed together).

Return ONLY a single JSON object (no markdown, no code fences) with this exact shape:
{
  "summary": "string — 1-3 short sentences, supportive and concrete, never shaming",
  "priorities": [
    {
      "title": "string — short actionable item, max ~78 chars",
      "reason": "string — one sentence why this slot",
      "urgency": "now" | "soon" | "later"
    }
  ]
}

Rules:
- "now" = needs attention today or removes urgent pressure (deadlines, people waiting, money, health).
- "soon" = this week / follow-ups that are not on fire.
- "later" = ideas, someday, optional.
- At most 6 priorities, ordered most important first.
- Titles must be practical next moves, not vague ("Reply to Sam" not "Communication").
- Use plain language.`;

/**
 * Preview-only: returns a prioritized plan from messy text. Does not write tasks or persist the dump.
 */
export const prioritize = action({
  args: {
    rawText: v.string(),
  },
  handler: async (ctx, args): Promise<BrainDumpPlan> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Sign in to use planning on this device.");
    }

    const validated = validateBrainDumpInput(args.rawText);
    if (!validated.ok) {
      throw new Error(validated.message);
    }
    const raw = validated.raw;

    try {
      const result = await callLLM({
        tier: "balanced",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Brain dump to prioritize:\n\n${raw}`,
          },
        ],
        maxTokens: 1024,
        temperature: 0.25,
        responseFormat: "json_object",
      });

      return parsePlanFromModelContent(result.content);
    } catch (err) {
      if (err instanceof AiAuthError) {
        throw new Error("Planning is not configured here yet. Use local sorting or try again later.");
      }
      if (err instanceof AiRateLimitedError) {
        throw new Error("Too many requests right now. Pause a moment and try again.");
      }
      if (err instanceof AiContextTooLargeError) {
        throw new Error("That input is too long for one pass. Try a shorter chunk.");
      }
      if (err instanceof AiUpstreamError) {
        throw new Error("The planner had a hiccup. Try again in a moment?");
      }
      if (err instanceof Error && err.message) {
        throw err;
      }
      throw new Error("Something went wrong while planning. Try again?");
    }
  },
});

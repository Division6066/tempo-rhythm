import { v } from "convex/values";
import { action } from "./_generated/server";
import { AiAuthError, AiContextTooLargeError, AiRateLimitedError, AiUpstreamError } from "./lib/ai_errors";
import { callLLM } from "./lib/ai_router";

const MAX_RAW_CHARS = 12_000;

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

type BrainDumpUrgency = "now" | "soon" | "later";

export type BrainDumpPriority = {
  title: string;
  reason: string;
  urgency: BrainDumpUrgency;
};

export type BrainDumpPlan = {
  summary: string;
  priorities: BrainDumpPriority[];
};

function isUrgency(x: unknown): x is BrainDumpUrgency {
  return x === "now" || x === "soon" || x === "later";
}

function parsePlanFromModelContent(content: string): BrainDumpPlan {
  const trimmed = content.trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence?.[1]) {
      try {
        parsed = JSON.parse(fence[1].trim());
      } catch {
        throw new Error("Could not read the plan format. Try again?");
      }
    } else {
      throw new Error("Could not read the plan format. Try again?");
    }
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Plan response was incomplete. Try again?");
  }

  const obj = parsed as Record<string, unknown>;
  const summary =
    typeof obj.summary === "string" ? obj.summary.trim() : "";
  if (!summary) {
    throw new Error("Plan response was incomplete. Try again?");
  }

  const rawList = obj.priorities;
  if (!Array.isArray(rawList)) {
    throw new Error("Plan response was incomplete. Try again?");
  }

  const priorities: BrainDumpPriority[] = [];
  for (const item of rawList) {
    if (priorities.length >= 6) break;
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const row = item as Record<string, unknown>;
    const title = typeof row.title === "string" ? row.title.trim() : "";
    const reason = typeof row.reason === "string" ? row.reason.trim() : "";
    const urgency = row.urgency;
    if (!title || !reason || !isUrgency(urgency)) continue;
    priorities.push({
      title: title.length > 200 ? `${title.slice(0, 197)}...` : title,
      reason: reason.length > 300 ? `${reason.slice(0, 297)}...` : reason,
      urgency,
    });
  }

  if (priorities.length === 0) {
    throw new Error("No clear items came back. Try a slightly longer list or run again?");
  }

  return { summary, priorities };
}

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

    const raw = args.rawText.trim();
    if (!raw) {
      throw new Error("Paste something first — even a rough list is enough.");
    }
    if (raw.length > MAX_RAW_CHARS) {
      throw new Error(
        `That is a lot at once (${raw.length} characters). Try the first chunk under ${MAX_RAW_CHARS} characters, then run again on the rest.`,
      );
    }

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

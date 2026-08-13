import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireUser } from "./lib/requireUser";

/**
 * English-first, anti-shame coach replies per technique (HARD_RULES §1).
 * Copy never implies the user is behind, failing, or lazy — it always offers
 * one small, optional next step.
 *
 * Keyed by `conversations.technique`; unknown or missing techniques fall back
 * to `general`.
 */
const COACH_REPLIES: Record<string, string> = {
  pomodoro:
    "Try one 25-minute stretch with a single timer. After a 5-minute break, you get to choose: another stretch, or move on. Either answer is a win.",
  body_double:
    "Work alongside someone — in person or on a quiet video call — without talking about the task. Just having company nearby makes it easier to stay with it.",
  eat_the_frog:
    "Pick the task that feels heaviest today and start there, before anything else. Only the first small step counts right now — nothing more.",
  time_blocking:
    "Block a short window on your calendar for one task, and set a single reminder for the end of the window. No mid-plan changes — the window does the deciding for you.",
  two_minute:
    "If it truly takes under two minutes, do it now. If not, shrink it into a step so small it starts in one second.",
  general:
    "What's the smallest step you could take without any resistance? Start there — that's the whole assignment.",
};

/**
 * Resolve the coach reply for a conversation technique.
 * Pure helper so the copy is unit-testable (see coach.test.ts).
 */
export function coachReplyForTechnique(technique: string | undefined): string {
  if (technique !== undefined && Object.prototype.hasOwnProperty.call(COACH_REPLIES, technique)) {
    return COACH_REPLIES[technique] as string;
  }
  return COACH_REPLIES.general as string;
}

/**
 * Append a user message and a coach reply (template by conversation technique).
 * Does not silently change tasks or notes — only chat rows.
 */
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  returns: v.object({ success: v.literal(true) }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const conv = await ctx.db.get(args.conversationId);
    if (!conv || conv.userId !== user._id) {
      throw new Error("Conversation not found");
    }
    const text = args.content.trim();
    if (!text) {
      throw new Error("Message is empty");
    }

    const now = Date.now();
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      role: "user",
      content: text,
      createdAt: now,
    });

    const assistantBody = coachReplyForTechnique(conv.technique);

    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      role: "assistant",
      content: assistantBody,
      modelUsed: "coach-template",
      createdAt: now + 1,
    });

    await ctx.db.patch(args.conversationId, {
      updatedAt: now + 1,
    });

    return { success: true as const };
  },
});

import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireUser } from "./lib/requireUser";

/**
 * Template-only coach replies. Used as a graceful fallback when OpenRouter is
 * unavailable, and as the source of the historical `sendMessage` behaviour.
 * Real AI replies live in `convex/coachActions.ts#respond`.
 */
const REPLIES: Record<string, string> = {
  pomodoro:
    "Try a 25-minute block with a single timer. After a 5-minute break, decide whether to run another block or move on.",
  body_double:
    "Work next to someone — in person or on a quiet video call — without talking about the task. The shared presence alone reduces pull to distract.",
  eat_the_frog:
    "Pick the heaviest task of the day and start with it before anything else. Just one small first step, right now.",
  time_blocking:
    "Block a short window on your calendar for the task and set one alert for the end of the window. Don't renegotiate the plan mid-block.",
  two_minute:
    "If it's honestly under two minutes, do it now. If not, reshape it into a tiny step that begins in one second.",
  general:
    "What's the smallest step that would move with zero resistance? Start there and nowhere else.",
};

/**
 * Append a user message and a coach reply (template by conversation technique).
 * Does not silently change tasks or notes — only chat rows. Real AI lives in
 * `coachActions.respond`; this mutation is kept for the offline demo surface.
 */
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
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

    const technique = conv.technique ?? "general";
    const assistantBody = REPLIES[technique] ?? REPLIES.general;

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

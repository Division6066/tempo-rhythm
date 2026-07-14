import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireUser } from "./lib/requireUser";

const REPLIES: Record<string, string> = {
  pomodoro:
    "נסה מקטע של 25 דקות עם טיימר אחד בלבד. אחרי הפסקה של 5 דקות, החלט אם להמשיך עוד מקטע או לעבור למשימה הבאה.",
  body_double:
    "עבוד לצד מישהו (או בשיחת וידאו שקטה) בלי לדבר על המשימה — הנוכחות לבד מורידה הסחות דעת.",
  eat_the_frog:
    "בחר את המשימה הכי כבדה היום והתחל ממנה לפני כל השאר. רק צעד ראשון קטן עכשיו.",
  time_blocking:
    "חסום ביומן חלון קצר לכל משימה והגדר התראה אחת לסוף החלון — לא לשינוי תוכנית באמצע.",
  two_minute:
    "אם זה באמת מתחת לשתי דקות — עשה עכשיו. אם לא, הפוך את זה לצעד קטן שמתחיל בשנייה אחת.",
  general:
    "מה הצעד הקטן ביותר שאפשר לעשות בלי התנגדות? התחל משם בלבד.",
};

/**
 * Append a user message and a coach reply (template by conversation technique).
 * Does not silently change tasks or notes — only chat rows.
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
    const assistantBody =
      REPLIES[technique] ?? REPLIES.general;

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

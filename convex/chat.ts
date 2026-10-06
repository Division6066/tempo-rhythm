import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import {
  action,
  internalMutation,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import {
  AiAuthError,
  AiContextTooLargeError,
  AiRateLimitedError,
  AiUpstreamError,
} from "./lib/ai_errors";
import { callLLM, type AiResult } from "./lib/ai_router";
import { requireApprovedForAi } from "./lib/aiGate";
import { buildChatMessages, type ChatHistoryItem } from "./lib/chatPrompt";
import { CRISIS_CARD, crisisCardText, isCrisisText } from "./lib/crisisWords";
import { requireUser } from "./lib/requireUser";

const MAX_MESSAGE_LENGTH = 4000;
const CONTEXT_MESSAGES = 20;
const CONTEXT_MEMORIES = 20;

type ChatContext = {
  history: ChatHistoryItem[];
  memories: Array<{ content: string }>;
};

type ChatDependencies = {
  requireApproval: () => Promise<void>;
  loadContext: () => Promise<ChatContext>;
  insertUserMessage: (content: string) => Promise<void>;
  insertAssistantMessage: (content: string, modelUsed: string) => Promise<void>;
  callModel: typeof callLLM;
  now: () => number;
};

export async function sendChat(
  deps: ChatDependencies,
  content: string,
): Promise<{ reply: string; crisis?: true }> {
  await deps.requireApproval();

  const text = content.trim();
  if (!text) throw new Error("Write a message first.");
  if (text.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Keep your message to ${MAX_MESSAGE_LENGTH} characters or fewer.`);
  }

  const crisis = isCrisisText(text);
  const context = crisis ? { history: [], memories: [] } : await deps.loadContext();
  await deps.insertUserMessage(text);

  if (crisis) {
    const reply = crisisCardText(CRISIS_CARD);
    await deps.insertAssistantMessage(reply, "crisis-card");
    return { reply, crisis: true };
  }

  let result: AiResult;
  try {
    result = await deps.callModel({
      tier: "balanced",
      messages: buildChatMessages({ ...context, userText: text, now: deps.now() }),
      maxTokens: 600,
      temperature: 0.6,
    });
  } catch (error) {
    if (error instanceof AiAuthError) {
      throw new Error("Chat is not configured here yet. Please try again later.");
    }
    if (error instanceof AiRateLimitedError) {
      throw new Error("Chat is busy right now. Pause a moment and try again.");
    }
    if (error instanceof AiContextTooLargeError) {
      throw new Error("This conversation is too long for one reply. Try a shorter message.");
    }
    if (error instanceof AiUpstreamError) {
      throw new Error("Tempo had a hiccup. Try again in a moment?");
    }
    throw error;
  }

  const reply = result.content.trim();
  if (!reply) throw new Error("Tempo could not form a reply. Try again in a moment?");
  await deps.insertAssistantMessage(reply, result.model);
  return { reply };
}

export const send = action({
  args: { conversationId: v.id("conversations"), content: v.string() },
  returns: v.object({ reply: v.string(), crisis: v.optional(v.literal(true)) }),
  handler: async (ctx, args): Promise<{ reply: string; crisis?: true }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Sign in to chat on this device.");

    return sendChat(
      {
        requireApproval: () => requireApprovedForAi(ctx),
        loadContext: () => ctx.runQuery(internal.chat.loadContext, { conversationId: args.conversationId }),
        insertUserMessage: async (content) => {
          await ctx.runMutation(internal.chat.insertUserMessage, {
            conversationId: args.conversationId,
            content,
          });
        },
        insertAssistantMessage: async (content, modelUsed) => {
          await ctx.runMutation(internal.chat.insertAssistantMessage, {
            conversationId: args.conversationId,
            content,
            modelUsed,
          });
        },
        callModel: callLLM,
        now: Date.now,
      },
      args.content,
    );
  },
});

async function requireOwnedConversation(
  ctx: QueryCtx | MutationCtx,
  conversationId: Id<"conversations">,
): Promise<{ user: Doc<"users">; conversation: Doc<"conversations"> }> {
  const user = await requireUser(ctx);
  const conversation = await ctx.db.get(conversationId);
  if (!conversation || conversation.userId !== user._id || conversation.deletedAt !== undefined) {
    throw new Error("Conversation not found or access denied");
  }
  return { user, conversation };
}

export const loadContext = internalQuery({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args): Promise<ChatContext> => {
    const { user } = await requireOwnedConversation(ctx, args.conversationId);
    const newestMessages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId_deletedAt", (q) =>
        q.eq("conversationId", args.conversationId).eq("deletedAt", undefined),
      )
      .order("desc")
      .take(CONTEXT_MESSAGES);
    const memories = await ctx.db
      .query("memories")
      .withIndex("by_userId_deletedAt", (q) =>
        q.eq("userId", user._id).eq("deletedAt", undefined),
      )
      .collect();

    return {
      history: newestMessages.reverse().map(({ role, content }) => ({ role, content })),
      memories: memories
        .filter((memory) => memory.deletedAt === undefined)
        .sort((a, b) => b.salience - a.salience || b.updatedAt - a.updatedAt)
        .slice(0, CONTEXT_MEMORIES)
        .map(({ content }) => ({ content })),
    };
  },
});

export const insertUserMessage = internalMutation({
  args: { conversationId: v.id("conversations"), content: v.string() },
  handler: async (ctx, args) => {
    await requireOwnedConversation(ctx, args.conversationId);
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      role: "user",
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

export const insertAssistantMessage = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    modelUsed: v.string(),
  },
  handler: async (ctx, args) => {
    await requireOwnedConversation(ctx, args.conversationId);
    const now = Date.now();
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      role: "assistant",
      content: args.content,
      modelUsed: args.modelUsed,
      createdAt: now,
    });
    await ctx.db.patch(args.conversationId, { updatedAt: now });
  },
});

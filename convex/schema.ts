import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  users: defineTable({
    email: v.string(),
    emailVerified: v.optional(v.boolean()),
    fullName: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("user")),
    userType: v.optional(v.union(v.literal("free"), v.literal("paid"))),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_userType", ["userType"]),

  conversations: defineTable({
    userId: v.id("users"),
    title: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_updatedAt", ["userId", "updatedAt"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    modelUsed: v.optional(v.string()),
    councilResponse: v.optional(v.any()),
    toolCalls: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_conversationId_createdAt", ["conversationId", "createdAt"]),

  memories: defineTable({
    userId: v.id("users"),
    content: v.string(),
    sector: v.union(
      v.literal("semantic"),
      v.literal("episodic"),
      v.literal("procedural"),
      v.literal("emotional"),
      v.literal("general"),
    ),
    salience: v.number(),
    decayRate: v.number(),
    lastAccessed: v.number(),
    accessCount: v.number(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_salience", ["userId", "salience"]),
});

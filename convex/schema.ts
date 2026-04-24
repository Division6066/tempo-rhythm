import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// HARD_RULES §9 — every user-owned table must carry `deletedAt: v.optional(v.number())`
// for soft-delete. `undefined` means the row is live; a number is the epoch-ms the row was
// soft-deleted at. Hard deletes are forbidden for user-visible data (§9, §6 DSR grace window).
//
// `userId` is intentionally `v.id("users")` in this repo until the migration to
// `v.optional(v.string())` lands (see docs/brain/TASKS.md for the migration ticket).
// HARD_RULES §9 "Current repository" explicitly permits this transitional state.
//
// Every table queried by userId carries a compound `by_userId_deletedAt` index so active
// rows can be streamed without a full scan.

export default defineSchema({
  ...authTables,

  users: defineTable({
    // Baseline fields expected by @convex-dev/auth (see authTables.users + labs schema guide).
    // Keep these optional so internal auth flows can patch/link without schema violations.
    image: v.optional(v.string()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    email: v.string(),
    emailVerificationTime: v.optional(v.number()),
    emailVerified: v.optional(v.boolean()),
    fullName: v.optional(v.string()),
    name: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
    userType: v.optional(v.union(v.literal("free"), v.literal("paid"))),
    betaAccess: v.optional(v.union(v.literal("none"), v.literal("tester"), v.literal("founder"))),
    entitlementTier: v.optional(
      v.union(
        v.literal("none"),
        v.literal("basic"),
        v.literal("pro"),
        v.literal("max"),
        v.literal("god"),
      ),
    ),
    isGodTier: v.optional(v.boolean()),
    betaApprovedAt: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
  })
    // Name must match convex-auth defaults so library helpers can use withIndex("email", ...).
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_role", ["role"])
    .index("by_userType", ["userType"])
    .index("by_betaAccess", ["betaAccess"])
    .index("by_deletedAt", ["deletedAt"]),

  subscriptionStates: defineTable({
    userId: v.id("users"),
    plan: v.union(
      v.literal("none"),
      v.literal("trial"),
      v.literal("basic"),
      v.literal("pro"),
      v.literal("max"),
    ),
    billingCycle: v.union(
      v.literal("none"),
      v.literal("monthly"),
      v.literal("annual"),
      v.literal("lifetime"),
    ),
    status: v.union(
      v.literal("inactive"),
      v.literal("active"),
      v.literal("grace"),
      v.literal("cancelled"),
    ),
    trialUsed: v.boolean(),
    source: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  conversations: defineTable({
    userId: v.id("users"),
    title: v.string(),
    technique: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_updatedAt", ["userId", "updatedAt"])
    .index("by_userId_deletedAt", ["userId", "deletedAt"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    modelUsed: v.optional(v.string()),
    councilResponse: v.optional(v.any()),
    toolCalls: v.optional(v.any()),
    createdAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_conversationId_createdAt", ["conversationId", "createdAt"])
    .index("by_conversationId_deletedAt", ["conversationId", "deletedAt"]),

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
    deletedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_salience", ["userId", "salience"])
    .index("by_userId_deletedAt", ["userId", "deletedAt"]),

  tasks: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("done"),
      v.literal("cancelled"),
    ),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    dueAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_status", ["userId", "status"])
    .index("by_userId_dueAt", ["userId", "dueAt"])
    .index("by_userId_deletedAt", ["userId", "deletedAt"]),

  notes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
    pinned: v.boolean(),
    periodType: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("none"),
    ),
    aiGenerated: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_pinned", ["userId", "pinned"])
    .index("by_userId_updatedAt", ["userId", "updatedAt"])
    .index("by_userId_deletedAt", ["userId", "deletedAt"]),

  habits: defineTable({
    userId: v.id("users"),
    name: v.string(),
    cadence: v.union(v.literal("daily"), v.literal("weekly")),
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastCompletedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_deletedAt", ["userId", "deletedAt"]),

  goals: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    targetDate: v.optional(v.number()),
    progressPercent: v.number(),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("archived")),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_status", ["userId", "status"])
    .index("by_userId_deletedAt", ["userId", "deletedAt"]),
});

import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  profiles: defineTable({
    userId: v.id("users"),
    fullName: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("user")),
    userType: v.optional(v.union(v.literal("free"), v.literal("paid"))),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"]),

  tasks: defineTable({
    userId: v.optional(v.string()),
    title: v.string(),
    status: v.string(),
    priority: v.string(),
    projectId: v.optional(v.id("projects")),
    folderId: v.optional(v.id("folders")),
    tags: v.array(v.string()),
    dueDate: v.optional(v.string()),
    scheduledDate: v.optional(v.string()),
    estimatedMinutes: v.optional(v.number()),
    notes: v.optional(v.string()),
    parentTaskId: v.optional(v.id("tasks")),
    aiGenerated: v.boolean(),
    startTime: v.optional(v.string()),
    duration: v.optional(v.number()),
    recurrenceRule: v.optional(v.string()),
    recurrenceEndDate: v.optional(v.string()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_userId", ["userId"])
    .index("by_scheduledDate", ["scheduledDate"]),

  notes: defineTable({
    userId: v.optional(v.string()),
    title: v.string(),
    content: v.string(),
    projectId: v.optional(v.id("projects")),
    folderId: v.optional(v.id("folders")),
    tags: v.array(v.string()),
    templateType: v.optional(v.string()),
    isPinned: v.boolean(),
    isPublished: v.optional(v.boolean()),
    publishSlug: v.optional(v.string()),
    periodType: v.optional(v.string()),
    periodDate: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_isPinned", ["isPinned"])
    .index("by_userId", ["userId"])
    .index("by_publishSlug", ["publishSlug"])
    .index("by_periodType", ["periodType"]),

  projects: defineTable({
    userId: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    folderId: v.optional(v.id("folders")),
    color: v.optional(v.string()),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_userId", ["userId"]),

  folders: defineTable({
    userId: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    parentFolderId: v.optional(v.id("folders")),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"]),

  tags: defineTable({
    userId: v.optional(v.string()),
    name: v.string(),
    color: v.optional(v.string()),
  })
    .index("by_userId", ["userId"]),

  dailyPlans: defineTable({
    userId: v.optional(v.string()),
    date: v.string(),
    blocks: v.any(),
    mood: v.optional(v.string()),
    energyLevel: v.optional(v.number()),
    aiGenerated: v.boolean(),
    acceptedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_date", ["date"])
    .index("by_userId", ["userId"]),

  preferences: defineTable({
    userId: v.optional(v.string()),
    wakeTime: v.string(),
    sleepTime: v.string(),
    energyPeaks: v.array(v.string()),
    prepBufferMinutes: v.number(),
    planningStyle: v.string(),
    adhdMode: v.boolean(),
    focusSessionMinutes: v.number(),
    breakMinutes: v.number(),
    onboardingComplete: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"]),

  memories: defineTable({
    userId: v.optional(v.string()),
    tier: v.string(),
    content: v.string(),
    decay: v.number(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_tier", ["tier"]),

  stagedSuggestions: defineTable({
    userId: v.string(),
    type: v.string(),
    data: v.any(),
    reasoning: v.optional(v.string()),
    status: v.string(),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_type", ["type"]),

  calendarEvents: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    color: v.optional(v.string()),
    isAllDay: v.optional(v.boolean()),
    externalId: v.optional(v.string()),
    source: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_date", ["date"]),

  noteLinks: defineTable({
    userId: v.string(),
    sourceNoteId: v.id("notes"),
    targetNoteId: v.id("notes"),
    createdAt: v.number(),
  })
    .index("by_sourceNoteId", ["sourceNoteId"])
    .index("by_targetNoteId", ["targetNoteId"])
    .index("by_userId", ["userId"]),

  savedFilters: defineTable({
    userId: v.string(),
    name: v.string(),
    conditions: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"]),

  templates: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    content: v.string(),
    category: v.optional(v.string()),
    isBuiltIn: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"]),
});

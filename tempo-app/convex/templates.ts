import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./_helpers";

const BUILT_IN_TEMPLATES = [
  {
    name: "Daily Note",
    description: "A structured template for daily planning and reflection",
    content: `# Daily Note - {{date}}

## Top 3 Priorities
1. 
2. 
3. 

## Schedule
- [ ] Morning routine
- [ ] 

## Notes


## Reflection
- What went well today?
- What could be improved?
`,
    category: "planning",
  },
  {
    name: "Meeting Notes",
    description: "Capture meeting discussions, decisions, and action items",
    content: `# Meeting: {{title}}

**Date:** {{date}}
**Attendees:** 

## Agenda
1. 

## Discussion Notes


## Decisions Made
- 

## Action Items
- [ ] 
- [ ] 

## Follow-up
`,
    category: "meetings",
  },
  {
    name: "Weekly Review",
    description: "Review your week and plan ahead",
    content: `# Weekly Review - Week of {{date}}

## Accomplishments
- 

## Challenges
- 

## Key Learnings
- 

## Next Week's Focus
1. 
2. 
3. 

## Energy & Wellbeing
- Overall energy level: /10
- Highlight of the week:
- Area for improvement:
`,
    category: "planning",
  },
  {
    name: "Project Brief",
    description: "Outline a new project with goals and milestones",
    content: `# Project: {{title}}

## Overview


## Goals
1. 
2. 
3. 

## Milestones
- [ ] Phase 1: 
- [ ] Phase 2: 
- [ ] Phase 3: 

## Resources Needed
- 

## Timeline
- Start date: 
- Target completion: 

## Notes
`,
    category: "projects",
  },
];

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.db
      .query("templates")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("templates") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const template = await ctx.db.get(args.id);
    if (!template || template.userId !== userId) return null;
    return template;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    content: v.string(),
    category: v.optional(v.string()),
    isBuiltIn: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const now = Date.now();
    return await ctx.db.insert("templates", {
      userId,
      name: args.name,
      description: args.description,
      content: args.content,
      category: args.category,
      isBuiltIn: args.isBuiltIn,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("templates"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const template = await ctx.db.get(args.id);
    if (!template || template.userId !== userId) throw new Error("Not found");
    const { id, ...updates } = args;
    const filtered: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) filtered[k] = val;
    }
    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { id: v.id("templates") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const template = await ctx.db.get(args.id);
    if (!template || template.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});

export const seedBuiltIn = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const existing = await ctx.db
      .query("templates")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    const existingNames = new Set(existing.map((t) => t.name));
    const now = Date.now();
    for (const tmpl of BUILT_IN_TEMPLATES) {
      if (!existingNames.has(tmpl.name)) {
        await ctx.db.insert("templates", {
          userId,
          name: tmpl.name,
          description: tmpl.description,
          content: tmpl.content,
          category: tmpl.category,
          isBuiltIn: true,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  },
});

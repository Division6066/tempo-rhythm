import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const exportUserData = action({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.runQuery(api.tasks.list, {});
    const notes = await ctx.runQuery(api.notes.list);
    const projects = await ctx.runQuery(api.projects.list);
    const preferences = await ctx.runQuery(api.preferences.get);
    const tags = await ctx.runQuery(api.tags.list);
    const memories = await ctx.runQuery(api.memories.list);
    const chatMessages = await ctx.runQuery(api.chatMessages.list);

    return {
      exportedAt: new Date().toISOString(),
      tasks: tasks.map((t) => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        scheduledDate: t.scheduledDate,
        notes: t.notes,
        tags: t.tags,
        dueDate: t.dueDate,
        estimatedMinutes: t.estimatedMinutes,
      })),
      notes: notes.map((n) => ({
        title: n.title,
        content: n.content,
        isPinned: n.isPinned,
        tags: n.tags,
      })),
      projects: projects.map((p) => ({
        name: p.name,
        description: p.description,
        color: p.color,
        status: p.status,
      })),
      tags: tags.map((t) => ({
        name: t.name,
        color: t.color,
      })),
      memories: memories.map((m) => ({
        tier: m.tier,
        content: m.content,
      })),
      chatMessages: chatMessages.map((m) => ({
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
      preferences: preferences ? {
        adhdMode: preferences.adhdMode,
        wakeTime: preferences.wakeTime,
        sleepTime: preferences.sleepTime,
        focusSessionMinutes: preferences.focusSessionMinutes,
        breakMinutes: preferences.breakMinutes,
      } : null,
    };
  },
});

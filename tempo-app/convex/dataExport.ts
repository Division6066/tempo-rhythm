import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const exportUserData = action({
  args: {},
  handler: async (ctx): Promise<Record<string, unknown>> => {
    const tasks: Array<Record<string, unknown>> = await ctx.runQuery(api.tasks.list, {});
    const notes: Array<Record<string, unknown>> = await ctx.runQuery(api.notes.list);
    const projects: Array<Record<string, unknown>> = await ctx.runQuery(api.projects.list);
    const preferences: Record<string, unknown> | null = await ctx.runQuery(api.preferences.get);
    const tags: Array<Record<string, unknown>> = await ctx.runQuery(api.tags.list);
    const memories: Array<Record<string, unknown>> = await ctx.runQuery(api.memories.list);
    const chatMessages: Array<Record<string, unknown>> = await ctx.runQuery(api.chatMessages.list);

    return {
      exportedAt: new Date().toISOString(),
      tasks: tasks.map((t: Record<string, unknown>) => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        scheduledDate: t.scheduledDate,
        notes: t.notes,
        tags: t.tags,
        dueDate: t.dueDate,
        estimatedMinutes: t.estimatedMinutes,
      })),
      notes: notes.map((n: Record<string, unknown>) => ({
        title: n.title,
        content: n.content,
        isPinned: n.isPinned,
        tags: n.tags,
      })),
      projects: projects.map((p: Record<string, unknown>) => ({
        name: p.name,
        description: p.description,
        color: p.color,
        status: p.status,
      })),
      tags: tags.map((t: Record<string, unknown>) => ({
        name: t.name,
        color: t.color,
      })),
      memories: memories.map((m: Record<string, unknown>) => ({
        tier: m.tier,
        content: m.content,
      })),
      chatMessages: chatMessages.map((m: Record<string, unknown>) => ({
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

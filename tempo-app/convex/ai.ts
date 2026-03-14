import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

const SYSTEM_PROMPT = `You are Tempo, a calm, supportive ADHD-friendly planning assistant. You help users organize their thoughts, tasks, and day.

Rules:
- Be concise and warm. Never overwhelming.
- Suggest, don't dictate. The user always has final control.
- Use simple language. Break complex things into small steps.
- Be aware of ADHD challenges: overwhelm, time blindness, task paralysis.
- When suggesting plans, consider energy levels and realistic time estimates.
- Never invent commitments or deadlines the user didn't mention.`;

async function callOpenAI(messages: Array<{ role: string; content: string }>): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("AI features are not configured. Please set the OPENAI_API_KEY environment variable.");
  }
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 4096,
      messages,
    }),
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`AI service error (${res.status}): ${errorText}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export const chat = action({
  args: { message: v.string() },
  handler: async (ctx, args) => {
    const prefs = await ctx.runQuery(api.preferences.get);
    const mems = await ctx.runQuery(api.memories.list);
    const contextStr = prefs
      ? `Wake: ${prefs.wakeTime}, Sleep: ${prefs.sleepTime}, Planning: ${prefs.planningStyle}, ADHD: ${prefs.adhdMode}, Focus: ${prefs.focusSessionMinutes}min`
      : "No preferences set";
    const memStr = mems.map((m: { tier: string; content: string }) => `[${m.tier}] ${m.content}`).join("\n");

    const content = await callOpenAI([
      { role: "system", content: `${SYSTEM_PROMPT}\n\nUser context:\n${contextStr}\n\nMemories:\n${memStr}` },
      { role: "user", content: args.message },
    ]);

    return {
      response: content || "I'm here to help. What would you like to work on?",
      suggestions: ["Plan my day", "Help me break this down", "What should I focus on?"],
    };
  },
});

export const extractTasks = action({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const content = await callOpenAI([
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\nExtract actionable tasks from messy text. Return valid JSON only.\nFormat: {"tasks": [{"title": "...", "priority": "high|medium|low", "estimatedMinutes": number|null, "tags": ["..."]}]}`,
      },
      { role: "user", content: args.text },
    ]);
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned);
    } catch {
      return { tasks: [{ title: args.text.slice(0, 100), priority: "medium" }] };
    }
  },
});

export const chunkTask = action({
  args: { taskTitle: v.string(), taskNotes: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const content = await callOpenAI([
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\nBreak this task into 3-5 small, concrete subtasks (10-30 min each). Return valid JSON only.\nFormat: {"subtasks": [{"title": "...", "priority": "high|medium|low", "estimatedMinutes": number, "tags": []}], "reasoning": "..."}`,
      },
      { role: "user", content: `Task: ${args.taskTitle}${args.taskNotes ? `\nNotes: ${args.taskNotes}` : ""}` },
    ]);
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        subtasks: [
          { title: `Start: ${args.taskTitle}`, priority: "medium", estimatedMinutes: 15, tags: [] },
          { title: `Continue: ${args.taskTitle}`, priority: "medium", estimatedMinutes: 15, tags: [] },
          { title: `Finish: ${args.taskTitle}`, priority: "medium", estimatedMinutes: 15, tags: [] },
        ],
        reasoning: "Broken into start, continue, finish steps.",
      };
    }
  },
});

export const prioritize = action({
  args: { tasks: v.array(v.object({ id: v.string(), title: v.string(), priority: v.string() })) },
  handler: async (ctx, args) => {
    const prefs = await ctx.runQuery(api.preferences.get);
    const contextStr = prefs
      ? `Wake: ${prefs.wakeTime}, Sleep: ${prefs.sleepTime}, ADHD: ${prefs.adhdMode}`
      : "";
    const content = await callOpenAI([
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\nUser context:\n${contextStr}\n\nPrioritize these tasks for someone with ADHD. Consider urgency, energy, quick wins. Return valid JSON only.\nFormat: {"orderedTaskIds": ["id1", ...], "reasoning": "..."}`,
      },
      { role: "user", content: JSON.stringify(args.tasks) },
    ]);
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned);
    } catch {
      return { orderedTaskIds: args.tasks.map((t) => t.id), reasoning: "Kept original order." };
    }
  },
});

export const generatePlan = action({
  args: { date: v.string(), taskIds: v.optional(v.array(v.string())) },
  handler: async (ctx, args) => {
    const prefs = await ctx.runQuery(api.preferences.get);
    const mems = await ctx.runQuery(api.memories.list);
    const allTasks = await ctx.runQuery(api.tasks.list, {});
    const contextStr = prefs
      ? `Wake: ${prefs.wakeTime}, Sleep: ${prefs.sleepTime}, Planning: ${prefs.planningStyle}, ADHD: ${prefs.adhdMode}, Focus: ${prefs.focusSessionMinutes}min, Break: ${prefs.breakMinutes}min`
      : "";
    const memStr = mems.map((m: { tier: string; content: string }) => `[${m.tier}] ${m.content}`).join("\n");
    const taskList = allTasks
      .filter((t: { status: string }) => t.status === "today" || t.status === "inbox")
      .map((t: { _id: string; title: string; priority: string; estimatedMinutes?: number }) => ({
        id: t._id,
        title: t.title,
        priority: t.priority,
        estimatedMinutes: t.estimatedMinutes,
      }));

    const content = await callOpenAI([
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\nUser context:\n${contextStr}\n\nMemories:\n${memStr}\n\nCreate an ADHD-friendly daily plan using blocks: top3, focusBlock, taskSection, reflection. Return valid JSON only.\nFormat: {"blocks": [...], "reasoning": "..."}`,
      },
      { role: "user", content: `Date: ${args.date}\nTasks: ${JSON.stringify(taskList)}` },
    ]);
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        blocks: [
          { type: "top3", items: taskList.slice(0, 3).map((t: { title: string }) => t.title) },
          { type: "focusBlock", title: "Deep Work", startTime: "09:00", duration: 90, task: taskList[0]?.title || "Focus time" },
          { type: "taskSection", title: "Quick Wins", tasks: taskList.slice(3).map((t: { title: string }) => t.title) },
          { type: "reflection", prompt: "What's the ONE thing that would make today a win?" },
        ],
        reasoning: "Generated a balanced plan with top priorities, deep work, and quick wins.",
      };
    }
  },
});

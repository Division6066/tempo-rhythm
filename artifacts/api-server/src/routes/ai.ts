import { Router, type IRouter } from "express";
import { db, tasksTable, preferencesTable, memoriesTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import {
  AiChatBody,
  AiChatResponse,
  AiExtractTasksBody,
  AiExtractTasksResponse,
  AiChunkTaskBody,
  AiChunkTaskResponse,
  AiPrioritizeBody,
  AiPrioritizeResponse,
  AiGeneratePlanBody,
  AiGeneratePlanResponse,
} from "@workspace/api-zod";
import { callWithFallback, synthesizeCouncil } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

async function getContext() {
  const prefs = await db.select().from(preferencesTable);
  const memories = await db.select().from(memoriesTable);
  const pref = prefs[0];
  return {
    preferences: pref
      ? `Wake: ${pref.wakeTime}, Sleep: ${pref.sleepTime}, Planning style: ${pref.planningStyle}, ADHD mode: ${pref.adhdMode}, Focus: ${pref.focusSessionMinutes}min sessions with ${pref.breakMinutes}min breaks, Buffer: ${pref.prepBufferMinutes}min, Energy peaks: ${(pref.energyPeaks || []).join(", ")}`
      : "No preferences set",
    memories: memories.map((m) => `[${m.tier}] ${m.content}`).join("\n"),
  };
}

const SYSTEM_PROMPT = `You are Tempo, a calm, supportive ADHD-friendly planning assistant. You help users organize their thoughts, tasks, and day.

Rules:
- Be concise and warm. Never overwhelming.
- Suggest, don't dictate. The user always has final control.
- Use simple language. Break complex things into small steps.
- Be aware of ADHD challenges: overwhelm, time blindness, task paralysis.
- When suggesting plans, consider energy levels and realistic time estimates.
- Never invent commitments or deadlines the user didn't mention.`;

router.post("/ai/chat", async (req, res): Promise<void> => {
  const parsed = AiChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const ctx = await getContext();

    const response = await callWithFallback([
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\nUser context:\n${ctx.preferences}\n\nMemories:\n${ctx.memories}`,
      },
      { role: "user", content: parsed.data.message },
    ]);

    res.json(
      AiChatResponse.parse({
        response,
        suggestions: [
          "Plan my day",
          "Help me break this down",
          "What should I focus on?",
        ],
      })
    );
  } catch (err) {
    console.error("AI chat error:", err);
    res.json(
      AiChatResponse.parse({
        response: "I'm here to help. What would you like to work on?",
        suggestions: ["Plan my day", "Help me break this down", "What should I focus on?"],
      })
    );
  }
});

router.post("/ai/extract-tasks", async (req, res): Promise<void> => {
  const parsed = AiExtractTasksBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const ctx = await getContext();

    const content = await callWithFallback([
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\nUser context:\n${ctx.preferences}\n\nExtract actionable tasks from the user's messy text. Return valid JSON only, no markdown.
Format: {"tasks": [{"title": "...", "priority": "high|medium|low", "estimatedMinutes": number|null, "tags": ["..."]}]}`,
      },
      { role: "user", content: parsed.data.text },
    ]);

    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(cleaned);
    res.json(AiExtractTasksResponse.parse(result));
  } catch {
    res.json(AiExtractTasksResponse.parse({ tasks: [{ title: parsed.data.text.slice(0, 100), priority: "medium" }] }));
  }
});

router.post("/ai/chunk-task", async (req, res): Promise<void> => {
  const parsed = AiChunkTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const content = await callWithFallback([
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\nBreak this task into 3-5 small, concrete subtasks that someone with ADHD can actually start. Each should take 10-30 minutes. Return valid JSON only, no markdown.
Format: {"subtasks": [{"title": "...", "priority": "high|medium|low", "estimatedMinutes": number, "tags": []}], "reasoning": "..."}`,
      },
      {
        role: "user",
        content: `Task: ${parsed.data.taskTitle}${parsed.data.taskNotes ? `\nNotes: ${parsed.data.taskNotes}` : ""}`,
      },
    ]);

    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(cleaned);
    res.json(AiChunkTaskResponse.parse(result));
  } catch {
    res.json(
      AiChunkTaskResponse.parse({
        subtasks: [
          { title: `Start: ${parsed.data.taskTitle}`, priority: "medium", estimatedMinutes: 15, tags: [] },
          { title: `Continue: ${parsed.data.taskTitle}`, priority: "medium", estimatedMinutes: 15, tags: [] },
          { title: `Finish: ${parsed.data.taskTitle}`, priority: "medium", estimatedMinutes: 15, tags: [] },
        ],
        reasoning: "Broken into start, continue, finish steps.",
      })
    );
  }
});

router.post("/ai/prioritize", async (req, res): Promise<void> => {
  const parsed = AiPrioritizeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const ctx = await getContext();

    const content = await callWithFallback([
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\nUser context:\n${ctx.preferences}\n\nPrioritize these tasks for someone with ADHD. Consider: urgency, energy required, quick wins for momentum. Return valid JSON only, no markdown.
Format: {"orderedTaskIds": [id1, id2, ...], "reasoning": "..."}`,
      },
      {
        role: "user",
        content: JSON.stringify(parsed.data.tasks),
      },
    ]);

    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(cleaned);
    res.json(AiPrioritizeResponse.parse(result));
  } catch {
    res.json(
      AiPrioritizeResponse.parse({
        orderedTaskIds: parsed.data.tasks.map((t: { id: number }) => t.id),
        reasoning: "Kept original order.",
      })
    );
  }
});

router.post("/ai/generate-plan", async (req, res): Promise<void> => {
  const parsed = AiGeneratePlanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const ctx = await getContext();

    let taskList: Array<{ id: number; title: string; priority: string; estimatedMinutes: number | null }> = [];
    if (parsed.data.taskIds && parsed.data.taskIds.length > 0) {
      const tasks = await db
        .select()
        .from(tasksTable)
        .where(inArray(tasksTable.id, parsed.data.taskIds));
      taskList = tasks.map((t) => ({ id: t.id, title: t.title, priority: t.priority, estimatedMinutes: t.estimatedMinutes }));
    } else {
      const todayTasks = await db.select().from(tasksTable);
      taskList = todayTasks
        .filter((t) => t.status === "today" || t.status === "inbox")
        .map((t) => ({ id: t.id, title: t.title, priority: t.priority, estimatedMinutes: t.estimatedMinutes }));
    }

    const useCouncil = req.query.council === "true";
    const prompt = `Date: ${parsed.data.date}\nTasks: ${JSON.stringify(taskList)}`;
    const systemContent = `${SYSTEM_PROMPT}\n\nUser context:\n${ctx.preferences}\n\nMemories:\n${ctx.memories}\n\nCreate a realistic, ADHD-friendly daily plan using these template blocks: top3, focusBlock, taskSection, reflection.
The plan should be achievable and include breaks. Return valid JSON only, no markdown.
Format: {"blocks": [{"type": "top3", "items": ["...", "...", "..."]}, {"type": "focusBlock", "title": "...", "startTime": "HH:MM", "duration": 90, "task": "..."}, {"type": "taskSection", "title": "Quick Wins", "tasks": ["..."]}, {"type": "reflection", "prompt": "..."}], "reasoning": "..."}`;

    let content: string;

    if (useCouncil) {
      const council = await synthesizeCouncil(prompt, systemContent, { maxModels: 6 });
      content = council.synthesis;
    } else {
      content = await callWithFallback([
        { role: "system", content: systemContent },
        { role: "user", content: prompt },
      ]);
    }

    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(cleaned);
    res.json(AiGeneratePlanResponse.parse(result));
  } catch {
    const parsed2 = AiGeneratePlanBody.parse(req.body);
    const todayTasks = await db.select().from(tasksTable);
    const taskList = todayTasks
      .filter((t) => t.status === "today" || t.status === "inbox")
      .map((t) => ({ id: t.id, title: t.title }));

    res.json(
      AiGeneratePlanResponse.parse({
        blocks: [
          { type: "top3", items: taskList.slice(0, 3).map((t) => t.title) },
          { type: "focusBlock", title: "Deep Work", startTime: "09:00", duration: 90, task: taskList[0]?.title || "Focus time" },
          { type: "taskSection", title: "Quick Wins", tasks: taskList.slice(3).map((t) => t.title) },
          { type: "reflection", prompt: "What's the ONE thing that would make today a win?" },
        ],
        reasoning: "Generated a balanced plan with top priorities, deep work, and quick wins.",
      })
    );
  }
});

export default router;

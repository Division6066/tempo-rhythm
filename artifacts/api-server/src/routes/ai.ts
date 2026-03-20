import { Router, type IRouter } from "express";
import { db, tasksTable, preferencesTable, memoriesTable, aiActionLogTable, calendarEventsTable, foldersTable, projectsTable, tagsTable } from "@workspace/db";
import { eq, inArray, desc } from "drizzle-orm";
import {
  AiChatBody,
  AiChatResponse,
  AiExtractTasksBody,
  AiExtractTasksResponse,
  AiChunkTaskBody,
  AiChunkTaskResponse,
  AiAutoCategorizeBody,
  AiAutoCategorizeResponse,
  AiPrioritizeBody,
  AiPrioritizeResponse,
  AiGeneratePlanBody,
  AiGeneratePlanResponse,
} from "@workspace/api-zod";
import { callWithFallback, callWithFallbackDetailed, synthesizeCouncil, getModelHealthStats } from "@workspace/integrations-openai-ai-server";
import type { AiCallResult, CouncilResult } from "@workspace/integrations-openai-ai-server";
import type { InsertAiActionLog } from "@workspace/db";

const router: IRouter = Router();

const COST_PER_1K_TOKENS: Record<string, { input: number; output: number }> = {
  "ministral-3": { input: 0.0001, output: 0.0003 },
  "magistral": { input: 0.0005, output: 0.0015 },
  "gpt-oss": { input: 0.0003, output: 0.001 },
  "deepseek-v3.1": { input: 0.00014, output: 0.00028 },
  "qwen3.5": { input: 0.0002, output: 0.0006 },
  "minimax-m2.5": { input: 0.0002, output: 0.0006 },
  "kimi-k2.5": { input: 0.0002, output: 0.0006 },
  "glm-5": { input: 0.0002, output: 0.0006 },
};

function estimateCost(model: string, inputTokens?: number, outputTokens?: number): number {
  const rates = COST_PER_1K_TOKENS[model] || { input: 0.0003, output: 0.001 };
  const inputCost = ((inputTokens || 0) / 1000) * rates.input;
  const outputCost = ((outputTokens || 0) / 1000) * rates.output;
  return Math.round((inputCost + outputCost) * 1000000) / 1000000;
}

async function logAiAction(action: string, result: AiCallResult | CouncilResult): Promise<void> {
  try {
    if ("synthesis" in result) {
      const totalInputTokens = result.responses.reduce((sum, r) => sum + (r.tokens || 0), 0);
      const totalCost = result.responses.reduce(
        (sum, r) => sum + estimateCost(r.model, r.tokens, 0),
        0
      );

      const entry: InsertAiActionLog = {
        action,
        model: result.synthesisModel,
        totalTokens: result.totalTokens || null,
        costUsd: totalCost || null,
        latencyMs: result.totalLatencyMs || null,
        status: "success",
        councilModels: result.responses.map(r => r.model).join(","),
        councilResponseCount: result.responses.length,
        metadata: { scores: result.responses.map(r => ({ model: r.model, score: r.score })) },
      };

      await db.insert(aiActionLogTable).values(entry);
    } else {
      const cost = estimateCost(result.model, result.inputTokens, result.outputTokens);

      const entry: InsertAiActionLog = {
        action,
        model: result.model,
        inputTokens: result.inputTokens || null,
        outputTokens: result.outputTokens || null,
        totalTokens: result.totalTokens || null,
        costUsd: cost || null,
        latencyMs: result.latencyMs || null,
        status: "success",
      };

      await db.insert(aiActionLogTable).values(entry);
    }
  } catch (err) {
    console.warn("Failed to log AI action:", err);
  }
}

async function logAiError(action: string, model: string, error: unknown): Promise<void> {
  try {
    const entry: InsertAiActionLog = {
      action,
      model,
      status: "error",
      error: error instanceof Error ? error.message : String(error),
    };
    await db.insert(aiActionLogTable).values(entry);
  } catch (err) {
    console.warn("Failed to log AI error:", err);
  }
}

async function getContext(): Promise<{ preferences: string; memories: string }> {
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
- Never invent commitments or deadlines the user didn't mention.
- Use markdown formatting: headers, bullet points, checklists, and visual chunking.
- Keep paragraphs short (2-3 sentences max).
- Use bold for key terms and italic for gentle emphasis.`;

router.post("/ai/chat", async (req, res): Promise<void> => {
  const parsed = AiChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const ctx = await getContext();
    const useCouncil = req.query.council === "true";

    let response: string;

    if (useCouncil) {
      const council = await synthesizeCouncil(
        parsed.data.message,
        `${SYSTEM_PROMPT}\n\nUser context:\n${ctx.preferences}\n\nMemories:\n${ctx.memories}`,
        { maxModels: 4, timeoutMs: 30000 }
      );
      response = council.synthesis;
      await logAiAction("chat:council", council);
    } else {
      const result = await callWithFallbackDetailed([
        {
          role: "system",
          content: `${SYSTEM_PROMPT}\n\nUser context:\n${ctx.preferences}\n\nMemories:\n${ctx.memories}`,
        },
        { role: "user", content: parsed.data.message },
      ]);
      response = result.content;
      await logAiAction("chat", result);
    }

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
    await logAiError("chat", "unknown", err);
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

    const result = await callWithFallbackDetailed([
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\nUser context:\n${ctx.preferences}\n\nExtract actionable tasks from the user's messy text. Return valid JSON only, no markdown.
Format: {"tasks": [{"title": "...", "priority": "high|medium|low", "estimatedMinutes": number|null, "tags": ["..."]}]}`,
      },
      { role: "user", content: parsed.data.text },
    ]);

    await logAiAction("extract-tasks", result);
    const cleaned = result.content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(cleaned);
    res.json(AiExtractTasksResponse.parse(data));
  } catch (err) {
    await logAiError("extract-tasks", "unknown", err);
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
    const result = await callWithFallbackDetailed([
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

    await logAiAction("chunk-task", result);
    const cleaned = result.content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(cleaned);
    res.json(AiChunkTaskResponse.parse(data));
  } catch (err) {
    await logAiError("chunk-task", "unknown", err);
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

router.post("/ai/auto-categorize", async (req, res): Promise<void> => {
  const parsed = AiAutoCategorizeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const folders = await db.select().from(foldersTable);
    const projects = await db.select().from(projectsTable);
    const tags = await db.select().from(tagsTable);
    const ctx = await getContext();

    const folderNames = folders.map(f => f.name);
    const projectNames = projects.map(p => p.name);
    const tagNames = tags.map(t => t.name);

    const result = await callWithFallbackDetailed([
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\nUser context:\n${ctx.preferences}\n\nMemories:\n${ctx.memories}\n\nSuggest categorization for this ${parsed.data.type}. Use existing folders/projects/tags when they fit, or suggest new ones if needed.

Available folders: ${folderNames.length ? folderNames.join(", ") : "none yet"}
Available projects: ${projectNames.length ? projectNames.join(", ") : "none yet"}
Available tags: ${tagNames.length ? tagNames.join(", ") : "none yet"}

Return valid JSON only, no markdown.
Format: {"folder": "folder name or null", "project": "project name or null", "tags": ["tag1", "tag2"], "confidence": 0-100}`,
      },
      {
        role: "user",
        content: `Title: ${parsed.data.title}\nContent: ${parsed.data.content}\nType: ${parsed.data.type}`,
      },
    ]);

    await logAiAction("auto-categorize", result);
    const cleaned = result.content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(cleaned);
    res.json(AiAutoCategorizeResponse.parse(data));
  } catch (err) {
    await logAiError("auto-categorize", "unknown", err);
    res.json(
      AiAutoCategorizeResponse.parse({
        folder: null,
        project: null,
        tags: [],
        confidence: 0,
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

    const result = await callWithFallbackDetailed([
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\nUser context:\n${ctx.preferences}\n\nPrioritize these tasks for someone with ADHD. Consider: urgency, energy required, quick wins for momentum. Return valid JSON only, no markdown.
Format: {"orderedTaskIds": [id1, id2, ...], "scores": [{"taskId": id, "score": 0-100, "reason": "brief reason"}], "reasoning": "overall reasoning"}`,
      },
      {
        role: "user",
        content: JSON.stringify(parsed.data.tasks),
      },
    ]);

    await logAiAction("prioritize", result);
    const cleaned = result.content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(cleaned);
    res.json(AiPrioritizeResponse.parse(data));
  } catch (err) {
    await logAiError("prioritize", "unknown", err);
    res.json(
      AiPrioritizeResponse.parse({
        orderedTaskIds: parsed.data.tasks.map((t: { id: number }) => t.id),
        scores: parsed.data.tasks.map((t: { id: number }) => ({ taskId: t.id, score: 50, reason: "Default score" })),
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

    const allTasks = await db.select().from(tasksTable);
    const inboxAndTodayTasks = allTasks
      .filter((t) => t.status === "today" || t.status === "inbox")
      .map((t) => ({ id: t.id, title: t.title, priority: t.priority, estimatedMinutes: t.estimatedMinutes, status: t.status }));

    let taskList: Array<{ id: number; title: string; priority: string; estimatedMinutes: number | null; status: string }>;
    if (parsed.data.taskIds && parsed.data.taskIds.length > 0) {
      const requestedTasks = allTasks
        .filter((t) => parsed.data.taskIds!.includes(t.id))
        .map((t) => ({ id: t.id, title: t.title, priority: t.priority, estimatedMinutes: t.estimatedMinutes, status: t.status }));
      const requestedIds = new Set(parsed.data.taskIds);
      const additionalInbox = inboxAndTodayTasks.filter((t) => !requestedIds.has(t.id));
      taskList = [...requestedTasks, ...additionalInbox];
    } else {
      taskList = inboxAndTodayTasks;
    }

    const overdueTasks = allTasks
      .filter((t) => t.status !== "done" && t.dueDate && t.dueDate < parsed.data.date)
      .map((t) => ({ id: t.id, title: t.title, priority: t.priority, dueDate: t.dueDate }));

    const todayEvents = (await db.select().from(calendarEventsTable))
      .filter((e) => e.date === parsed.data.date)
      .map((e) => ({ title: e.title, startTime: e.startTime, endTime: e.endTime, duration: e.duration }));

    const energyLevel = parsed.data.energyLevel || "medium";
    const userContext = parsed.data.context || "";

    const warmMemories = (await db.select().from(memoriesTable))
      .filter((m) => m.tier === "warm")
      .map((m) => m.content)
      .join("\n");

    const useCouncil = req.query.council === "true";
    const prompt = `Date: ${parsed.data.date}\nEnergy Level: ${energyLevel}\n${userContext ? `User Context: ${userContext}\n` : ""}Tasks: ${JSON.stringify(taskList)}\nOverdue Tasks: ${JSON.stringify(overdueTasks)}\nToday's Events: ${JSON.stringify(todayEvents)}`;
    const systemContent = `${SYSTEM_PROMPT}\n\nUser context:\n${ctx.preferences}\n\nWarm Memories (prioritized):\n${warmMemories || "None"}\n\nAll Memories:\n${ctx.memories}\n\nCreate a realistic, ADHD-friendly daily plan using these template blocks: top3, focusBlock, taskSection, reflection.
The plan should be achievable and include breaks. Consider the user's energy level (${energyLevel}) when scheduling — place demanding tasks during high energy, easier tasks during low energy.
Each block MUST include a "rationale" field explaining why it was scheduled at that position (e.g. "Scheduled first because it's due today and your energy is high").
Return valid JSON only, no markdown.
Format: {"blocks": [{"type": "top3", "items": ["...", "...", "..."], "rationale": "..."}, {"type": "focusBlock", "title": "...", "startTime": "HH:MM", "duration": 90, "task": "...", "rationale": "..."}, {"type": "taskSection", "title": "Quick Wins", "tasks": ["..."], "rationale": "..."}, {"type": "reflection", "prompt": "...", "rationale": "..."}], "reasoning": "..."}`;

    let content: string;

    if (useCouncil) {
      const council = await synthesizeCouncil(prompt, systemContent, { maxModels: 6, timeoutMs: 45000 });
      content = council.synthesis;
      await logAiAction("generate-plan:council", council);
    } else {
      const result = await callWithFallbackDetailed([
        { role: "system", content: systemContent },
        { role: "user", content: prompt },
      ]);
      content = result.content;
      await logAiAction("generate-plan", result);
    }

    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(cleaned);
    res.json(AiGeneratePlanResponse.parse(data));
  } catch (err) {
    await logAiError("generate-plan", "unknown", err);
    const todayTasks = await db.select().from(tasksTable);
    const taskList = todayTasks
      .filter((t) => t.status === "today" || t.status === "inbox")
      .map((t) => ({ id: t.id, title: t.title }));

    res.json(
      AiGeneratePlanResponse.parse({
        blocks: [
          { type: "top3", items: taskList.slice(0, 3).map((t) => t.title), rationale: "Your top priorities for today" },
          { type: "focusBlock", title: "Deep Work", startTime: "09:00", duration: 90, task: taskList[0]?.title || "Focus time", rationale: "Morning deep work when focus is typically best" },
          { type: "taskSection", title: "Quick Wins", tasks: taskList.slice(3).map((t) => t.title), rationale: "Quick wins to build momentum" },
          { type: "reflection", prompt: "What's the ONE thing that would make today a win?", rationale: "End-of-day reflection helps with closure" },
        ],
        reasoning: "Generated a balanced plan with top priorities, deep work, and quick wins.",
      })
    );
  }
});

router.get("/ai/action-log", async (req, res): Promise<void> => {
  const limit = parseInt(req.query.limit as string) || 50;
  const logs = await db.select().from(aiActionLogTable).orderBy(desc(aiActionLogTable.createdAt)).limit(limit);
  res.json(logs);
});

router.get("/ai/model-health", async (_req, res): Promise<void> => {
  res.json(getModelHealthStats());
});

export default router;

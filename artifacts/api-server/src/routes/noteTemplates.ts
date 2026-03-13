import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, noteTemplatesTable } from "@workspace/db";
import {
  CreateNoteTemplateBody,
  DeleteNoteTemplateParams,
} from "@workspace/api-zod";

const BUILT_IN_TEMPLATES = [
  {
    name: "Daily Journal",
    description: "A daily reflection and planning template",
    content: "# Daily Journal - {{date}}\n\n## Gratitude\n- \n\n## Top 3 Priorities\n1. \n2. \n3. \n\n## Notes\n\n\n## End of Day Reflection\n- What went well?\n- What could improve?",
    category: "daily",
    isBuiltIn: true,
  },
  {
    name: "Meeting Notes",
    description: "Structured meeting notes template",
    content: "# Meeting Notes - {{date}}\n\n**Attendees:**\n- \n\n**Agenda:**\n1. \n\n**Discussion:**\n\n\n**Action Items:**\n- [ ] \n\n**Next Steps:**\n",
    category: "work",
    isBuiltIn: true,
  },
  {
    name: "Weekly Review",
    description: "Weekly review and planning template",
    content: "# Weekly Review - {{date}}\n\n## Wins This Week\n- \n\n## Challenges\n- \n\n## Lessons Learned\n- \n\n## Next Week Focus\n1. \n2. \n3. \n\n## Notes\n",
    category: "weekly",
    isBuiltIn: true,
  },
  {
    name: "Project Brief",
    description: "Project planning and brief template",
    content: "# Project: {{title}}\n\n## Objective\n\n\n## Key Results\n1. \n2. \n3. \n\n## Timeline\n- Start: \n- End: \n\n## Resources\n- \n\n## Risks\n- \n\n## Notes\n",
    category: "project",
    isBuiltIn: true,
  },
  {
    name: "Brain Dump",
    description: "Unload everything on your mind",
    content: "# Brain Dump - {{date}}\n\nJust write. Don't filter. Get it all out.\n\n---\n\n\n\n---\n\n## After dumping, sort into:\n\n### Tasks to add\n- \n\n### Things to let go\n- \n\n### Ideas to explore later\n- ",
    category: "daily",
    isBuiltIn: true,
  },
  {
    name: "Study Session",
    description: "Active recall and study notes",
    content: "# Study Session - {{date}}\n\n**Subject:**\n\n**Goal for this session:**\n\n## Key Concepts\n1. \n2. \n3. \n\n## Questions\n- \n\n## Summary (in my own words)\n\n\n## What to review next time\n- ",
    category: "study",
    isBuiltIn: true,
  },
  {
    name: "Daily Plan",
    description: "Plan your day with time blocks",
    content: "# Daily Plan - {{date}}\n\n## Energy Level: \n\n## Morning Block\n- [ ] \n- [ ] \n\n## Afternoon Block\n- [ ] \n- [ ] \n\n## Evening Block\n- [ ] \n\n## Non-negotiables\n- \n\n## If I only do ONE thing today:\n- ",
    category: "daily",
    isBuiltIn: true,
  },
  {
    name: "Habit Tracker",
    description: "Track daily habits and streaks",
    content: "# Habit Tracker - {{date}}\n\n| Habit | Mon | Tue | Wed | Thu | Fri | Sat | Sun |\n|-------|-----|-----|-----|-----|-----|-----|-----|\n| Exercise |  |  |  |  |  |  |  |\n| Reading |  |  |  |  |  |  |  |\n| Meditation |  |  |  |  |  |  |  |\n| Water |  |  |  |  |  |  |  |\n\n## Notes\n",
    category: "weekly",
    isBuiltIn: true,
  },
  {
    name: "Decision Matrix",
    description: "Weigh options when making a decision",
    content: "# Decision: {{title}}\n\n## Context\nWhat am I deciding?\n\n## Options\n\n### Option A:\n- Pros:\n- Cons:\n- Gut feeling:\n\n### Option B:\n- Pros:\n- Cons:\n- Gut feeling:\n\n## What matters most?\n1. \n2. \n3. \n\n## Decision:\n\n## Why:\n",
    category: "personal",
    isBuiltIn: true,
  },
  {
    name: "Retrospective",
    description: "Reflect on a completed project or sprint",
    content: "# Retrospective - {{date}}\n\n## What went well\n- \n\n## What didn't go well\n- \n\n## What surprised me\n- \n\n## What I'd do differently\n- \n\n## Key takeaway\n\n\n## Action items for next time\n- [ ] \n- [ ] ",
    category: "project",
    isBuiltIn: true,
  },
];

const router: IRouter = Router();

router.get("/note-templates", async (_req, res): Promise<void> => {
  const templates = await db.select().from(noteTemplatesTable).orderBy(noteTemplatesTable.createdAt);
  res.json(templates);
});

router.post("/note-templates", async (req, res): Promise<void> => {
  const parsed = CreateNoteTemplateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [template] = await db.insert(noteTemplatesTable).values(parsed.data).returning();
  res.status(201).json(template);
});

router.delete("/note-templates/:id", async (req, res): Promise<void> => {
  const params = DeleteNoteTemplateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [template] = await db.delete(noteTemplatesTable).where(eq(noteTemplatesTable.id, params.data.id)).returning();
  if (!template) {
    res.status(404).json({ error: "Template not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/note-templates/seed", async (_req, res): Promise<void> => {
  const existing = await db.select().from(noteTemplatesTable);
  const existingNames = new Set(existing.map((t) => t.name));

  let count = 0;
  for (const tmpl of BUILT_IN_TEMPLATES) {
    if (!existingNames.has(tmpl.name)) {
      await db.insert(noteTemplatesTable).values(tmpl);
      count++;
    }
  }

  res.json({ count });
});

export default router;

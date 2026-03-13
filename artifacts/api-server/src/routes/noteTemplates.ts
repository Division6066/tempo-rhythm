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
  const builtInExists = existing.some((t) => t.isBuiltIn);

  if (builtInExists) {
    res.json({ count: 0 });
    return;
  }

  for (const tmpl of BUILT_IN_TEMPLATES) {
    await db.insert(noteTemplatesTable).values(tmpl);
  }

  res.json({ count: BUILT_IN_TEMPLATES.length });
});

export default router;

import { Router, type IRouter } from "express";
import { db, tasksTable, notesTable, memoriesTable } from "@workspace/db";

const router: IRouter = Router();

interface ImportTask {
  title: string;
  priority?: string;
  status?: string;
  notes?: string;
  tags?: string[];
  estimatedMinutes?: number;
  energyLevel?: string;
}

interface ImportNote {
  title: string;
  content?: string;
  tags?: string[];
}

const VALID_TIERS = ["hot", "warm", "cold"] as const;
type ValidTier = typeof VALID_TIERS[number];

function normalizeTier(tier?: string): ValidTier {
  if (!tier) return "warm";
  const lower = tier.toLowerCase();
  if (VALID_TIERS.includes(lower as ValidTier)) return lower as ValidTier;
  if (lower === "core" || lower === "long" || lower === "permanent") return "hot";
  if (lower === "short" || lower === "temporary" || lower === "ephemeral") return "cold";
  return "warm";
}

interface ImportMemory {
  content: string;
  tier?: string;
  decay?: number;
}

interface LorePack {
  name?: string;
  description?: string;
  tasks?: ImportTask[];
  notes?: ImportNote[];
  memories?: ImportMemory[];
}

function parseMarkdownToLorePack(markdown: string): LorePack {
  const pack: LorePack = { tasks: [], notes: [], memories: [] };
  let currentSection: "tasks" | "notes" | "memories" | null = null;
  let currentNote: { title: string; content: string } | null = null;

  const lines = markdown.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^#+\s*tasks/i.test(trimmed)) {
      if (currentNote) { pack.notes!.push(currentNote); currentNote = null; }
      currentSection = "tasks";
      continue;
    }
    if (/^#+\s*notes/i.test(trimmed)) {
      if (currentNote) { pack.notes!.push(currentNote); currentNote = null; }
      currentSection = "notes";
      continue;
    }
    if (/^#+\s*memories/i.test(trimmed)) {
      if (currentNote) { pack.notes!.push(currentNote); currentNote = null; }
      currentSection = "memories";
      continue;
    }

    if (currentSection === "tasks") {
      const taskMatch = trimmed.match(/^[-*]\s+(.+)/);
      if (taskMatch) {
        const title = taskMatch[1].replace(/\[.*?\]/g, "").trim();
        const priorityMatch = taskMatch[1].match(/\[(high|medium|low)\]/i);
        pack.tasks!.push({
          title,
          priority: priorityMatch ? priorityMatch[1].toLowerCase() : "medium",
          status: "inbox",
        });
      }
    } else if (currentSection === "notes") {
      const noteHeaderMatch = trimmed.match(/^##\s+(.+)/);
      if (noteHeaderMatch) {
        if (currentNote) pack.notes!.push(currentNote);
        currentNote = { title: noteHeaderMatch[1], content: "" };
      } else if (currentNote && trimmed) {
        currentNote.content += (currentNote.content ? "\n" : "") + trimmed;
      } else if (!currentNote && trimmed.match(/^[-*]\s+(.+)/)) {
        const m = trimmed.match(/^[-*]\s+(.+)/)!;
        pack.notes!.push({ title: m[1], content: "" });
      }
    } else if (currentSection === "memories") {
      const memMatch = trimmed.match(/^[-*]\s+(.+)/);
      if (memMatch) {
        pack.memories!.push({ content: memMatch[1], tier: "hot" });
      }
    }
  }

  if (currentNote) pack.notes!.push(currentNote);
  return pack;
}

function parseCsvToLorePack(csv: string, type: "tasks" | "notes"): LorePack {
  const lines = csv.split("\n").filter(l => l.trim());
  if (lines.length < 2) return { tasks: [], notes: [] };

  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
  const rows = lines.slice(1);

  const pack: LorePack = { tasks: [], notes: [], memories: [] };

  for (const row of rows) {
    const values = row.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ""; });

    if (type === "tasks") {
      pack.tasks!.push({
        title: obj.title || obj.name || values[0],
        priority: obj.priority || "medium",
        status: obj.status || "inbox",
        notes: obj.notes || obj.description || "",
        estimatedMinutes: obj.estimate ? parseInt(obj.estimate) : undefined,
      });
    } else {
      pack.notes!.push({
        title: obj.title || obj.name || values[0],
        content: obj.content || obj.body || obj.description || "",
      });
    }
  }

  return pack;
}

router.post("/import", async (req, res): Promise<void> => {
  try {
    const { format, data, type } = req.body as {
      format: "json" | "markdown" | "csv";
      data: string;
      type?: "tasks" | "notes";
    };

    if (!format || !data) {
      res.status(400).json({ error: "Missing format or data" });
      return;
    }

    let pack: LorePack;

    switch (format) {
      case "json":
        try {
          pack = JSON.parse(data) as LorePack;
        } catch {
          res.status(400).json({ error: "Invalid JSON" });
          return;
        }
        break;
      case "markdown":
        pack = parseMarkdownToLorePack(data);
        break;
      case "csv":
        pack = parseCsvToLorePack(data, type || "tasks");
        break;
      default:
        res.status(400).json({ error: "Unsupported format. Use json, markdown, or csv." });
        return;
    }

    const results = { tasks: 0, notes: 0, memories: 0 };

    if (pack.tasks && pack.tasks.length > 0) {
      const taskValues = pack.tasks.map(t => ({
        title: t.title.slice(0, 500),
        priority: (t.priority || "medium") as "high" | "medium" | "low",
        status: (t.status || "inbox") as "inbox" | "today" | "upcoming" | "someday" | "done",
        notes: t.notes || null,
        tags: t.tags || [],
        estimatedMinutes: t.estimatedMinutes || null,
        energyLevel: t.energyLevel || null,
      }));
      await db.insert(tasksTable).values(taskValues);
      results.tasks = taskValues.length;
    }

    if (pack.notes && pack.notes.length > 0) {
      const noteValues = pack.notes.map(n => ({
        title: n.title.slice(0, 500),
        content: n.content || "",
        tags: n.tags || [],
      }));
      await db.insert(notesTable).values(noteValues);
      results.notes = noteValues.length;
    }

    if (pack.memories && pack.memories.length > 0) {
      const memValues = pack.memories.map(m => ({
        content: m.content,
        tier: normalizeTier(m.tier),
        decay: m.decay ?? 100,
      }));
      await db.insert(memoriesTable).values(memValues);
      results.memories = memValues.length;
    }

    res.json({
      message: "Import successful",
      imported: results,
      total: results.tasks + results.notes + results.memories,
    });
  } catch (err) {
    console.error("Import error:", err);
    res.status(500).json({ error: "Import failed" });
  }
});

router.get("/import/template", async (req, res): Promise<void> => {
  const format = (req.query.format as string) || "json";

  if (format === "json") {
    res.json({
      name: "My Lore Pack",
      description: "Import tasks, notes, and memories into Tempo",
      tasks: [
        { title: "Example task", priority: "high", status: "inbox", notes: "Details here", tags: ["work"] }
      ],
      notes: [
        { title: "Example note", content: "Note content here", tags: ["ideas"] }
      ],
      memories: [
        { content: "User prefers morning focus blocks", tier: "hot" }
      ]
    });
  } else if (format === "markdown") {
    res.type("text/markdown").send(`# Tasks
- Buy groceries [high]
- Review project proposal [medium]
- Call dentist [low]

# Notes
## Project Ideas
Some project ideas to explore later.

## Meeting Notes
Notes from today's meeting.

# Memories
- Prefers working in 25-minute blocks
- Most productive in the morning
`);
  } else {
    res.type("text/csv").send(`title,priority,status,notes,estimate
"Buy groceries",high,inbox,"Milk, eggs, bread",30
"Review proposal",medium,inbox,"Q2 budget review",60
`);
  }
});

export default router;

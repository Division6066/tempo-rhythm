/** NotePlan-style markdown tokens: tasks, #tags, @time, @people, [[wiki]], !!, >date. */

export type Energy = "low" | "medium" | "high";
export type TaskStatus = "open" | "done" | "scheduled" | "cancelled";

export type ParsedTask = {
  lineIndex: number;
  raw: string;
  indent: number;
  done: boolean;
  status: TaskStatus;
  title: string;
  time?: string;
  startMin?: number;
  endMin?: number;
  tags: string[];
  wiki: string[];
  people: string[];
  energy?: Energy;
  priority: 0 | 1 | 2 | 3;
  scheduled?: string;
  remind?: string;
  repeat?: string;
};

export type IndexedTask = ParsedTask & {
  day: string;
  kind: "daily" | "weekly" | "monthly";
};

const TIME_RE = /(?:@|at\s)?(\d{1,2}:\d{2})(?:\s*[-–]\s*(\d{1,2}:\d{2}))?/i;
const TAG_RE = /#([A-Za-z][\w-]*)/g;
const WIKI_RE = /\[\[([^\]]+)\]\]/g;
const PEOPLE_RE = /@([A-Za-z][\w.-]*)/g;
const ENERGY_RE = /\b(low|medium|high)\s*energy\b|\benergy:(low|medium|high)\b/i;
const SCHEDULED_RE = />(today|tomorrow|\d{4}-\d{2}-\d{2})/i;
const REPEAT_RE = /@repeat\((daily|weekly|monthly)\)/i;
const REMIND_RE = /@remind(?:\(([^)]+)\))?/i;
const PRIORITY_RE = /(?:^|\s)(!{1,3})(?=\s|$)/;
const TASK_RE = /^(\s*)[-*]\s+\[([ xX>\-])\]\s+(.*)$/;

const MARKER: Record<string, TaskStatus> = {
  " ": "open",
  x: "done",
  X: "done",
  ">": "scheduled",
  "-": "cancelled",
};

export function minutesFromClock(clock: string): number {
  const [h, m] = clock.split(":").map(Number);
  return (h % 24) * 60 + (m % 60);
}

export function clockFromMinutes(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function extractTags(text: string): string[] {
  return [...text.matchAll(TAG_RE)].map((m) => m[1].toLowerCase());
}

export function extractWiki(text: string): string[] {
  return [...text.matchAll(WIKI_RE)].map((m) => m[1].trim());
}

export function shiftIsoDay(day: string, delta: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, (d ?? 1) + delta);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

export function resolveScheduled(token: string, today: string): string {
  const t = token.toLowerCase();
  if (t === "today") return today;
  if (t === "tomorrow") return shiftIsoDay(today, 1);
  return token;
}

export function parseTaskLine(line: string, lineIndex = 0, today = ""): ParsedTask | null {
  const m = line.match(TASK_RE);
  if (!m) return null;
  const body = m[3];
  const timeMatch = body.match(TIME_RE);
  const energyMatch = body.match(ENERGY_RE);
  const scheduledMatch = body.match(SCHEDULED_RE);
  const repeatMatch = body.match(REPEAT_RE);
  const remindMatch = body.match(REMIND_RE);
  const priorityMatch = body.match(PRIORITY_RE);
  let startMin: number | undefined;
  let endMin: number | undefined;
  if (timeMatch) {
    startMin = minutesFromClock(timeMatch[1]);
    endMin = timeMatch[2] ? minutesFromClock(timeMatch[2]) : startMin + 30;
  }
  const status = MARKER[m[2]] ?? "open";
  const title = body
    .replace(TIME_RE, "")
    .replace(TAG_RE, "")
    .replace(PEOPLE_RE, "")
    .replace(ENERGY_RE, "")
    .replace(SCHEDULED_RE, "")
    .replace(REPEAT_RE, "")
    .replace(REMIND_RE, "")
    .replace(PRIORITY_RE, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  const people = [...body.matchAll(PEOPLE_RE)].map((p) => p[1]).filter((p) => !/^\d/.test(p) && p.toLowerCase() !== "repeat" && p.toLowerCase() !== "remind");
  return {
    lineIndex,
    raw: line,
    indent: m[1].length,
    done: status === "done",
    status,
    title: title || body.trim(),
    time: timeMatch ? (timeMatch[2] ? `${timeMatch[1]}–${timeMatch[2]}` : timeMatch[1]) : undefined,
    startMin,
    endMin,
    tags: extractTags(body),
    wiki: extractWiki(body),
    people,
    energy: (energyMatch?.[1] ?? energyMatch?.[2])?.toLowerCase() as Energy | undefined,
    priority: (priorityMatch?.[1].length ?? 0) as 0 | 1 | 2 | 3,
    scheduled: scheduledMatch ? resolveScheduled(scheduledMatch[1], today) : undefined,
    remind: remindMatch ? (remindMatch[1] ?? "inbox") : undefined,
    repeat: repeatMatch?.[1]?.toLowerCase(),
  };
}

export function parseTasks(source: string, today = ""): ParsedTask[] {
  return source
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line, i) => parseTaskLine(line, i, today))
    .filter((t): t is ParsedTask => Boolean(t));
}

export function setTaskTime(source: string, lineIndex: number, startMin: number, duration = 30): string {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const line = lines[lineIndex];
  if (!line) return source;
  const clock = `@${clockFromMinutes(startMin)}`;
  const stripped = line.replace(/\s@(?:\d{1,2}:\d{2})(?:\s*[-–]\s*\d{1,2}:\d{2})?/g, "");
  lines[lineIndex] = `${stripped.trimEnd()} ${clock}`;
  return lines.join("\n");
}

export function appendTimedTask(source: string, title: string, startMin: number): string {
  const line = `* [ ] ${title.trim()} @${clockFromMinutes(startMin)}`;
  const trimmed = source.replace(/\s+$/, "");
  return `${trimmed}\n${line}\n`;
}

export function markTaskMoved(source: string, lineIndex: number): string {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const line = lines[lineIndex];
  if (!line) return source;
  lines[lineIndex] = line.replace(/\[[ ]\]/, "[>]");
  return lines.join("\n");
}

export function appendCarriedTasks(target: string, tasks: ParsedTask[], ontoDay: string): string {
  if (!tasks.length) return target;
  const extra = tasks
    .map((t) => {
      const bits = [`* [ ] ${t.title}`];
      if (t.priority) bits[0] = `* [ ] ${"!".repeat(t.priority)} ${t.title}`;
      if (t.time) bits.push(`@${t.time.split("–")[0]}`);
      for (const tag of t.tags) bits.push(`#${tag}`);
      bits.push(`>${ontoDay}`);
      return bits.join(" ");
    })
    .join("\n");
  const trimmed = target.replace(/\s+$/, "");
  if (/## Carried/i.test(trimmed)) return `${trimmed}\n${extra}\n`;
  return `${trimmed}\n\n## Carried\n${extra}\n`;
}

export function indexDailyTasks(dailyNotes: Record<string, string>, today = ""): IndexedTask[] {
  const out: IndexedTask[] = [];
  for (const [day, body] of Object.entries(dailyNotes)) {
    for (const t of parseTasks(body, today)) out.push({ ...t, day, kind: "daily" });
  }
  return out.sort((a, b) => a.day.localeCompare(b.day) || b.priority - a.priority);
}

export function backlinksTo(
  title: string,
  corpus: { id: string; title: string; body: string }[],
): { id: string; title: string }[] {
  const needle = title.trim().toLowerCase();
  return corpus
    .filter((doc) => extractWiki(doc.body).some((w) => w.toLowerCase() === needle) && doc.title.toLowerCase() !== needle)
    .map((d) => ({ id: d.id, title: d.title }));
}

export function allTags(corpus: { body: string }[]): string[] {
  const set = new Set<string>();
  for (const doc of corpus) for (const t of extractTags(doc.body)) set.add(t);
  return [...set].sort();
}

export function searchDocs(
  query: string,
  corpus: { id: string; title: string; body: string; kind?: string }[],
): typeof corpus {
  const q = query.trim().toLowerCase();
  if (!q) return corpus;
  return corpus.filter((doc) => {
    const hay = `${doc.title}\n${doc.body}\n${doc.kind ?? ""}`.toLowerCase();
    return hay.includes(q) || extractTags(doc.body).includes(q.replace(/^#/, ""));
  });
}

export function isoWeekKey(ms = Date.now()): string {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const week = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function monthKey(ms = Date.now()): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function yearKey(ms = Date.now()): string {
  return String(new Date(ms).getFullYear());
}

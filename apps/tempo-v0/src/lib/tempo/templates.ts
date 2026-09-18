/**
 * Tempo templates are JSON first — slash commands insert the markdown field.
 * The Templates screen renders both the markdown and the source JSON.
 */

export type TemplateBlock = {
  type: "h1" | "h2" | "p" | "task" | "quote" | "prompt" | "time";
  text: string;
};

export type TempoTemplate = {
  id: string;
  title: string;
  slash: string;
  kicker: string;
  cadence: "daily" | "weekly" | "monthly" | "yearly" | "anytime";
  description: string;
  tags: string[];
  adhd: string;
  blocks: TemplateBlock[];
  markdown: string;
};

function md(blocks: TemplateBlock[]): string {
  return blocks
    .map((b) => {
      if (b.type === "h1") return `# ${b.text}`;
      if (b.type === "h2") return `\n## ${b.text}`;
      if (b.type === "task") return `* [ ] ${b.text}`;
      if (b.type === "quote") return `> ${b.text}`;
      if (b.type === "time") return `* [ ] ${b.text}`;
      if (b.type === "prompt") return `> ${b.text}\n\n`;
      return b.text;
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimStart();
}

const DEFS: Omit<TempoTemplate, "markdown">[] = [
  {
    id: "daily-note",
    title: "Daily note",
    slash: "/daily",
    kicker: "Every morning · 4 min",
    cadence: "daily",
    description: "Intentions, three doable tasks, a place for the dump. The NotePlan-shaped day.",
    tags: ["daily", "tasks"],
    adhd: "Three tasks, not twelve. Park the rest.",
    blocks: [
      { type: "h1", text: "{{weekday}} · {{date}}" },
      { type: "h2", text: "Intentions" },
      { type: "p", text: "One honest paragraph. Protect the afternoon." },
      { type: "h2", text: "Tasks" },
      { type: "time", text: "Smallest next step @09:30 #focus" },
      { type: "time", text: "Ten-minute walk @12:30 #body" },
      { type: "time", text: "Shutdown: park tomorrow @16:30" },
      { type: "h2", text: "Notes" },
      { type: "p", text: "Dump anything that doesn't belong in a checkbox. Link it later with [[ ]]." },
    ],
  },
  {
    id: "weekly-review",
    title: "Weekly review",
    slash: "/weekly",
    kicker: "Friday · 15 min",
    cadence: "weekly",
    description: "Nine gentle questions that turn the week into a plan for the next one.",
    tags: ["weekly", "review"],
    adhd: "No score. What happened, what's next.",
    blocks: [
      { type: "h1", text: "Week {{week}}" },
      { type: "h2", text: "What actually happened" },
      { type: "p", text: "Three things that got done. One that didn't — that's allowed." },
      { type: "h2", text: "Energy" },
      { type: "p", text: "High-spoon days: \nLow-spoon days:" },
      { type: "h2", text: "Waiting on" },
      { type: "task", text: "#waiting " },
      { type: "h2", text: "Next week, small" },
      { type: "task", text: "" },
      { type: "task", text: "" },
      { type: "task", text: "" },
      { type: "quote", text: "You missed a day. That's allowed. Small step Monday?" },
    ],
  },
  {
    id: "morning-pages",
    title: "Morning pages",
    slash: "/pages",
    kicker: "Daily · 10 min",
    cadence: "daily",
    description: "Three long-form pages before the inbox. No prompts. Just the cursor.",
    tags: ["journal", "daily"],
    adhd: "Timer optional. Stop when the page feels empty.",
    blocks: [
      { type: "h1", text: "Morning pages · {{date}}" },
      { type: "prompt", text: "Don't organize it. Type." },
      { type: "p", text: "" },
    ],
  },
  {
    id: "builder-shutdown",
    title: "Builder shutdown",
    slash: "/shutdown",
    kicker: "End of workday · 8 min",
    cadence: "daily",
    description: "Close the loops. Park the next thread. Put the laptop down with a clean room.",
    tags: ["work", "daily"],
    adhd: "One parked thread is enough. The rest can wait.",
    blocks: [
      { type: "h1", text: "Shutdown · {{date}}" },
      { type: "h2", text: "Shipped" },
      { type: "p", text: "" },
      { type: "h2", text: "Parked for tomorrow" },
      { type: "task", text: "First thing, written as a sentence @09:30" },
      { type: "h2", text: "Open loops I'm allowed to drop" },
      { type: "p", text: "" },
      { type: "quote", text: "The day ends well when the laptop closes." },
    ],
  },
  {
    id: "sunday-reset",
    title: "Sunday reset",
    slash: "/sunday",
    kicker: "Weekly · 20 min",
    cadence: "weekly",
    description: "Recap, clear, re-aim. The most-forked shape in the library.",
    tags: ["weekly", "home"],
    adhd: "If 20 minutes is too much, do Recap and stop.",
    blocks: [
      { type: "h1", text: "Sunday reset" },
      { type: "h2", text: "Recap" },
      { type: "p", text: "What the week actually was, not what the plan said." },
      { type: "h2", text: "Clear" },
      { type: "task", text: "Inbox to zero-ish #admin" },
      { type: "task", text: "One surface of the desk" },
      { type: "h2", text: "Re-aim" },
      { type: "task", text: "Three things for Monday" },
    ],
  },
  {
    id: "study-session",
    title: "Study session",
    slash: "/study",
    kicker: "Anytime · 12 min",
    cadence: "anytime",
    description: "A short, shame-free study block. Cards, one question, a park.",
    tags: ["study", "adhd"],
    adhd: "Twelve minutes. Then you're allowed to stop.",
    blocks: [
      { type: "h1", text: "Study · {{date}}" },
      { type: "h2", text: "Source" },
      { type: "p", text: "[[ ]]  — what are we actually studying?" },
      { type: "h2", text: "Five cards" },
      { type: "p", text: "Flip them in Study. Rate honestly. The hard ones come back." },
      { type: "h2", text: "One question I still can't answer" },
      { type: "p", text: "" },
      { type: "quote", text: "Stopping on time is the point." },
    ],
  },
  {
    id: "lecture-capture",
    title: "Lecture capture",
    slash: "/lecture",
    kicker: "In class · listen first",
    cadence: "anytime",
    description: "Don't write. Listen. After class, enhance into headers, terms, and cards.",
    tags: ["study", "lecture"],
    adhd: "Capture messy. Sort later with Coach.",
    blocks: [
      { type: "h1", text: "Lecture · {{date}}" },
      { type: "h2", text: "Raw" },
      { type: "p", text: "" },
      { type: "h2", text: "Terms I heard" },
      { type: "p", text: "- " },
      { type: "h2", text: "Questions" },
      { type: "p", text: "- " },
    ],
  },
  {
    id: "map-card",
    title: "Map card",
    slash: "/card",
    kicker: "Whiteboard · 1 idea",
    cadence: "anytime",
    description: "One idea, one card. Drop it on the map. Link it when it earns a friend.",
    tags: ["map", "heptabase"],
    adhd: "One idea per card. Don't nest.",
    blocks: [
      { type: "h1", text: "Untitled card" },
      { type: "p", text: "One thought. Link with [[ ]] when a second card exists." },
    ],
  },
  {
    id: "monthly-aim",
    title: "Monthly aim",
    slash: "/month",
    kicker: "First Monday · 10 min",
    cadence: "monthly",
    description: "One aim for the month. Everything else is optional weather.",
    tags: ["monthly", "review"],
    adhd: "One sentence is a complete monthly note.",
    blocks: [
      { type: "h1", text: "{{date}}" },
      { type: "h2", text: "One aim" },
      { type: "p", text: "" },
      { type: "h2", text: "What I'm allowed to drop" },
      { type: "p", text: "" },
      { type: "quote", text: "The month is a container, not a test." },
    ],
  },
  {
    id: "yearly-aim",
    title: "Yearly note",
    slash: "/year",
    kicker: "January · 12 min",
    cadence: "yearly",
    description: "One zoom level above the month. Close enough to break into quarters, far enough to stay out of the day.",
    tags: ["yearly", "review"],
    adhd: "One sentence is a complete year.",
    blocks: [
      { type: "h1", text: "{{year}}" },
      { type: "h2", text: "One sentence" },
      { type: "p", text: "" },
      { type: "h2", text: "Four quarters, optional" },
      { type: "p", text: "Q1 · Q2 · Q3 · Q4" },
      { type: "quote", text: "The year is a container, not a scoreboard." },
    ],
  },
  {
    id: "review-three",
    title: "Review — three open",
    slash: "/review",
    kicker: "Anytime · 3 min",
    cadence: "anytime",
    description: "Look at three open things. Carry, cancel, or do. Then stop.",
    tags: ["review", "adhd"],
    adhd: "Three. Then you're allowed to close the page.",
    blocks: [
      { type: "h1", text: "Review · {{date}}" },
      { type: "h2", text: "Three open" },
      { type: "task", text: "" },
      { type: "task", text: "" },
      { type: "task", text: "" },
      { type: "quote", text: "Carrying is not failing. [-] cancelled is allowed too." },
    ],
  },
  {
    id: "memo-voice",
    title: "Memo from a dump",
    slash: "/memo",
    kicker: "After talking · 2 min",
    cadence: "anytime",
    description: "Paste the messy voice dump. Enhance turns it into headers, tasks, and one insight.",
    tags: ["daily", "voice"],
    adhd: "Don't sort while talking. Sort after.",
    blocks: [
      { type: "h1", text: "Memo · {{date}}" },
      { type: "h2", text: "Raw" },
      { type: "p", text: "" },
      { type: "quote", text: "[!tip] Type /enhance when the dump is on the page." },
    ],
  },
];

export const TEMPLATES: TempoTemplate[] = DEFS.map((d) => ({ ...d, markdown: md(d.blocks) }));

export function templateBySlash(slash: string): TempoTemplate | undefined {
  const key = slash.startsWith("/") ? slash : `/${slash}`;
  return TEMPLATES.find((t) => t.slash === key.toLowerCase());
}

export function templateById(id: string): TempoTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function templateToJson(t: TempoTemplate): string {
  return JSON.stringify(
    {
      id: t.id,
      title: t.title,
      slash: t.slash,
      kicker: t.kicker,
      cadence: t.cadence,
      tags: t.tags,
      adhd: t.adhd,
      blocks: t.blocks,
      markdown: t.markdown,
    },
    null,
    2,
  );
}

export function renderTemplate(t: TempoTemplate, now = Date.now()): string {
  const d = new Date(now);
  const weekday = d.toLocaleDateString(undefined, { weekday: "long" });
  const date = d.toLocaleDateString(undefined, { month: "long", day: "numeric" });
  const year = String(d.getFullYear());
  const week = (() => {
    const tmp = new Date(d);
    tmp.setHours(0, 0, 0, 0);
    tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
    const week1 = new Date(tmp.getFullYear(), 0, 4);
    const n = 1 + Math.round(((tmp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    return `${tmp.getFullYear()}-W${String(n).padStart(2, "0")}`;
  })();
  return t.markdown
    .replaceAll("{{weekday}}", weekday)
    .replaceAll("{{date}}", date)
    .replaceAll("{{week}}", week)
    .replaceAll("{{year}}", year);
}

export type SlashItem = {
  id: string;
  slash: string;
  label: string;
  hint: string;
  insert: string;
  kind: "syntax" | "template" | "agent";
};

export const SLASH_SYNTAX: SlashItem[] = [
  { id: "task", slash: "/task", label: "Task", hint: "* [ ]  @time #tag", insert: "* [ ] ", kind: "syntax" },
  { id: "done", slash: "/done", label: "Done task", hint: "* [x] ", insert: "* [x] ", kind: "syntax" },
  { id: "moved", slash: "/moved", label: "Moved task", hint: "* [>] carried", insert: "* [>] ", kind: "syntax" },
  { id: "cancel", slash: "/cancel", label: "Cancelled task", hint: "* [-] ", insert: "* [-] ", kind: "syntax" },
  { id: "priority", slash: "/priority", label: "High priority", hint: "!! ", insert: "* [ ] !! ", kind: "syntax" },
  { id: "scheduled", slash: "/scheduled", label: "Schedule", hint: ">YYYY-MM-DD", insert: "* [ ]  >tomorrow", kind: "syntax" },
  { id: "remind", slash: "/remind", label: "Remind", hint: "@remind(2pm)", insert: "@remind(14:00) ", kind: "syntax" },
  { id: "repeat", slash: "/repeat", label: "Repeat", hint: "@repeat(weekly)", insert: "@repeat(weekly) ", kind: "syntax" },
  { id: "h1", slash: "/h1", label: "Heading 1", hint: "# ", insert: "# ", kind: "syntax" },
  { id: "h2", slash: "/h2", label: "Heading 2", hint: "## ", insert: "## ", kind: "syntax" },
  { id: "h3", slash: "/h3", label: "Heading 3", hint: "### ", insert: "### ", kind: "syntax" },
  { id: "quote", slash: "/quote", label: "Quote", hint: "> ", insert: "> ", kind: "syntax" },
  { id: "code", slash: "/code", label: "Code fence", hint: "```", insert: "```\n\n```\n", kind: "syntax" },
  {
    id: "table",
    slash: "/table",
    label: "Table",
    hint: "| a | b |",
    insert: "| | |\n| --- | --- |\n| | |\n",
    kind: "syntax",
  },
  { id: "wiki", slash: "/link", label: "Wiki link", hint: "[[Note]]", insert: "[[]]", kind: "syntax" },
  { id: "tag", slash: "/tag", label: "Tag", hint: "#tag", insert: "#", kind: "syntax" },
  { id: "time", slash: "/time", label: "Time", hint: "@09:30", insert: "@09:30 ", kind: "syntax" },
  {
    id: "highlight",
    slash: "/highlight",
    label: "Highlight", hint: "==text==",
    insert: "====",
    kind: "syntax",
  },
  {
    id: "callout",
    slash: "/note",
    label: "Callout",
    hint: "> [!note]",
    insert: "> [!note] ",
    kind: "syntax",
  },
  {
    id: "tip",
    slash: "/tip",
    label: "Tip callout",
    hint: "> [!tip]",
    insert: "> [!tip] ",
    kind: "syntax",
  },
  {
    id: "warn",
    slash: "/warn",
    label: "Warn callout",
    hint: "> [!warn]",
    insert: "> [!warn] ",
    kind: "syntax",
  },
];

export const SLASH_AGENTS: SlashItem[] = [
  {
    id: "enhance",
    slash: "/enhance",
    label: "Enhance with coach",
    hint: "Structure this dump",
    insert: "",
    kind: "agent",
  },
  {
    id: "cards",
    slash: "/cards",
    label: "Make study cards",
    hint: "Flashcards + quiz from this page",
    insert: "",
    kind: "agent",
  },
  {
    id: "guide",
    slash: "/guide",
    label: "Study guide",
    hint: "One-page guide from this page",
    insert: "",
    kind: "agent",
  },
  {
    id: "blank",
    slash: "/blank",
    label: "Fill-in blanks",
    hint: "Cloze from terms and ==highlights==",
    insert: "",
    kind: "agent",
  },
  {
    id: "pin-map",
    slash: "/pin",
    label: "Pin to map",
    hint: "One card on the whiteboard",
    insert: "",
    kind: "agent",
  },
  {
    id: "ask",
    slash: "/ask",
    label: "Ask about this page",
    hint: "Coach stays inside the notes",
    insert: "",
    kind: "agent",
  },
  {
    id: "carry",
    slash: "/carry",
    label: "Carry open to today",
    hint: "Move yesterday's open tasks",
    insert: "",
    kind: "agent",
  },
];

export const SLASH_ITEMS: SlashItem[] = [
  ...SLASH_SYNTAX,
  ...TEMPLATES.map((t) => ({
    id: t.id,
    slash: t.slash,
    label: t.title,
    hint: t.kicker,
    insert: t.markdown,
    kind: "template" as const,
  })),
  ...SLASH_AGENTS,
];

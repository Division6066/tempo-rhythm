import type { DumpItem } from "./studio";
import type { Task } from "./types";

const LINES = {
  quiet: [
    "Three things look doable. The rest can wait.",
    "Small on purpose. You can add more after.",
    "Noting it. We can look again tomorrow.",
  ],
  warm: [
    "You finished two of three yesterday. That counts. Want to start with the unfinished one, or a lighter warm-up?",
    "The dump looks heavy today. Three items feel like worries, not tasks. Want to park them, or look at one?",
    "You protected the afternoon yesterday. That was a hard call. Noting it.",
  ],
};

export function coachReply(input: {
  message: string;
  warmth: number;
  overdueTitles: string[];
  openTitles: string[];
}): string {
  const text = input.message.trim().toLowerCase();
  const warmth = input.warmth;
  const firstOverdue = input.overdueTitles[0];
  const firstOpen = input.openTitles[0];

  if (/walk|voice|talk/.test(text)) {
    return warmth >= 7
      ? "I'm here. Hold the button when you want to speak. I'll keep it short."
      : "Listening. Hold to talk, release to send.";
  }
  if (/park|later|tomorrow|not today/.test(text)) {
    return firstOverdue
      ? `Alright. ${firstOverdue} stays on the list. It will wait without a lecture.`
      : "Parked. Nothing is failed. We'll see it again when the day is quieter.";
  }
  if (/plan|today|what should/.test(text)) {
    return firstOpen
      ? `Start with “${firstOpen}”. If that's too much, pick the ten-minute walk instead.`
      : "Nothing staged yet. A brain dump is a fine first move.";
  }
  if (/avoid|put off|stuck|email/.test(text) && firstOverdue) {
    return warmth >= 6
      ? `You've opened “${firstOverdue}” more than once. Ten minutes, then stop. Or skip it honestly.`
      : `“${firstOverdue}” is still open. Ten minutes is enough.`;
  }
  if (/anxious|heavy|fog|tired|low spoon/.test(text)) {
    return "Low-spoons day. Three light things, then the laptop can close. That's a complete day.";
  }
  if (/thanks|thank you|nice/.test(text)) {
    return warmth >= 6 ? "Anytime. I'll stay quiet until you need me." : "Noted.";
  }

  const pool = warmth >= 6 ? LINES.warm : LINES.quiet;
  const pick = pool[Math.abs(hash(text)) % pool.length];
  if (firstOverdue && warmth >= 5) {
    return `${pick} Also: “${firstOverdue}” is still waiting, without a guilt trip.`;
  }
  return pick;
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

export function sortDump(raw: string): DumpItem[] {
  const bits = raw
    .split(/[\n.]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
  return bits.map((text, i) => {
    const lower = text.toLowerCase();
    let kind: DumpItem["kind"] = "task";
    if (/worr|anxious|enough|what if|feel/.test(lower)) kind = "worry";
    else if (/note|remember|idea/.test(lower)) kind = "note";
    else if (/feel|grateful|today i/.test(lower)) kind = "journal";
    return { id: `d_${Date.now()}_${i}`, kind, text, status: "pending" };
  });
}

export function dumpToTaskTitle(item: DumpItem): string {
  const t = item.text.replace(/^[-*]\s+/, "").replace(/^[A-Z]/, (c) => c);
  return t.length > 80 ? `${t.slice(0, 77)}…` : t;
}

export function titlesFromTasks(tasks: Task[]) {
  return tasks.map((t) => t.title);
}

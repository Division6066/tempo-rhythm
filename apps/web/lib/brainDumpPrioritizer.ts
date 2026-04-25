export type BrainDumpUrgency = "now" | "soon" | "later";

export type BrainDumpPriority = {
  title: string;
  reason: string;
  urgency: BrainDumpUrgency;
};

export type BrainDumpPlan = {
  summary: string;
  priorities: BrainDumpPriority[];
};

const NOW_KEYWORDS = [
  "asap",
  "urgent",
  "today",
  "tonight",
  "right away",
  "immediately",
  "deadline",
  "overdue",
  "late",
  "reply",
  "respond",
  "call",
  "pay",
  "submit",
  "meeting",
  "appointment",
];

const SOON_KEYWORDS = [
  "tomorrow",
  "this week",
  "soon",
  "next week",
  "follow up",
  "schedule",
  "plan",
  "review",
  "finish",
  "prep",
  "prepare",
  "draft",
  "organize",
];

const LATER_KEYWORDS = [
  "someday",
  "eventually",
  "later",
  "idea",
  "maybe",
  "optional",
  "sometime",
  "wishlist",
  "explore",
];

const ACTION_HINTS = [
  "call",
  "email",
  "reply",
  "send",
  "pay",
  "book",
  "schedule",
  "finish",
  "submit",
  "review",
  "write",
  "draft",
  "plan",
  "clean",
  "pick up",
  "buy",
  "fix",
  "cancel",
  "check",
  "ask",
  "follow up",
  "organize",
];

function titleCaseFirst(text: string) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function normalizeWhitespace(text: string) {
  return (
    text
      .replace(/\r\n/g, "\n")
      .replace(/\t/g, " ")
      // biome-ignore lint/suspicious/noControlCharactersInRegex: stripping C0/C1 control chars is the intent
      .replace(/[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function trimFiller(text: string) {
  return text.replace(
    /^(?:i need to|need to|i should|should|i have to|have to|must|remember to|don't forget to|dont forget to|please|pls|also|and|then|maybe|ugh|omg)\s+/i,
    ""
  );
}

function shortenTitle(text: string, limit = 78) {
  if (text.length <= limit) return text;
  const truncated = text.slice(0, limit);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${(lastSpace > 32 ? truncated.slice(0, lastSpace) : truncated).trim()}...`;
}

function startsWithAction(text: string) {
  const lowered = text.toLowerCase();
  return ACTION_HINTS.some((hint) => lowered.startsWith(`${hint} `) || lowered === hint);
}

function splitBrainDump(rawText: string) {
  const prepared = rawText
    .replace(/[•·▪]/g, "\n")
    .replace(/\s*-\s+/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();

  const lines = prepared
    .split("\n")
    .flatMap((line) => line.split(/\s*;\s*/))
    .flatMap((line) =>
      line.length > 90 ? line.split(/\s*,\s*(?=[a-zA-Z(])/).filter(Boolean) : [line]
    )
    .map((line) => normalizeWhitespace(trimFiller(line)))
    .filter((line) => line.length >= 3);

  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const line of lines) {
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(line);
  }

  if (deduped.length > 0) return deduped;

  const fallback = normalizeWhitespace(trimFiller(rawText));
  return fallback ? [fallback] : [];
}

function inferUrgency(fragment: string): BrainDumpUrgency {
  const lowered = fragment.toLowerCase();

  if (NOW_KEYWORDS.some((keyword) => lowered.includes(keyword))) {
    return "now";
  }

  if (LATER_KEYWORDS.some((keyword) => lowered.includes(keyword))) {
    return "later";
  }

  if (SOON_KEYWORDS.some((keyword) => lowered.includes(keyword))) {
    return "soon";
  }

  return startsWithAction(lowered) ? "now" : "soon";
}

function scoreFragment(fragment: string, urgency: BrainDumpUrgency) {
  let score = urgency === "now" ? 6 : urgency === "soon" ? 4 : 2;

  if (startsWithAction(fragment)) score += 2;
  if (fragment.length >= 18 && fragment.length <= 80) score += 1;
  if (/\b(and|or)\b/i.test(fragment)) score -= 1;
  if (/\?$/.test(fragment)) score -= 1;

  return score;
}

function buildReason(fragment: string, urgency: BrainDumpUrgency) {
  const lowered = fragment.toLowerCase();

  if (urgency === "now") {
    if (lowered.includes("deadline") || lowered.includes("today") || lowered.includes("urgent")) {
      return "Time-sensitive or explicitly urgent, so it should lead the list.";
    }

    if (startsWithAction(lowered)) {
      return "Clear action language makes this a strong next move instead of a vague note.";
    }

    return "This looks like an immediate open loop that can reduce pressure fast.";
  }

  if (urgency === "soon") {
    if (lowered.includes("plan") || lowered.includes("review") || lowered.includes("schedule")) {
      return "Important planning work, but it can follow the most urgent actions.";
    }

    return "Worth doing soon, though it does not read like the first fire to put out.";
  }

  return "Useful to keep visible, but it reads more like parking-lot work than today's first move.";
}

function summarize(priorities: BrainDumpPriority[]) {
  if (priorities.length === 0) {
    return "Nothing clear to organize yet. Add a few concrete worries, tasks, or reminders first.";
  }

  const nowCount = priorities.filter((item) => item.urgency === "now").length;
  const soonCount = priorities.filter((item) => item.urgency === "soon").length;
  const laterCount = priorities.filter((item) => item.urgency === "later").length;
  const opener = priorities[0]?.title.toLowerCase() ?? "the first item";

  if (nowCount >= 3) {
    return `Your dump has several immediate pulls. Start with ${opener}, then keep the rest of the "now" lane narrow.`;
  }

  if (soonCount > nowCount) {
    return `Most of this reads like important follow-through, not panic. Start with ${opener}, then work down the soon lane.`;
  }

  if (laterCount > 0) {
    return `You have a mix of active work and future parking-lot items. Start with ${opener} and let the later lane wait.`;
  }

  return `This dump already has usable shape. Start with ${opener} and keep the plan deliberately short.`;
}

export function prioritizeBrainDump(rawText: string): BrainDumpPlan {
  const fragments = splitBrainDump(rawText);

  const priorities = fragments
    .map((fragment) => {
      const urgency = inferUrgency(fragment);
      return {
        title: shortenTitle(titleCaseFirst(fragment)),
        reason: buildReason(fragment, urgency),
        urgency,
        score: scoreFragment(fragment, urgency),
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 6)
    .map(({ score: _score, ...priority }) => priority);

  return {
    summary: summarize(priorities),
    priorities,
  };
}

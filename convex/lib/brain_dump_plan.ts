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

function isUrgency(x: unknown): x is BrainDumpUrgency {
  return x === "now" || x === "soon" || x === "later";
}

function sanitizeText(text: string): string {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: stripping C0/C1 control chars is the intent
  return text.replace(/[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g, "").trim();
}

/**
 * Pure function that converts a model content string into a validated plan.
 * Throws a friendly Error on invalid shape. Strips C0/C1 control chars from string fields.
 */
export function parsePlanFromModelContent(content: string): BrainDumpPlan {
  const trimmed = content.trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence?.[1]) {
      try {
        parsed = JSON.parse(fence[1].trim());
      } catch {
        throw new Error("Could not read the plan format. Try again?");
      }
    } else {
      throw new Error("Could not read the plan format. Try again?");
    }
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Plan response was incomplete. Try again?");
  }

  const obj = parsed as Record<string, unknown>;
  const summary =
    typeof obj.summary === "string" ? sanitizeText(obj.summary) : "";
  if (!summary) {
    throw new Error("Plan response was incomplete. Try again?");
  }

  const rawList = obj.priorities;
  if (!Array.isArray(rawList)) {
    throw new Error("Plan response was incomplete. Try again?");
  }

  const priorities: BrainDumpPriority[] = [];
  for (const item of rawList) {
    if (priorities.length >= 6) break;
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const row = item as Record<string, unknown>;
    const title = typeof row.title === "string" ? sanitizeText(row.title) : "";
    const reason = typeof row.reason === "string" ? sanitizeText(row.reason) : "";
    const urgency = row.urgency;
    if (!title || !reason || !isUrgency(urgency)) continue;
    priorities.push({
      title: title.length > 200 ? `${title.slice(0, 197)}...` : title,
      reason: reason.length > 300 ? `${reason.slice(0, 297)}...` : reason,
      urgency,
    });
  }

  if (priorities.length === 0) {
    throw new Error("No clear items came back. Try a slightly longer list or run again?");
  }

  return { summary, priorities };
}

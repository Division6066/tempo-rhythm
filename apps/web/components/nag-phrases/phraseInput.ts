export type PhraseStatus = "accepted" | "proposed" | "rejected";

export type PhraseCheck = { ok: true; text: string } | { ok: false; message: string };

const MAX_PHRASE_LENGTH = 140;
const EMOJI = /\p{Extended_Pictographic}/u;

/** Trim, then reject empty, over-long, or emoji phrases. */
export function validatePhraseText(text: string): PhraseCheck {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, message: "Write a phrase in your own words." };
  }
  if (trimmed.length > MAX_PHRASE_LENGTH) {
    return { ok: false, message: "Keep it under 140 characters." };
  }
  if (EMOJI.test(trimmed)) {
    return { ok: false, message: "No emoji in nags." };
  }
  return { ok: true, text: trimmed };
}

/** Group phrases by status. Unknown statuses are left out. */
export function splitByStatus<T extends { status: PhraseStatus }>(phrases: readonly T[]) {
  const accepted: T[] = [];
  const proposed: T[] = [];
  const rejected: T[] = [];
  for (const phrase of phrases) {
    if (phrase.status === "accepted") {
      accepted.push(phrase);
    } else if (phrase.status === "proposed") {
      proposed.push(phrase);
    } else if (phrase.status === "rejected") {
      rejected.push(phrase);
    }
  }
  return { accepted, proposed, rejected };
}

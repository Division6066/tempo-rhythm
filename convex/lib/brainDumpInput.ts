export const BRAIN_DUMP_MAX_RAW_CHARS = 12_000;

export type BrainDumpInputValidation =
  | { ok: true; raw: string }
  | { ok: false; message: string };

/** Trim and validate brain-dump text before calling the model. */
export function validateBrainDumpInput(rawText: string): BrainDumpInputValidation {
  const raw = rawText.trim();
  if (!raw) {
    return {
      ok: false,
      message: "Paste something first — even a rough list is enough.",
    };
  }
  if (raw.length > BRAIN_DUMP_MAX_RAW_CHARS) {
    return {
      ok: false,
      message: `That is a lot at once (${raw.length} characters). Try the first chunk under ${BRAIN_DUMP_MAX_RAW_CHARS} characters, then run again on the rest.`,
    };
  }
  return { ok: true, raw };
}

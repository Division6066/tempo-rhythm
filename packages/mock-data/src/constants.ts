/**
 * Fixed reference instant for all fixture timestamps.
 * Aligns with design export copy: "Thursday · April 23" (screens-1) and
 * `2026-04-23.md` (screens-7 daily note).
 */
export const MOCK_REFERENCE_MS = 1776945600000; // 2026-04-23T12:00:00.000Z

/** Offset hours from {@link MOCK_REFERENCE_MS} → epoch ms. */
export function mockAtUtcHour(hour: number, minute = 0): number {
  return MOCK_REFERENCE_MS + (hour - 12) * 60 * 60 * 1000 + minute * 60 * 1000;
}

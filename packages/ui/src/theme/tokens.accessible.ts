/**
 * Comfortable-reading token overlay.
 *
 * Additive: base Tempo tokens stay in `tokens.ts`. This module describes
 * the alternate reading / accessibility set only — no hex, no new palette.
 */

export const accessibleReadingStorageKey = "tempo.comfortableReading";

export const accessibleReadingTokens = {
  fontSizeStepPx: 2,
  rootFontSizePx: 18,
  lineHeight: 1.7,
  paragraphSpacingPx: 20,
  motion: {
    standardDuration: "220ms",
    reducedDuration: "0ms",
  },
} as const;

export type AccessibleReadingTokens = typeof accessibleReadingTokens;

import type { TempoScreen } from "./tempo-nav";

/**
 * Pure search filter for the Command Palette.
 *
 * Matches against `title`, `slug`, and `category` (case-insensitive substring).
 * Empty / whitespace-only query returns the original list unchanged so the
 * palette opens with everything visible.
 */
export function filterScreens(
  screens: readonly TempoScreen[],
  query: string,
): readonly TempoScreen[] {
  const q = query.trim().toLowerCase();
  if (!q) return screens;
  return screens.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.slug.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q),
  );
}

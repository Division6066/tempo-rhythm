/** Integer 0–10. NaN and other non-finite values become the midpoint, 5. */
export function clampDial(n: number): number {
  const rounded = Math.round(n);
  if (!Number.isFinite(rounded)) return 5;
  return Math.min(10, Math.max(0, rounded));
}

/** 0–3 Gentle, 4–6 Steady, 7–10 Firm. Out-of-range values are clamped first. */
export function dialLabel(n: number): "Gentle" | "Steady" | "Firm" {
  const dial = clampDial(n);
  if (dial <= 3) return "Gentle";
  if (dial <= 6) return "Steady";
  return "Firm";
}

/** Whole minutes remaining until `panicUntil`. Never negative. Partial minutes round up. */
export function panicMinutesLeft(panicUntil: number | null, now: number): number {
  if (panicUntil === null || !Number.isFinite(panicUntil) || !Number.isFinite(now)) return 0;
  const remainingMs = panicUntil - now;
  if (remainingMs <= 0) return 0;
  return Math.ceil(remainingMs / 60_000);
}

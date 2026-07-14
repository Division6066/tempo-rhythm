/**
 * @generated-by: T-F008 scaffold — replace with T-F009* port.
 * @screen: habits
 * @platform: mobile
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx
 * @summary: Mobile habits with ring rows.
 * @notes: Copy placeholder from Claude export; copy pass in a later ticket.
 */
import { TempoEmptyState } from "@/components/TempoEmptyState";

export default function Screen() {
  return (
    <TempoEmptyState
      screenId="habits"
      title="Habits"
      summary="No habits are tracked yet. Start with something kind and repeatable when it feels useful."
      actionLabel="Choose a tiny habit"
    />
  );
}

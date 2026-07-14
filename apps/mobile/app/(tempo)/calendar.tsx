/**
 * @generated-by: T-F008 scaffold — replace with T-F009* port.
 * @screen: calendar
 * @platform: mobile
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx
 * @summary: Mobile calendar week view.
 * @notes: Copy placeholder from Claude export; copy pass in a later ticket.
 */
import { TempoEmptyState } from "@/components/TempoEmptyState";

export default function Screen() {
  return (
    <TempoEmptyState
      screenId="calendar"
      title="Calendar"
      summary="No events are connected yet. The calendar can stay open space until a real commitment belongs here."
      source="mobile/mobile-screens-b.jsx"
      actionLabel="Connect a calendar"
    />
  );
}

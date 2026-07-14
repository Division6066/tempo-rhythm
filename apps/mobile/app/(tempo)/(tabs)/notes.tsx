/**
 * @generated-by: T-F008 scaffold — replace with T-F009* port.
 * @screen: notes
 * @platform: mobile
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-a.jsx
 * @summary: Notes list.
 * @notes: Copy placeholder from Claude export; copy pass in a later ticket.
 */
import { TempoEmptyState } from "@/components/TempoEmptyState";

export default function Screen() {
  return (
    <TempoEmptyState
      screenId="notes"
      title="Notes"
      summary="No notes are saved yet. This can stay quiet until a thought feels worth catching."
      actionLabel="Capture a note"
    />
  );
}

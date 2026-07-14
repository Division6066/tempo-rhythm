/**
 * @generated-by: T-F008 scaffold — replace with T-F009* port.
 * @screen: journal
 * @platform: mobile
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx
 * @summary: Mobile journal.
 * @notes: Copy placeholder from Claude export; copy pass in a later ticket.
 */
import { TempoEmptyState } from "@/components/TempoEmptyState";

export default function Screen() {
  return (
    <TempoEmptyState
      screenId="journal"
      title="Journal"
      summary="No journal entries are here yet. A blank page is allowed to stay blank until reflection helps."
      actionLabel="Write one line"
    />
  );
}

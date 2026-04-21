import { DailyNoteScreen } from "@/components/tempo/screens/DailyNoteScreen";

/**
 * @screen: daily-note
 * @category: Flow
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 4, §11
 * @source: docs/design/claude-export/design-system/screens-1.jsx
 * @summary: Bare single-column daily note page (no sidebar).
 * @queries:
 *   - dailyNotes.getForDate
 * @mutations:
 *   - dailyNotes.updateBody
 *   - dailyNotes.save
 *   - profiles.toggleFocusMode
 * @auth: required
 */
export default function DailyNotePage() {
  return <DailyNoteScreen />;
}

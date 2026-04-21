import { JournalScreen } from "@/components/tempo/screens/JournalScreen";

/**
 * @screen: journal
 * @category: Library
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 6, §16
 * @source: docs/design/claude-export/design-system/screens-2.jsx (ScreenJournal)
 * @summary: Journal feed with today composer, mood tags, gentle prompt, and streak.
 * @queries:
 *   - journalEntries.listRecent
 *   - journalEntries.getDailyPrompt
 * @mutations:
 *   - journalEntries.saveDraft
 *   - journalEntries.setMood
 *   - journalEntries.commitEntry
 * @auth: required
 */
export default function JournalPage() {
  return <JournalScreen />;
}

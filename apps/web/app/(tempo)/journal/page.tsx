/**
 * @screen: journal
 * @category: Library
 * @summary: Today's journal entry — auto-saves on blur / 1s debounce.
 * @queries: journal.getByDate
 * @mutations: journal.upsertByDate
 * @auth: required
 * @status: live
 * @notes: Schema adds a `journalEntries` table; requires Convex push before the
 *         query/mutation resolve at runtime.
 */
import { JournalScreen } from "@/components/journal/JournalScreen";

export default function Page() {
  return <JournalScreen />;
}

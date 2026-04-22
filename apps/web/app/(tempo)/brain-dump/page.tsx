/**
 * @screen: brain-dump
 * @category: Flow
 * @summary: Rapid capture — dumps text into a dated note.
 * @queries: (none)
 * @mutations: notes.create
 * @auth: required
 * @status: live
 * @notes: Phase 3 will add AI extraction into tasks/notes via accept-reject proposals.
 */
import { BrainDumpScreen } from "@/components/brain-dump/BrainDumpScreen";

export default function Page() {
  return <BrainDumpScreen />;
}

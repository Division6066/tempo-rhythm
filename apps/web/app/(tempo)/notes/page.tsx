import { NotesScreen } from "@/components/tempo/screens/NotesScreen";

/**
 * @screen: notes
 * @category: Library
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 4, §13
 * @source: docs/design/claude-export/design-system/screens-2.jsx (ScreenNotes)
 * @summary: Notes index with type eyebrow, tags, search, and quick capture.
 * @queries:
 *   - notes.listAll
 *   - notes.search
 *   - notes.byId (detail)
 * @mutations:
 *   - notes.createBlank
 *   - notes.softDelete
 * @auth: required
 */
export default function NotesPage() {
  return <NotesScreen />;
}

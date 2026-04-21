import { NoteDetailScreen } from "@/components/tempo/screens/NoteDetailScreen";

type PageProps = {
  params: Promise<{ id: string }>;
};

/**
 * @screen: note-detail
 * @category: Library
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 5, §13
 * @source: docs/design/claude-export/design-system/screens-2.jsx (ScreenNoteEditor)
 * @summary: Note editor with title, body, tags, linked items, revisions, and
 * coach-powered extraction trigger.
 * @queries:
 *   - notes.byId
 *   - notes.listRevisions
 *   - notes.linkedEntities
 * @mutations:
 *   - notes.renameTitle
 *   - notes.updateBody
 *   - notes.togglePin
 *   - notes.addTag
 *   - notes.linkEntity
 * @actions:
 *   - notes.extractActions
 * @providers:
 *   - openrouter
 * @auth: required
 */
export default async function NoteDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <NoteDetailScreen noteId={id} />;
}

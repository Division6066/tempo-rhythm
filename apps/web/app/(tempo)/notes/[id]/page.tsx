/**
 * @generated-by: T-F004 scaffold — replace with T-F005* port.
 * @screen: note-detail
 * @category: Library
 * @source: docs/design/claude-export/design-system/screens-2.jsx
 * @summary: Rich-text note editor with slash commands.
 * @queries: notes.get
 * @mutations: notes.update
 * @auth: required
 * @notes: Copy placeholder from Claude export; copy pass in a later ticket.
 */
import { ScaffoldScreen } from "@/components/tempo/ScaffoldScreen";

type Params = { id: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return (
    <ScaffoldScreen
      title="Note editor"
      category="Library"
      source="screens-2.jsx"
      summary={`Rich-text note editor with slash commands. (id: ${id})`}
    />
  );
}

/**
 * @generated-by: T-F004 scaffold — replace with T-F005* port.
 * @screen: project-kanban
 * @category: Library
 * @source: docs/design/claude-export/design-system/screens-3.jsx#ScreenProjectKanban
 * @summary: Project kanban board.
 * @queries: projects.get, projects.tasks
 * @mutations: tasks.moveColumn
 * @auth: required
 * @notes: Copy placeholder from Claude export; copy pass in a later ticket.
 */
import { ScaffoldScreen } from "@/components/tempo/ScaffoldScreen";

type Params = { id: string };

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  return (
    <ScaffoldScreen
      title="Project kanban"
      category="Library"
      source="screens-3.jsx#ScreenProjectKanban"
      summary={`Project kanban board. (id: ${id})`}
    />
  );
}

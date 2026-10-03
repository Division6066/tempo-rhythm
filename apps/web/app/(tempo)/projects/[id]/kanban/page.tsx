/**
 * @screen: project-kanban
 * @category: Library
 * @source: docs/design/claude-export/design-system/screens-4.jsx
 * @summary: Project kanban leftover from #170. Status moves use tasks.update.
 * @queries: tasks.list
 * @mutations: tasks.update
 * @auth: required (gentle sign-in card otherwise)
 */
import { TaskKanbanBoard } from "@/components/tasks/TaskKanbanBoard";

type Params = { id: string };

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  return <TaskKanbanBoard projectSlug={id} />;
}

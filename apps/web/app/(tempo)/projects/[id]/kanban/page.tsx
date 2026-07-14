/**
 * @screen: project-kanban
 * @category: Library
 * @source: docs/design/claude-export/design-system/screens-4.jsx
 * @summary: Project kanban board.
 * @queries: tasks.list
 * @mutations: tasks.moveStatus
 * @auth: required
 */
import { TaskKanbanBoard } from "@/components/tasks/TaskKanbanBoard";

type Params = { id: string };

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  await params;
  return <TaskKanbanBoard />;
}

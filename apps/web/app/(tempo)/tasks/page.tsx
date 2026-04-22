/**
 * @screen: tasks
 * @category: Library
 * @summary: All tasks — list, quick-add, toggle complete.
 * @queries: tasks.list
 * @mutations: tasks.createQuick, tasks.toggleCompletion
 * @auth: required
 * @status: live
 */
import { TasksScreen } from "@/components/tasks/TasksScreen";

export default function Page() {
  return <TasksScreen />;
}

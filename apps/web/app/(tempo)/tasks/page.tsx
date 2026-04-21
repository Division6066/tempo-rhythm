import { TasksScreen } from "@/components/tempo/screens/TasksScreen";

/**
 * @screen: tasks
 * @category: Library
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 2, §12
 * @source: docs/design/claude-export/design-system/screens-2.jsx (ScreenTasks)
 * @summary: Task library with filter chips, search, and inline complete/reopen.
 * @queries:
 *   - tasks.listByFilter
 *   - tasks.search
 * @mutations:
 *   - tasks.complete
 *   - tasks.captureQuickAdd
 * @actions:
 *   - tasks.exportLibrary
 * @auth: required
 */
export default function TasksPage() {
  return <TasksScreen />;
}

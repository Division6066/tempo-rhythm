import { createFileRoute } from "@/lib/tempo-graft/router";
import { TasksView } from "@tempo-v0/components/tempo/tasks-view";

export const Route = createFileRoute("/tasks")({ component: TasksPage });

function TasksPage() {
  return <TasksView />;
}

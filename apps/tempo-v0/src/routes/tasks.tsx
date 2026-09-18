import { createFileRoute } from "@tanstack/react-router";
import { TasksView } from "@/components/tempo/tasks-view";

export const Route = createFileRoute("/tasks")({ component: TasksPage });

function TasksPage() {
  return <TasksView />;
}

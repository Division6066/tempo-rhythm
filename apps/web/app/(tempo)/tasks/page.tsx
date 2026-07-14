import { Suspense } from "react";
import { TasksScreen } from "@/components/tasks/TasksScreen";

export default function Page() {
  return (
    <Suspense>
      <TasksScreen />
    </Suspense>
  );
}

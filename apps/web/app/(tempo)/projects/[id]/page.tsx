import { Suspense } from "react";
import { TasksScreen } from "@/components/tasks/TasksScreen";

type Params = { id: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return (
    <Suspense>
      <TasksScreen defaultView="project" projectKey={id} />
    </Suspense>
  );
}

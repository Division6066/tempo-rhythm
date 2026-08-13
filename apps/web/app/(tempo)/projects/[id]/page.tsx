import { TaskViewsScreen } from "@/components/tasks/TaskViewsScreen";

type Params = { id: string };

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  return <TaskViewsScreen view="project" projectSlug={id} />;
}

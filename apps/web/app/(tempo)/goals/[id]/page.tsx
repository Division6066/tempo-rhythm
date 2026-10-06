import { GoalsScreen } from "@/components/goals/GoalsScreen";

type Params = { id: string };

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  return <GoalsScreen goalId={id} />;
}

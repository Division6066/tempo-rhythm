import { RoutineDetailClient } from "@/components/routines/RoutineDetailClient";

type Params = { id: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return <RoutineDetailClient routineId={id} />;
}

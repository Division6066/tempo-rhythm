/**
 * @generated-by: T-F004 scaffold — replace with T-F005* port.
 * @screen: routine-detail
 * @category: Library
 * @source: docs/design/claude-export/design-system/screens-3.jsx
 * @summary: Guided run of a routine.
 * @queries: routines.get
 * @mutations: routines.logRun
 * @auth: required
 * @notes: Copy placeholder from Claude export; copy pass in a later ticket.
 */
import { ScaffoldScreen } from "@/components/tempo/ScaffoldScreen";

type Params = { id: string };

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  return (
    <ScaffoldScreen
      title="Routine guided"
      category="Library"
      source="screens-3.jsx"
      summary={`Guided run of a routine. (id: ${id})`}
    />
  );
}

/**
 * @generated-by: T-F004 scaffold — replace with T-F005* port.
 * @screen: template-editor
 * @category: You
 * @source: docs/design/claude-export/design-system/screens-5.jsx
 * @summary: Legacy template editor.
 * @queries: (none)
 * @mutations: (none)
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
      title="Template editor (legacy)"
      category="You"
      source="screens-5.jsx"
      summary={`Legacy template editor. (id: ${id})`}
    />
  );
}

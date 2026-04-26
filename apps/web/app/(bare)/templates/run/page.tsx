/**
 * @generated-by: T-F004 scaffold — replace with T-F005* port.
 * @screen: template-run
 * @category: You
 * @source: docs/design/claude-export/design-system/screens-template-run.jsx
 * @summary: Landing for /templates/run — picks a template before /[id] runs it.
 * @queries: templates.list
 * @mutations: (none)
 * @auth: required
 * @notes: Stub landing so the navmap entry resolves; real picker ports later.
 */
import { ScaffoldScreen } from "@/components/tempo/ScaffoldScreen";

export default function Page() {
  return (
    <ScaffoldScreen
      title="Template run"
      category="You"
      source="screens-template-run.jsx"
      summary="Pick a template from the Templates library to start a run. Each /templates/run/[id] step lives at its own URL."
    />
  );
}

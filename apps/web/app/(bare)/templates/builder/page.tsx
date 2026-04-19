/**
 * @generated-by: T-F004 scaffold — replace with T-F005* port.
 * @screen: template-builder
 * @category: You
 * @source: docs/design/claude-export/design-system/screens-template-builder.jsx + -ui.jsx + -slash.jsx
 * @summary: Full-screen template builder with slash command DSL.
 * @queries: templates.get
 * @mutations: templates.save
 * @auth: required
 * @notes: Copy placeholder from Claude export; copy pass in a later ticket.
 */
import { ScaffoldScreen } from "@/components/tempo/ScaffoldScreen";

export default function Page() {
  return (
    <ScaffoldScreen
      title="Template builder"
      category="You"
      source="screens-template-builder.jsx + -ui.jsx + -slash.jsx"
      summary="Full-screen template builder with slash command DSL."
    />
  );
}

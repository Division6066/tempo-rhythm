/**
 * @generated-by: app-shell navigation scaffold — replace with feature port.
 * @screen: library
 * @category: Library
 * @source: docs/design/claude-export/design-system/app.html
 * @summary: Typed item repository for prompts, recipes, routines, formats, and references.
 * @queries: library.list
 * @mutations: (none)
 * @auth: required
 * @routes-to:
 *   - /library/[itemId]
 * @notes: Shell only. Feature agents own typed-item list behavior.
 */
import { ScaffoldScreen } from "@/components/tempo/ScaffoldScreen";

export default function Page() {
  return (
    <ScaffoldScreen
      title="Library"
      category="Library"
      source="app.html"
      summary="Typed item repository for prompts, recipes, routines, formats, and references."
    />
  );
}

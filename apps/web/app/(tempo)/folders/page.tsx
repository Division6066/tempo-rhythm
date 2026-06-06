/**
 * @generated-by: app-shell navigation scaffold — replace with feature port.
 * @screen: folders
 * @category: Library
 * @source: docs/brain/PRDs/PRD_Phase_1_MVP.md §4 Screen 19
 * @summary: Hierarchical folder tree and smart-folder shell.
 * @queries: folders.list
 * @mutations: folders.create, folders.reorder
 * @auth: required
 * @routes-to:
 *   - /notes
 *   - /library
 *   - /templates
 * @notes: Screen scaffold only; folder feature logic belongs to its feature ticket.
 */
import { ScaffoldScreen } from "@/components/tempo/ScaffoldScreen";

export default function Page() {
  return (
    <ScaffoldScreen
      title="Folders"
      category="Library"
      source="PRD_Phase_1_MVP.md §4 Screen 19"
      summary="Organization shell for notes, library items, and templates. Nothing has to be tidy before this screen is useful."
    />
  );
}

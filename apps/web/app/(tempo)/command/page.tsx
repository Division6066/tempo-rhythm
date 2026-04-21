import { CommandScreen } from "@/components/tempo/screens/CommandScreen";

/**
 * @screen: command
 * @category: You
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 27
 * @source: docs/design/claude-export/design-system/screens-5.jsx (ScreenCommand)
 * @summary: Full-screen index of every route, grouped by category.
 * @queries:
 *   - screens.listAll (static config)
 * @auth: required
 */
export default function CommandPage() {
  return <CommandScreen />;
}

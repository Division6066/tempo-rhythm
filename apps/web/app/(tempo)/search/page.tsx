import { SearchScreen } from "@/components/tempo/screens/SearchScreen";

/**
 * @screen: search
 * @category: You
 * @owner: cursor-cloud-2
 * @prd: PRD §4 Screen 26
 * @source: docs/design/claude-export/design-system/screens-5.jsx (ScreenSearch)
 * @summary: Single-box full-text search across tasks, notes, habits, journal, projects.
 * @queries:
 *   - search.unified
 * @auth: required
 */
export default function SearchPage() {
  return <SearchScreen />;
}

/**
 * @generated-by: T-F004 scaffold — replace with T-F005* port.
 * @screen: today
 * @category: Flow
 * @source: docs/design/claude-export/design-system/screens-1.jsx
 * @summary: Single-column daily canvas. Brain-dump composer + staged plan + coach suggestion.
 * @queries: tasks.listToday, calendar.listToday, coach.latestSuggestion
 * @mutations: tasks.capture, tasks.complete, tasks.stage
 * @routes-to: /brain-dump, /coach
 * @auth: required
 * @notes: Copy placeholder from Claude export; copy pass in a later ticket.
 */
import { ScaffoldScreen } from "@/components/tempo/ScaffoldScreen";

export default function Page() {
  return (
    <ScaffoldScreen
      title="Today"
      category="Flow"
      source="screens-1.jsx"
      summary="Single-column daily canvas. Brain-dump composer + staged plan + coach suggestion."
    />
  );
}

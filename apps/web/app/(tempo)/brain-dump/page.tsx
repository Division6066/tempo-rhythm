/**
 * @screen: brain-dump
 * @category: Flow
 * @source: docs/design/claude-export/design-system/screens-1.jsx
 * @summary: Rapid capture with auto-sort suggestions.
 * @queries: crisis.check, crisis.resourcesCard
 * @mutations: brain_dump.prioritize, brain_dump.acceptPlan
 * @auth: required
 */
import { BrainDumpScreen } from "@/components/brain-dump/BrainDumpScreen";

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-4xl p-8" data-testid="brain-dump-route">
      <BrainDumpScreen />
    </main>
  );
}

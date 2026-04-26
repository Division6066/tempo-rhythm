/**
 * @generated-by: app-shell navigation scaffold — replace with feature port.
 * @screen: rewards
 * @category: You
 * @source: docs/brain/PRDs/PRD_Phase_1_MVP.md §4 Screen 16
 * @summary: Rewards system shell centered on effort, not pressure.
 * @queries: rewards.list
 * @mutations: rewards.create, rewards.redeem
 * @auth: required
 * @routes-to:
 *   - /tasks
 *   - /habits
 * @notes: Inert scaffold only; rewards logic belongs to the relevant feature ticket.
 */
import { ScaffoldScreen } from "@/components/tempo/ScaffoldScreen";

export default function Page() {
  return (
    <ScaffoldScreen
      title="Rewards"
      category="You"
      source="PRD_Phase_1_MVP.md §4 Screen 16"
      summary="A future home for effort-aware rewards. No pressure here — just a place to make follow-through feel kinder."
    />
  );
}

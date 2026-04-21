import { ScaffoldScreen } from "@/components/tempo/ScaffoldScreen";

/**
 * @screen: about
 * @owner: cursor-cloud-3
 * @tier: A
 * @category: Marketing
 * @prd: PRD §14
 * @source: docs/design/claude-export/design-system/about.html
 * @summary: Founder bio, facts, philosophy.
 * @auth: public
 */
/**
 * @component: AboutNavBack
 * @behavior: Move users from About back to landing without entering auth flow.
 * @navigate: /
 * @prd: PRD §14
 * @source: docs/design/claude-export/design-system/about.html
 */
export default function Page() {
  return (
    <ScaffoldScreen
      title="About"
      category="Marketing"
      source="about.html"
      summary="Founder bio, facts, and philosophy."
    />
  );
}

import { createFileRoute } from "@/lib/tempo-graft/router";
import { MarkdownPage } from "@tempo-v0/components/marketing/markdown-page";
import { PRIVACY_MD } from "@tempo-v0/lib/content/pages";

export const Route = createFileRoute("/privacy")({ component: PrivacyPage });

function PrivacyPage() {
  return <MarkdownPage eyebrow="Privacy" source={PRIVACY_MD} />;
}

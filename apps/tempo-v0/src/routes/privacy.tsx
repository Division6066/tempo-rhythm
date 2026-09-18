import { createFileRoute } from "@tanstack/react-router";
import { MarkdownPage } from "@/components/marketing/markdown-page";
import { PRIVACY_MD } from "@/lib/content/pages";

export const Route = createFileRoute("/privacy")({ component: PrivacyPage });

function PrivacyPage() {
  return <MarkdownPage eyebrow="Privacy" source={PRIVACY_MD} />;
}

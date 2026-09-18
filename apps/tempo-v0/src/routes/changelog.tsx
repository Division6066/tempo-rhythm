import { createFileRoute } from "@/lib/tempo-graft/router";
import { MarkdownPage } from "@tempo-v0/components/marketing/markdown-page";
import { CHANGELOG_MD } from "@tempo-v0/lib/content/pages";

export const Route = createFileRoute("/changelog")({ component: ChangelogPage });

function ChangelogPage() {
  return <MarkdownPage eyebrow="Changelog" source={CHANGELOG_MD} />;
}

import { createFileRoute } from "@tanstack/react-router";
import { MarkdownPage } from "@/components/marketing/markdown-page";
import { CHANGELOG_MD } from "@/lib/content/pages";

export const Route = createFileRoute("/changelog")({ component: ChangelogPage });

function ChangelogPage() {
  return <MarkdownPage eyebrow="Changelog" source={CHANGELOG_MD} />;
}
